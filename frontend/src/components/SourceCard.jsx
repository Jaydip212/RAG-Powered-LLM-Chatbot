import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, BookOpen, Hash } from 'lucide-react'

function SourceCard({ sources }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors duration-200 group"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span className="font-medium">
          {sources.length} source{sources.length > 1 ? 's' : ''} referenced
        </span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3 group-hover:translate-y-[-1px] transition-transform" />
        ) : (
          <ChevronDown className="w-3 h-3 group-hover:translate-y-[1px] transition-transform" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 source-expand">
          {sources.map((src, i) => (
            <div
              key={i}
              className="glass p-3 rounded-xl border border-brand-500/20 bg-brand-900/20"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-brand-300 truncate max-w-[160px]">
                    {src.source}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                    <Hash className="w-3 h-3" />
                    Page {src.page}
                  </span>
                  {src.relevance !== undefined && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: `rgba(124,108,243,${src.relevance * 0.4})`,
                        color: src.relevance > 0.7 ? '#a78bfa' : '#7c6cf3',
                        border: '1px solid rgba(124,108,243,0.2)',
                      }}
                    >
                      {Math.round(src.relevance * 100)}% match
                    </span>
                  )}
                </div>
              </div>

              {/* Source text */}
              <p className="text-xs text-white/60 leading-relaxed line-clamp-4">
                {src.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SourceCard
