import { useRef, useState } from 'react'
import {
  Upload, FileText, File, FilePen, Trash2, X,
  CheckCircle2, AlertCircle, FolderOpen, Loader2
} from 'lucide-react'

const FILE_TYPE_CONFIG = {
  PDF: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: FileText },
  DOCX: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: FilePen },
  TXT: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: File },
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function FileItem({ file, onRemove }) {
  const cfg = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.TXT
  const Icon = cfg.icon

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${cfg.bg} group transition-all duration-200`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{file.name}</p>
        <p className="text-xs text-white/40">
          {formatBytes(file.size)} • {file.chunks} chunks
        </p>
      </div>
      <button
        onClick={() => onRemove(file.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400"
        title="Remove file"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function Sidebar({ uploadedFiles, isUploading, uploadProgress, onUpload, onClearAll }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // { type: 'success'|'error', msg }

  const handleFiles = async (files) => {
    const allowedExt = ['.pdf', '.docx', '.txt']

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      if (!allowedExt.includes(ext)) {
        setUploadStatus({ type: 'error', msg: `"${file.name}" is not supported. Use PDF, DOCX, or TXT.` })
        setTimeout(() => setUploadStatus(null), 4000)
        continue
      }
      setUploadStatus(null)
      const result = await onUpload(file)
      if (result?.success) {
        setUploadStatus({ type: 'success', msg: `"${result.filename}" uploaded! ${result.chunks} chunks indexed.` })
        setTimeout(() => setUploadStatus(null), 3000)
      } else {
        setUploadStatus({ type: 'error', msg: result?.error || 'Upload failed.' })
        setTimeout(() => setUploadStatus(null), 4000)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFiles(files)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFiles(files)
      e.target.value = '' // reset
    }
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-1 pt-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #a855f7)' }}>
          <span className="text-white font-bold text-base">D</span>
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-none">DocuMind</h1>
          <p className="text-xs text-white/40 mt-0.5">RAG Chatbot</p>
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Upload Zone */}
      <div>
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
          Upload Documents
        </p>

        <div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer
            transition-all duration-300 group
            ${isDragging
              ? 'border-brand-500 bg-brand-500/10 shadow-glow'
              : 'border-white/15 hover:border-brand-500/50 hover:bg-white/5'
            }
            ${isUploading ? 'cursor-not-allowed opacity-70' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
              <div className="w-full">
                <div className="text-xs text-white/60 mb-1.5">Processing... {uploadProgress}%</div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 shimmer"
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #4f46e5, #a855f7)',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Upload className={`w-7 h-7 mx-auto mb-2 transition-colors duration-200 ${isDragging ? 'text-brand-400' : 'text-white/30 group-hover:text-brand-400'}`} />
              <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Drop files here
              </p>
              <p className="text-xs text-white/30 mt-1">PDF, DOCX, TXT • Max 50MB</p>
              <div className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-300 border border-brand-500/30 bg-brand-500/10">
                Browse Files
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Status Toast */}
        {uploadStatus && (
          <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-xs source-expand border ${
            uploadStatus.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {uploadStatus.type === 'success'
              ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            }
            <span>{uploadStatus.msg}</span>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">
            Loaded Files
          </p>
          {uploadedFiles.length > 0 && (
            <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-medium">
              {uploadedFiles.length}
            </span>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <FolderOpen className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-sm text-white/25 font-medium">No documents yet</p>
            <p className="text-xs text-white/15 mt-1">Upload a file to get started</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {uploadedFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={() => {/* individual remove — for now, use clear all */}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {uploadedFiles.length > 0 && (
        <button
          onClick={onClearAll}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
            border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold
            hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Documents
        </button>
      )}

      {/* Footer */}
      <p className="text-xs text-white/15 text-center pb-1">
        MCA Project • RAG Chatbot
      </p>
    </div>
  )
}

export default Sidebar
