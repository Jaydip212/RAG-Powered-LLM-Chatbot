"""
app.py — Flask Backend for RAG Chatbot
Endpoints:
  POST /upload         — Upload and process a document
  POST /chat           — Ask a question
  GET  /history        — Get chat history for a session
  DELETE /documents    — Clear documents for a session
  GET  /files          — List uploaded files for a session
  GET  /health         — Health check
"""

import os
import json
import uuid
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from rag.document_processor import process_document
from rag.embedder import store_chunks, query_chunks, clear_session, get_session_document_count
from rag.llm_handler import get_answer

# ─── App Configuration ───────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
MAX_MB = int(os.environ.get("MAX_CONTENT_LENGTH_MB", 50))
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_MB * 1024 * 1024  # bytes

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory store for chat history and file metadata
# Structure: { session_id: { "history": [...], "files": [...] } }
sessions: dict = {}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_session(session_id: str) -> dict:
    if session_id not in sessions:
        sessions[session_id] = {"history": [], "files": []}
    return sessions[session_id]


def add_to_history(session_id: str, role: str, content: str, sources: list = None):
    session = get_session(session_id)
    entry = {
        "id": str(uuid.uuid4()),
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat(),
    }
    if sources is not None:
        entry["sources"] = sources
    session["history"].append(entry)


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })


@app.route("/upload", methods=["POST"])
def upload_document():
    """
    Upload and process a document.
    Expects: multipart/form-data with 'file' and 'session_id' fields.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    session_id = request.form.get("session_id", "default")

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    try:
        filename = secure_filename(file.filename)
        # Add session prefix to avoid collisions
        safe_name = f"{session_id}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, safe_name)
        file.save(file_path)

        # Process document → extract text → chunk
        chunks = process_document(file_path)

        # Store in ChromaDB
        stored = store_chunks(chunks, session_id)

        # Track file metadata in session
        session = get_session(session_id)
        # Remove if already uploaded with same name
        session["files"] = [f for f in session["files"] if f["name"] != filename]
        session["files"].append({
            "id": str(uuid.uuid4()),
            "name": filename,
            "size": os.path.getsize(file_path),
            "chunks": stored,
            "uploaded_at": datetime.now().isoformat(),
            "type": filename.rsplit(".", 1)[1].upper()
        })

        return jsonify({
            "success": True,
            "filename": filename,
            "chunks": stored,
            "message": f"Successfully processed {filename} into {stored} chunks."
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """
    Ask a question against uploaded documents.
    Expects JSON: { "question": str, "session_id": str }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    question = data.get("question", "").strip()
    session_id = data.get("session_id", "default")

    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400

    # Check if any documents are uploaded
    doc_count = get_session_document_count(session_id)
    if doc_count == 0:
        no_doc_msg = "📄 Please upload a document first before asking questions. Use the upload button in the sidebar."
        add_to_history(session_id, "user", question)
        add_to_history(session_id, "bot", no_doc_msg, sources=[])
        return jsonify({
            "answer": no_doc_msg,
            "sources": [],
            "question": question
        })

    # Log user question
    add_to_history(session_id, "user", question)

    try:
        # Retrieve relevant chunks
        relevant_chunks = query_chunks(question, session_id)

        # Get LLM answer
        answer = get_answer(question, relevant_chunks)

        # Format sources for response
        sources = [
            {
                "text": chunk["text"][:300] + "..." if len(chunk["text"]) > 300 else chunk["text"],
                "page": chunk["page"],
                "source": chunk["source"],
                "relevance": chunk.get("relevance", 0)
            }
            for chunk in relevant_chunks
        ]

        # Log bot response
        add_to_history(session_id, "bot", answer, sources=sources)

        return jsonify({
            "answer": answer,
            "sources": sources,
            "question": question
        })

    except Exception as e:
        error_msg = f"❌ Error: {str(e)}"
        add_to_history(session_id, "bot", error_msg, sources=[])
        return jsonify({"error": str(e)}), 500


@app.route("/history", methods=["GET"])
def get_history():
    """Get chat history for a session."""
    session_id = request.args.get("session_id", "default")
    session = get_session(session_id)
    return jsonify({"history": session["history"]})


@app.route("/files", methods=["GET"])
def get_files():
    """Get list of uploaded files for a session."""
    session_id = request.args.get("session_id", "default")
    session = get_session(session_id)
    return jsonify({"files": session["files"]})


@app.route("/documents", methods=["DELETE"])
def clear_documents():
    """Clear all documents and history for a session."""
    session_id = request.args.get("session_id", "default")

    # Clear ChromaDB collection
    success = clear_session(session_id)

    # Clear in-memory session
    if session_id in sessions:
        sessions[session_id] = {"history": [], "files": []}

    # Remove uploaded files
    try:
        for fname in os.listdir(UPLOAD_FOLDER):
            if fname.startswith(session_id + "_"):
                os.remove(os.path.join(UPLOAD_FOLDER, fname))
    except Exception:
        pass

    return jsonify({
        "success": success,
        "message": "All documents and chat history cleared."
    })


# ─── Error Handlers ──────────────────────────────────────────────────────────

@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": f"File too large. Maximum size is {MAX_MB}MB."}), 413


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5000))
    print("=" * 60)
    print("  RAG Chatbot Backend Starting...")
    print(f"  Server: http://localhost:{port}")
    print(f"  Uploads: {os.path.abspath(UPLOAD_FOLDER)}")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=port)
