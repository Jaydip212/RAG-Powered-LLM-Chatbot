"""
document_processor.py
Handles text extraction from PDF, DOCX, and TXT files.
Splits text into overlapping chunks with page metadata.
"""

import os
import pdfplumber
from docx import Document as DocxDocument
from typing import List, Dict, Any


CHUNK_SIZE = 500        # characters per chunk
CHUNK_OVERLAP = 80      # overlap between chunks


def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """Extract text from PDF by page. Returns list of {text, page, source}."""
    pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text and text.strip():
                    pages.append({
                        "text": text.strip(),
                        "page": page_num,
                        "source": os.path.basename(file_path)
                    })
    except Exception as e:
        raise RuntimeError(f"Failed to extract PDF: {str(e)}")
    return pages


def extract_text_from_docx(file_path: str) -> List[Dict[str, Any]]:
    """Extract text from DOCX. Treats every 5 paragraphs as one 'page'."""
    pages = []
    try:
        doc = DocxDocument(file_path)
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        page_size = 5
        for i in range(0, len(paragraphs), page_size):
            chunk_paragraphs = paragraphs[i:i + page_size]
            text = "\n".join(chunk_paragraphs)
            page_num = (i // page_size) + 1
            pages.append({
                "text": text,
                "page": page_num,
                "source": os.path.basename(file_path)
            })
    except Exception as e:
        raise RuntimeError(f"Failed to extract DOCX: {str(e)}")
    return pages


def extract_text_from_txt(file_path: str) -> List[Dict[str, Any]]:
    """Extract text from plain TXT file. Splits into virtual pages of ~1000 chars."""
    pages = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        virtual_page_size = 1000
        for i in range(0, len(content), virtual_page_size):
            chunk = content[i:i + virtual_page_size].strip()
            if chunk:
                page_num = (i // virtual_page_size) + 1
                pages.append({
                    "text": chunk,
                    "page": page_num,
                    "source": os.path.basename(file_path)
                })
    except Exception as e:
        raise RuntimeError(f"Failed to extract TXT: {str(e)}")
    return pages


def extract_text(file_path: str) -> List[Dict[str, Any]]:
    """Auto-detect file type and extract text."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_pages(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Split page texts into smaller overlapping chunks.
    Each chunk carries: text, page, source, chunk_id.
    """
    chunks = []
    chunk_id = 0

    for page_data in pages:
        text = page_data["text"]
        page = page_data["page"]
        source = page_data["source"]

        # Slide through the text with overlap
        start = 0
        while start < len(text):
            end = start + CHUNK_SIZE
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append({
                    "chunk_id": str(chunk_id),
                    "text": chunk_text,
                    "page": page,
                    "source": source
                })
                chunk_id += 1
            if end >= len(text):
                break
            start = end - CHUNK_OVERLAP  # overlap

    return chunks


def process_document(file_path: str) -> List[Dict[str, Any]]:
    """Full pipeline: extract → chunk. Returns list of chunk dicts."""
    pages = extract_text(file_path)
    if not pages:
        raise ValueError("No text could be extracted from the document.")
    chunks = chunk_pages(pages)
    return chunks
