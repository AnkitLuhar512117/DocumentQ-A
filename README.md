📄 docChat – AI Powered Document Q&A System

docChat is an intelligent document-based chatbot that allows users to upload documents (PDF, DOCX, TXT) and ask natural language questions.
It retrieves the most relevant context, processes it via embeddings & vector search, and answers directly and concisely using Groq LLM.

🚀 Features

📂 Upload & process .pdf, .docx, .txt

🔍 Extract text + split into semantic chunks

🧠 Store & retrieve embeddings via Pinecone

🤖 Precise answers with Groq LLM

🎯 Concise output (no unnecessary reasoning/explanations)

🎨 Simple & professional frontend with animations

⚡ Optimized for performance + accuracy

🛠️ Tech Stack

Frontend (Client)

React.js + Vite

TailwindCSS

Framer Motion (animations)

Backend (Server)

Node.js + Express

Multer (file uploads)

LangChain (text splitter, prompt templates)

Pinecone (vector database)

Cohere (embeddings)

Groq (LLM)

📂 Project Structure
docChat/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── DropBox.jsx
│   │   │   └── logo.jpg
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Chat.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                  # Express backend
│   ├── uploads/             # Temporary uploaded files
│   ├── app.js               # Main backend logic
│   ├── package.json
│   └── .env                 # API keys & config
│
└── README.md

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/AnkitLuhar512117/DocumentQ-A
cd DocumentQ-A

2️⃣ Setup Backend (Server)
cd server
npm install


Create a .env file inside server/:

PORT=8080

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index

# Cohere
COHERE_API_KEY=your_cohere_api_key

# Groq
GROQ_API_KEY=your_groq_api_key


Run the backend:

node app.js

3️⃣ Setup Frontend (Client)
cd ../client
npm install
npm run dev

🌐 API Endpoints

🔹 Health Check

GET /


🔹 Upload Document

POST /upload
Content-Type: multipart/form-data
file=<document.pdf>


🎨 Frontend Flow

Home.jsx → Clean UI with logo, intro & navigation

DropBox.jsx → Upload document (PDF/DOCX/TXT)

Chat.jsx → Starts chat session after successful upload

ChatBox.jsx → Chat interface with Q&A responses

🏗️ System Architecture & Workflow
Workflow

User uploads file via DropBox

Server extracts text → Splits into chunks

Embeddings generated via Cohere

Stored in Pinecone vector DB

User asks question in ChatBox

Query embedding generated → top-K results retrieved

Relevant context passed into Groq LLM

Concise answer returned to frontend

📊 Data Flow Diagram
[Client: Upload File]
        ↓
[Server: Extract Text]
        ↓
[Text Chunking & Embeddings]
        ↓
[Store Vectors in Pinecone]
        ↓
[Client: Ask Question]
        ↓
[Query → Embeddings]
        ↓
[Retrieve Top-K Context from Pinecone]
        ↓
[Groq LLM → Generate Answer]
        ↓
[Return Answer to ChatBox]

🔮 Future Scope

📑 Multi-document support

🔒 User authentication + document history

🖼 OCR support for scanned images

📊 Analytics dashboard

📱 Mobile responsive UI

🌍 Deployment

Backend: https://documentq-a-3.onrender.com

Frontend: https://document-q-a.vercel.app/

📑 Resume & Author

👨‍💻 Author: Ankit Luhar
📄 Resume: https://drive.google.com/file/d/1hrU9kB73nAcDDxEdne6gnx0RT3J_6-h3/view?usp=drive_link
💼 LinkedIn: https://www.linkedin.com/in/ankitluhar/
📧 Email: ankitluhar5121@gmail.com

📜 License

MIT License – Free to use and modify.
