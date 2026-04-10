import { useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:5000'

export function useChat(sessionId) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // ── Upload Document ───────────────────────────────────────────────────────
  const uploadDocument = useCallback(async (file) => {
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_id', sessionId)

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setUploadProgress(pct)
        },
      })

      const fileData = {
        id: Date.now().toString(),
        name: res.data.filename,
        chunks: res.data.chunks,
        size: file.size,
        type: file.name.split('.').pop().toUpperCase(),
        uploadedAt: new Date().toISOString(),
      }

      setUploadedFiles((prev) => {
        // Remove duplicate if same name
        const filtered = prev.filter((f) => f.name !== fileData.name)
        return [...filtered, fileData]
      })

      return { success: true, ...res.data }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed'
      return { success: false, error: msg }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [sessionId])

  // ── Send Chat Message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || isLoading) return

    // Add user message immediately
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        question,
        session_id: sessionId,
      })

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: res.data.answer,
        sources: res.data.sources || [],
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMsg])
      return botMsg
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `❌ ${err.response?.data?.error || 'Failed to get response. Make sure the backend is running.'}`,
        sources: [],
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, isLoading])

  // ── Clear All ─────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE}/documents?session_id=${sessionId}`)
    } catch (err) {
      console.warn('Clear API call failed:', err.message)
    }
    setMessages([])
    setUploadedFiles([])
  }, [sessionId])

  // ── Clear Chat Only ───────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    uploadedFiles,
    isUploading,
    uploadProgress,
    uploadDocument,
    sendMessage,
    clearAll,
    clearChat,
  }
}
