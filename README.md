# DocuMind — RAG Powered AI Document Chatbot

> **MCA College Project** | RAG Based Intelligent Document Question Answering System

Upload PDFs, DOCX, or TXT files and ask questions. The AI answers **only from your uploaded documents** using Retrieval Augmented Generation (RAG).

---

## 🚀 Quick Start

### Step 1 — Get a Free Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API Key"** → Create new key
3. Copy the key

### Step 2 — Set Your API Key
Open `backend/.env` and replace:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```
with your actual key.

### Step 3 — Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```
> ⚠️ First run downloads the embedding model (~90MB). This only happens once.

### Step 4 — Start the Backend
```powershell
python app.py
```
Backend runs at: `http://localhost:5000`

### Step 5 — Start the Frontend (new terminal)
```powershell
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 📁 Project Structure

```
rag-chatbot/
├── frontend/                    ← React + Vite + Tailwind UI
│   └── src/
│       ├── components/
│       │   ├── Header.jsx       ← Dark mode, backend status
│       │   ├── Sidebar.jsx      ← Upload zone + file list
│       │   ├── ChatWindow.jsx   ← Message area + input
│       │   ├── MessageBubble.jsx ← User/bot bubbles
│       │   └── SourceCard.jsx   ← Source citations
│       └── hooks/useChat.js     ← All state + API logic
│
└── backend/
    ├── app.py                   ← Flask server + routes
    ├── rag/
    │   ├── document_processor.py ← Extract + chunk text
    │   ├── embedder.py           ← ChromaDB operations
    │   └── llm_handler.py        ← Gemini API calls
    ├── uploads/                  ← Uploaded files
    ├── chroma_db/                ← Vector database
    └── requirements.txt
```

---

## 🧠 How It Works (RAG Pipeline)

```
User uploads PDF
     ↓
Extract text (pdfplumber)
     ↓
Split into 500-char chunks
     ↓
Generate embeddings (sentence-transformers)
     ↓
Store in ChromaDB (vector DB)
     ↓
User asks question
     ↓
Find top 4 matching chunks (cosine similarity)
     ↓
Send question + chunks to Gemini 1.5 Flash
     ↓
Return answer + source page numbers
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload & process a document |
| `POST` | `/chat` | Ask a question |
| `GET` | `/history` | Get chat history |
| `GET` | `/files` | List uploaded files |
| `DELETE` | `/documents` | Clear all documents |
| `GET` | `/health` | Backend health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Python Flask, Flask-CORS |
| RAG | LangChain, ChromaDB |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Google Gemini 1.5 Flash |
| PDF Parser | pdfplumber, python-docx |

---

## ✨ Features

- 📄 Upload PDF, DOCX, TXT files
- 🔍 Semantic search across documents
- 💬 Chat interface with animated bubbles
- 📖 Source citations with page numbers
- 🌙 Dark mode
- 📱 Responsive (mobile + desktop)
- 📡 Backend health indicator
- 🧹 Clear chat / clear documents

---

## 🎓 Viva Q&A

**Q: What is RAG?**
RAG (Retrieval Augmented Generation) retrieves relevant text chunks from a vector database, then passes them as context to an LLM to generate grounded answers.

**Q: What is ChromaDB?**
An open-source vector database that stores text embeddings and enables fast similarity search.

**Q: What are embeddings?**
Numeric vector representations of text that capture semantic meaning, enabling similarity comparison.

**Q: What is chunking?**
Breaking long documents into smaller overlapping pieces (500 chars with 80 char overlap) for better retrieval accuracy.

**Q: Why not just use ChatGPT directly?**
ChatGPT may hallucinate or use training data. RAG ensures answers come only from uploaded documents.

---

## 👨‍🎓 Project Info

- **Project Title**: RAG Based Intelligent Document Question Answering System  
- **Technology**: React, Python Flask, LangChain, ChromaDB, Gemini API  
- **Type**: MCA Final Year Project
