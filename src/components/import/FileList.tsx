import { useRef } from 'react'
import { Plus } from 'lucide-react'
import { useFileStore } from '@/store/useFileStore'
import { FileItem } from './FileItem'

const ACCEPTED = '.mp3,.wav,.aiff,.flac,.aac,.m4a,.ogg,.wma'

export function FileList() {
  const { files, activeFileId, addFiles } = useFileStore()
  const inputRef = useRef<HTMLInputElement>(null)

  if (files.length <= 1) return null

  return (
    <div className="px-4 pb-4">
      <div className="bg-card border border-card-border rounded-card p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Weitere Dateien
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
          >
            <Plus size={12} />
            Hinzufügen
          </button>
        </div>

        <div className="space-y-1">
          {files.slice(1).map((file) => (
            <FileItem key={file.id} file={file} isActive={file.id === activeFileId} />
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
      </div>
    </div>
  )
}
