import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Initialize Pinecone
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pc.index(process.env.PINECONE_INDEX);

// Initialize Groq
const model = new ChatGroq({
  model: "deepseek-r1-distill-llama-70b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7,
});
//embeedings::
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

const prompt = ChatPromptTemplate.fromTemplate(`
  Answer the user's questions based on the provided context,and give the proper structured answer like a AI agent,answer should be short in length.
  Context: {context}
  Question: {input}
  Answer:
`);

const parser = new StringOutputParser();

// Upload & Process File
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(uploadsDir, req.file.filename);
  console.log("Processing file:", filePath);
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  let docs = [];

  try {
    // Process different file types
    if (fileExtension === ".pdf") {
      const loader = new PDFLoader(filePath);
      docs = await loader.load();
      console.log("PDF loaded successfully");
    } else if (fileExtension === ".docx") {
      const docxBuffer = await fs.promises.readFile(filePath);
      const docxData = await mammoth.extractRawText({ buffer: docxBuffer });
      docs = [{ pageContent: docxData.value, metadata: { source: filePath } }];
    } else if (fileExtension === ".txt") {
      const textContent = await fs.promises.readFile(filePath, "utf-8");
      docs = [{ pageContent: textContent, metadata: { source: filePath } }];
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });

    const chunks = await splitter.splitDocuments(docs);
    console.log(`Created ${chunks.length} chunks`);

    // Generate embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await embeddings.embedQuery(chunk.pageContent);
      // Upload to Pinecone
      await pineconeIndex.upsert([
        {
          id: `${req.file.filename}-${i}`,
          values: embedding,
          metadata: {
            text: chunk.pageContent,
            source: chunk.metadata.source,
            page: chunk.metadata.page || 1,
          },
        },
      ]);

      console.log(`Processed chunk ${i + 1}/${chunks.length}`);
    }

    // Clean up the uploaded file
    try {
      await fs.promises.unlink(filePath);
      console.log("Cleaned up uploaded file");
    } catch (err) {
      console.error("Error deleting uploaded file:", err);
    }

    res.status(200).json({
      message: "File processed successfully",
      chunksProcessed: chunks.length,
      pageCount: docs.length,
    });
  } catch (error) {
    console.error("File processing error:", error);
    // Attempt to clean up file if it exists
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.error("Error deleting file during cleanup:", err);
    }
    res.status(500).json({
      error: "Error processing file",
      details: error.message,
    });
  }
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  console.log("Received question:", question); // Debugging

  try {
    // Generate embedding for the question
    const questionEmbedding = await embeddings.embedQuery(question);

    // Retrieve relevant documents from Pinecone
    const results = await pineconeIndex.query({
      vector: questionEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    console.log("Retrieved Documents:", results.matches); // Debugging

    if (!results.matches || results.matches.length === 0) {
      return res.status(200).json({
        answer: "I couldn't find any relevant information.",
        sourcesUsed: 0,
      });
    }

    const retrievedDocs = results.matches.map((match) => ({
      pageContent: match.metadata.text, // Ensure correct format
      metadata: { source: match.metadata.source, page: match.metadata.page },
    }));

    // Create and execute the chain
    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
      outputParser: parser,
    });

    const response = await chain.invoke({
      context: retrievedDocs,
      input: question,
    });
    console.log(response);

    res.status(200).json({
      answer: response || "Sorry, I couldn't generate a response.",
      sourcesUsed: results.matches.length,
    });
  } catch (error) {
    console.error("Chat processing error:", error);
    res.status(500).json({
      error: "Error processing query",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    version: "1.0.0",
    uploadsDirectory: uploadsDir,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
