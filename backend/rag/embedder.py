"""
embedder.py
Manages ChromaDB vector store.
Uses sentence-transformers for local embeddings (no API key needed).
Compatible with ChromaDB 1.x API.
"""

import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer

import chromadb


CHROMA_DB_PATH = os.environ.get("CHROMA_DB_PATH", "chroma_db")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
TOP_K_RESULTS = 4

# Lazy-load the model so it's only downloaded once
_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"[Embedder] Loading model '{EMBEDDING_MODEL}'... (first run may download ~90MB)")
        _model = SentenceTransformer(EMBEDDING_MODEL)
        print("[Embedder] Model loaded.")
    return _model


def _embed(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""
    model = _get_model()
    return model.encode(texts, show_progress_bar=False).tolist()


def _get_client() -> chromadb.PersistentClient:
    """Get persistent ChromaDB client."""
    os.makedirs(CHROMA_DB_PATH, exist_ok=True)
    return chromadb.PersistentClient(path=CHROMA_DB_PATH)


def _get_collection(session_id: str):
    """Get or create a ChromaDB collection for a session."""
    client = _get_client()
    collection_name = f"session_{session_id.replace('-', '_')}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )


def store_chunks(chunks: List[Dict[str, Any]], session_id: str) -> int:
    """
    Store text chunks with their embeddings in ChromaDB.
    Returns the number of chunks stored.
    """
    collection = _get_collection(session_id)

    documents = [c["text"] for c in chunks]
    metadatas = [
        {"page": str(c["page"]), "source": c["source"]} for c in chunks
    ]
    ids = [f"{session_id}_{c['chunk_id']}" for c in chunks]

    # Generate embeddings in one batch
    embeddings = _embed(documents)

    # Batch upsert
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        collection.upsert(
            documents=documents[i:i + batch_size],
            embeddings=embeddings[i:i + batch_size],
            metadatas=metadatas[i:i + batch_size],
            ids=ids[i:i + batch_size]
        )

    return len(documents)


def query_chunks(question: str, session_id: str, top_k: int = TOP_K_RESULTS) -> List[Dict[str, Any]]:
    """
    Query ChromaDB for the most relevant chunks.
    Returns list of {text, page, source, relevance}.
    """
    collection = _get_collection(session_id)

    count = collection.count()
    if count == 0:
        return []

    # Embed the question
    q_embedding = _embed([question])[0]

    results = collection.query(
        query_embeddings=[q_embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"]
    )

    sources = []
    if results and results.get("documents"):
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i] if results.get("metadatas") else {}
            distance = results["distances"][0][i] if results.get("distances") else 1.0
            # Cosine space: distance is 1 - similarity, so similarity = 1 - distance
            relevance = max(0.0, round(1.0 - distance, 3))
            sources.append({
                "text": doc,
                "page": meta.get("page", "?"),
                "source": meta.get("source", "unknown"),
                "relevance": relevance
            })

    return sources


def clear_session(session_id: str) -> bool:
    """Delete the ChromaDB collection for a session."""
    try:
        client = _get_client()
        collection_name = f"session_{session_id.replace('-', '_')}"
        try:
            client.delete_collection(collection_name)
        except Exception:
            pass  # Collection may not exist
        return True
    except Exception as e:
        print(f"[Embedder] Error clearing session: {e}")
        return False


def get_session_document_count(session_id: str) -> int:
    """Return number of chunks stored for a session."""
    try:
        collection = _get_collection(session_id)
        return collection.count()
    except Exception:
        return 0
