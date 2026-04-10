import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useChat } from './hooks/useChat'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import axios from 'axios'

// Generate a stable session ID (persisted in sessionStorage)
function getSessionId() {
  let id = sessionStorage.getItem('rag_session_id')
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    sessionStorage.setItem('rag_session_id', id)
  }
  return id
}

const SESSION_ID = getSessionId()

function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile sidebar
  const [backendOnline, setBackendOnline] = useState(false)

  const {
    messages,
    isLoading,
    uploadedFiles,
    isUploading,
    uploadProgress,
    uploadDocument,
    sendMessage,
    clearAll,
    clearChat,
  } = useChat(SESSION_ID)

  // Apply dark mode class to html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Ping backend health every 10s
  useEffect(() => {
    const check = async () => {
      try {
        await axios.get('http://localhost:5000/health', { timeout: 2000 })
        setBackendOnline(true)
      } catch {
        setBackendOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col overflow-hidden`}
      style={{ background: 'radial-gradient(ellipse at top left, #1a0a2e 0%, #0a0a14 40%, #0f0f1a 100%)' }}
    >
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((v) => !v)}
        backendOnline={backendOnline}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative top-0 left-0 h-full z-30 lg:z-auto
            w-72 flex-shrink-0 flex flex-col
            border-r border-white/5 bg-dark-900/80 backdrop-blur-xl
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ background: 'rgba(10,10,20,0.85)' }}
        >
          {/* Mobile close button */}
          <button
            className="absolute top-3 right-3 lg:hidden p-1.5 rounded-lg bg-white/10 text-white/50"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>

          <Sidebar
            uploadedFiles={uploadedFiles}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onUpload={uploadDocument}
            onClearAll={clearAll}
          />
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Mobile menu button */}
          <button
            className="absolute top-3 left-3 z-10 lg:hidden p-2 rounded-xl glass"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-white/70" />
          </button>

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
            onClearChat={clearChat}
            uploadedFiles={uploadedFiles}
          />
        </main>
      </div>
    </div>
  )
}

export default App
