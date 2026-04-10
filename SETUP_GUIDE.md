# DocuMind — RAG Powered AI Chatbot
## Complete Setup Guide (मराठीत)

---

## प्रोजेक्ट काय आहे?

हा एक AI chatbot आहे जो तुमच्या uploaded documents मधून answers देतो.
Upload kela PDF → Question vichar → Answer milto — **फक्त तुमच्या document मधून!**

---

## Step 1 — Python Install Check करा

PowerShell उघडा आणि type करा:

```powershell
python --version
```

> **Result असा यायला हवा:** `Python 3.14.3`
> जर Python नसेल तर python.org वरून install करा.

---

## Step 2 — Project Folder उघडा

```powershell
cd "F:\project 2026\RAG Powered LLM Chatbot"
```

---

## Step 3 — Gemini API Key मिळवा (Free आहे!)

1. Browser मध्ये जा: **https://aistudio.google.com/apikey**
2. Google account ने login करा
3. **"Create API key"** button वर click करा
4. एक key तयार होईल — ती copy करा
   - Key असी दिसते: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

## Step 4 — API Key `.env` File मध्ये Add करा

`backend/.env` ही file उघडा आणि त्यात replace करा:

```env
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
```

> ⚠️ `your_gemini_api_key_here` ही जागा तुमच्या actual key ने replace करा!

---

## Step 5 — Backend Python Packages Install करा

**नवीन PowerShell terminal उघडा** आणि हे run करा:

```powershell
cd "F:\project 2026\RAG Powered LLM Chatbot\backend"
pip install flask flask-cors python-dotenv pdfplumber python-docx google-generativeai langchain-google-genai chromadb sentence-transformers werkzeug
```

> ⏳ पहिल्यांदा install होताना थोडा वेळ लागेल (~5-10 minutes)

---

## Step 6 — Backend Start करा

```powershell
cd "F:\project 2026\RAG Powered LLM Chatbot\backend"
python app.py
```

> **असे दिसायला हवे:**
> ```
> ============================================================
>   RAG Chatbot Backend Starting...
>   Server: http://localhost:5000
> ============================================================
>  * Running on http://127.0.0.1:5000
> ```
>
> ✅ Terminal बंद करू नका — Backend चालू राहिला पाहिजे!

---

## Step 7 — Frontend Start करा

**दुसरी नवीन PowerShell terminal उघडा** आणि:

```powershell
cd "F:\project 2026\RAG Powered LLM Chatbot\frontend"
npm run dev
```

> **असे दिसायला हवे:**
> ```
> VITE v8.0.8  ready in 3153 ms
> ➜  Local:   http://localhost:5173/
> ```

---

## Step 8 — Browser मध्ये App उघडा

Browser मध्ये जा: **http://localhost:5173**

> ✅ Top-left corner मध्ये **"Backend Online"** (green badge) दिसायला हवे
> ❌ जर **"Backend Offline"** दिसत असेल तर Step 6 परत करा

---

## Step 9 — PDF Upload करा

1. Left sidebar मध्ये **"Drop files here"** area वर click करा
2. तुमची कोणतीही PDF / DOCX / TXT file select करा
3. "✅ Uploaded! X chunks indexed." असे message येईल

> **Demo साठी वापरता येणाऱ्या files:**
> - College notes PDF
> - Resume PDF
> - MCA syllabus PDF
> - कोणतीही text असलेली PDF

---

## Step 10 — Question विचारा आणि Test करा

Chat box मध्ये question type करा आणि Enter दाबा:

**Demo Questions:**
```
What is DBMS?
Summarize the main topics
What is normalization?
What are the skills mentioned?
```

> Bot फक्त uploaded document मधून answer देईल!
> जर answer नसेल तर म्हणेल: "The uploaded document does not contain this information."

---

## एका Click मध्ये Start करायचे असेल तर

Project folder मध्ये **`start.bat`** file आहे — ती double-click करा.
दोन्ही servers आपोआप start होतील आणि browser उघडेल.

> ⚠️ पण आधी Step 3 आणि Step 4 (API key add करणे) पूर्ण करणे जरुरी आहे!

---

## Common Problems आणि Solutions

| Problem | Solution |
|---------|----------|
| "Backend Offline" दिसत आहे | `python app.py` परत run करा |
| Upload होत नाही | File PDF/DOCX/TXT असेल पाहा, 50MB limit |
| "Invalid API key" error | `backend/.env` मधील key check करा |
| Bot answer देत नाही | API key add झाली आहे का check करा |
| `pip install` fail होतो | Python 3.14 आहे, packages एक-एक install करा |

---

## Project Files काय काय आहेत?

```
RAG Powered LLM Chatbot/
├── backend/
│   ├── app.py                ← Flask Server (main file)
│   ├── .env                  ← API Key येथे टाका ⭐
│   ├── requirements.txt      ← Python packages list
│   ├── uploads/              ← Upload केलेल्या files येथे जातात
│   ├── chroma_db/            ← Vector database (auto-created)
│   └── rag/
│       ├── document_processor.py  ← PDF text काढतो
│       ├── embedder.py            ← ChromaDB store करतो
│       └── llm_handler.py         ← Gemini AI ला query पाठवतो
│
├── frontend/
│   └── src/
│       ├── App.jsx           ← Main React App
│       ├── components/
│       │   ├── Header.jsx    ← Top bar
│       │   ├── Sidebar.jsx   ← Upload zone
│       │   ├── ChatWindow.jsx ← Chat area
│       │   ├── MessageBubble.jsx ← Messages
│       │   └── SourceCard.jsx ← Source citations
│       └── hooks/useChat.js  ← API communication
│
├── start.bat                 ← One-click launcher ⭐
└── README.md                 ← English documentation
```

---

## Tech Stack (Viva साठी)

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python Flask |
| AI/LLM | Google Gemini 1.5 Flash (Free) |
| Vector DB | ChromaDB |
| Embeddings | sentence-transformers (local) |
| PDF Read | pdfplumber + python-docx |

---

## Viva मध्ये विचारले जाणारे प्रश्न

**Q: RAG म्हणजे काय?**
Retrieval Augmented Generation — पहिले relevant text search करतो, मग LLM ला देतो answer generate करायला.

**Q: ChromaDB का वापरले?**
Text embeddings store करायला आणि similarity search करायला — fast आणि local आहे.

**Q: Embedding म्हणजे काय?**
Text चे numeric representation जे semantic meaning capture करते.

**Q: Chunking म्हणजे काय?**
Long document ला 500 character चे छोटे छोटे तुकड्यांत divide करणे.

**Q: Direct ChatGPT का नाही वापरला?**
ChatGPT hallucinate करू शकतो — RAG फक्त uploaded document मधूनच answer देतो.

---

*MCA Final Year Project — DocuMind RAG Chatbot*
