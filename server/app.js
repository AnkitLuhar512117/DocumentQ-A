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
import compression from "compression";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(compression());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Pinecone
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pc.index(process.env.PINECONE_INDEX);

// LLM model
const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0,
});

// Embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

// Prompt & Parser
const prompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant. Answer the user's question directly and concisely based on the given context.
Do NOT explain your reasoning.
Do NOT use tags like <think> or similar.
If the answer is not in the context, reply exactly: "Information not available in the provided document."

Context: {context}

Question: {input}

Answer:
`);
const parser = new StringOutputParser();

// Helper: load file content based on extension
async function loadFile(filePath, ext) {
  if (ext === ".pdf") {
    const loader = new PDFLoader(filePath, { splitPages: true });
    return loader.load();
  } else if (ext === ".docx") {
    const buffer = await fs.promises.readFile(filePath);
    const data = await mammoth.extractRawText({ buffer });
    return [{ pageContent: data.value, metadata: { source: filePath } }];
  } else if (ext === ".txt") {
    const text = await fs.promises.readFile(filePath, "utf-8");
    return [{ pageContent: text, metadata: { source: filePath } }];
  } else {
    throw new Error("Unsupported file type");
  }
}

// Upload endpoint (streamed + fast + isolated per document)
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = path.join(uploadsDir, req.file.filename);
  const ext = path.extname(req.file.originalname).toLowerCase();
  const documentId = uuidv4();

  try {
    const docs = await loadFile(filePath, ext);

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await splitter.splitDocuments(docs);

    // Parallel batching for speed
    const BATCH_SIZE = 50;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);

      // Embed in parallel
      const vectors = await embeddings.embedDocuments(
        batchChunks.map((c) => c.pageContent)
      );

      const upsertReqs = vectors.map((vec, idx) => ({
        id: `${documentId}-${i + idx}`,
        values: vec,
        metadata: {
          text: batchChunks[idx].pageContent,
          source: filePath,
          documentId,
        },
      }));

      // Upsert immediately
      await pineconeIndex.upsert(upsertReqs);
    }

    // Remove temp file
    await fs.promises.unlink(filePath);

    return res.status(200).json({
      message: "File uploaded and processed successfully",
      documentId,
      chunksProcessed: chunks.length,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    return res
      .status(500)
      .json({ error: "Upload failed", details: err.message });
  }
});

// Chat endpoint (per-document)
app.post("/chat", async (req, res) => {
  const { question, documentId } = req.body;
  if (!question || !documentId)
    return res
      .status(400)
      .json({ error: "Question and documentId are required" });

  try {
    const qVec = await embeddings.embedQuery(question);

    const results = await pineconeIndex.query({
      vector: qVec,
      topK: 10,
      includeMetadata: true,
      filter: { documentId },
    });

    if (!results.matches || results.matches.length === 0) {
      return res.status(200).json({
        answer: "Information not available in the provided document.",
        sourcesUsed: 0,
      });
    }

    const rankedDocs = results.matches
      .sort((a, b) => b.score - a.score)
      .map((m) => ({
        pageContent: m.metadata.text,
        metadata: { source: m.metadata.source },
      }));

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
      outputParser: parser,
    });

    const response = await chain.invoke({
      context: rankedDocs,
      input: question,
    });

    res.status(200).json({ answer: response, sourcesUsed: rankedDocs.length });
  } catch (err) {
    console.error("Chat failed:", err);
    res.status(500).json({ error: "Chat failed", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "Server running",
    version: "1.3.0",
    uploadsDirectory: uploadsDir,
  });
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
