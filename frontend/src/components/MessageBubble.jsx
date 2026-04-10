import { Bot, User } from 'lucide-react'
import SourceCard from './SourceCard'

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const isError = message.isError

  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end animate-slide-in-right">
        <div className="max-w-[75%] flex flex-col items-end gap-1">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed text-white shadow-glow-sm"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)',
            }}
          >
            {message.content}
          </div>
          <span className="text-xs text-white/30">{timeStr}</span>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
          <User className="w-4 h-4 text-white/70" />
        </div>
      </div>
    )
  }

  // Bot message
  return (
    <div className="flex items-start gap-3 animate-slide-in-left">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[80%] flex flex-col gap-1">
        <div
          className={`glass px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${
            isError ? 'border-red-500/30 text-red-300' : 'text-white/90'
          }`}
        >
          {/* Render text preserving line breaks */}
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'h-2' : ''}>
              {line}
            </p>
          ))}

          {/* Sources */}
          {!isError && message.sources && message.sources.length > 0 && (
            <SourceCard sources={message.sources} />
          )}
        </div>
        <span className="text-xs text-white/30 ml-1">{timeStr}</span>
      </div>
    </div>
  )
}

export { TypingIndicator }
export default MessageBubble
