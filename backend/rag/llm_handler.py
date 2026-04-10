"""
llm_handler.py
Interfaces with Google Gemini 1.5 Flash API.
Builds the RAG prompt and returns structured answers with sources.
"""

import os
import google.generativeai as genai
from typing import List, Dict, Any


def _configure_gemini():
    """Configure Gemini with API key from environment."""
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError(
            "GOOGLE_API_KEY not set. Please add your Gemini API key to backend/.env\n"
            "Get a free key at: https://aistudio.google.com"
        )
    genai.configure(api_key=api_key)


def _build_prompt(question: str, context_chunks: List[Dict[str, Any]]) -> str:
    """Build the RAG prompt from context chunks and user question."""
    if not context_chunks:
        return f"""You are an intelligent document assistant.
        
No documents have been uploaded yet. Politely ask the user to upload a document first.

User Question: {question}"""

    # Build context block with source citations
    context_parts = []
    for i, chunk in enumerate(context_chunks, start=1):
        source_info = f"[Source {i}: {chunk['source']}, Page {chunk['page']}]"
        context_parts.append(f"{source_info}\n{chunk['text']}")

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""You are an intelligent assistant that answers questions ONLY from the provided document context below.

STRICT RULES:
1. Use ONLY the information from the Document Context below. Do NOT use outside knowledge.
2. If the answer is not in the context, respond exactly: "The uploaded document does not contain information about this topic."
3. Keep answers clear, concise, and well-structured.
4. When mentioning facts, reference the source like: (Source: filename.pdf, Page X)
5. If the question is a greeting or unrelated to the document, politely redirect to document-related questions.

Document Context:
---
{context}
---

User Question: {question}

Answer:"""
    return prompt


def get_answer(question: str, context_chunks: List[Dict[str, Any]]) -> str:
    """
    Send question + context to Gemini and return the answer.
    Falls back gracefully if API is unavailable.
    """
    try:
        _configure_gemini()
    except ValueError as e:
        return str(e)

    prompt = _build_prompt(question, context_chunks)

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.2,        # Low temp for factual answers
                "max_output_tokens": 1024,
                "top_p": 0.8,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "invalid" in error_msg.lower():
            return "❌ Invalid Gemini API key. Please check your backend/.env file."
        elif "quota" in error_msg.lower():
            return "⚠️ Gemini API quota exceeded. Please wait a minute and try again."
        else:
            return f"❌ Error generating response: {error_msg}"
