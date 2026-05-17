import { Wand2 } from 'lucide-react'
import { useFileStore } from '@/store/useFileStore'

export function Header() {
  const files = useFileStore((s) => s.files)
  const activeFile = useFileStore((s) => s.getActiveFile())

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-card sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
          <Wand2 size={16} className="text-white" />
        </div>
        <span className="font-semibold text-text-primary text-base tracking-tight">SermonFix</span>
      </div>

      {activeFile && (
        <div className="flex-1 mx-4 min-w-0">
          <p className="text-text-secondary text-sm truncate text-center">
            {files.length > 1 ? `${files.length} Dateien` : activeFile.name}
          </p>
        </div>
      )}

      <div className="w-8" />
    </header>
  )
}
