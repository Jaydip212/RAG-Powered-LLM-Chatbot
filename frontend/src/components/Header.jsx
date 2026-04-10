import { Moon, Sun, Wifi, WifiOff } from 'lucide-react'

function Header({ darkMode, onToggleDark, backendOnline }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/2 backdrop-blur-sm">
      {/* Left — status */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          backendOnline
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {backendOnline ? (
            <><Wifi className="w-3 h-3" /> Backend Online</>
          ) : (
            <><WifiOff className="w-3 h-3" /> Backend Offline</>
          )}
        </div>
      </div>

      {/* Center — Title */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2">
        <p className="text-sm font-semibold gradient-text">
          RAG Powered Document Intelligence
        </p>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-2">
        <a
          href="https://aistudio.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs hidden md:flex items-center gap-1.5"
        >
          <span>Get API Key</span>
        </a>

        <button
          onClick={onToggleDark}
          className="btn-ghost p-2 rounded-xl"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-brand-400" />
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
