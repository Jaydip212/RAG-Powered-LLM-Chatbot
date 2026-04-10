import { useEffect, useRef, useState } from 'react'
import { Send, Trash2, MessageSquare, Sparkles } from 'lucide-react'
import MessageBubble, { TypingIndicator } from './MessageBubble'

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  content:
    "👋 Hello! I'm DocuMind, your AI document assistant.\n\nUpload a PDF, DOCX, or TXT file using the sidebar, then ask me anything about it. I'll answer only from your uploaded content.\n\nTry uploading your college notes and asking:\n• \"What is the definition of DBMS?\"\n• \"Summarize chapter 3\"\n• \"What are the main topics covered?\"",
  sources: [],
  timestamp: new Date().toISOString(),
}

function ChatWindow({ messages, isLoading, onSend, onClearChat, uploadedFiles }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const displayMessages = messages.length === 0 ? [WELCOME_MSG] : messages

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">DocuMind AI</h2>
            <p className="text-xs text-white/40">
              {uploadedFiles.length > 0
                ? `${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''} loaded`
                : 'No documents loaded'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="btn-ghost flex items-center gap-2 text-white/50 hover:text-red-400"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
        {displayMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-white/5">
        {uploadedFiles.length === 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-yellow-400 text-xs">⚠️</span>
            <p className="text-xs text-yellow-300/80">Upload a document first to start chatting</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                uploadedFiles.length > 0
                  ? 'Ask a question about your documents...'
                  : 'Upload a document to start asking questions...'
              }
              rows={1}
              style={{ resize: 'none', minHeight: '48px', maxHeight: '140px' }}
              className="input-field pr-4 leading-relaxed"
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-brand flex items-center gap-2 flex-shrink-0 h-12"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        <p className="text-xs text-white/20 mt-2 text-center">
          Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/40 text-xs">Enter</kbd> to send •{' '}
          <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/40 text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
