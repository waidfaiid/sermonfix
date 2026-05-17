import { Check, Loader2, AlertCircle, X, Play } from 'lucide-react'
import type { BatchFile } from '@/types/file.types'
import { useFileStore } from '@/store/useFileStore'
import { formatTime } from '@/utils/audioMath'
import { cn } from '@/utils/cn'

interface FileItemProps {
  file: BatchFile
  isActive: boolean
}

const statusIcons = {
  pending: null,
  reference: null,
  queued: null,
  processing: Loader2,
  done: Check,
  error: AlertCircle,
}

export function FileItem({ file, isActive }: FileItemProps) {
  const { setActiveFile, removeFile } = useFileStore()
  const Icon = statusIcons[file.status]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group',
        isActive ? 'bg-accent/15 border border-accent/30' : 'hover:bg-card border border-transparent',
      )}
      onClick={() => setActiveFile(file.id)}
    >
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
        isActive ? 'bg-accent' : 'bg-card-border',
      )}>
        {Icon ? (
          <Icon
            size={14}
            className={cn(
              file.status === 'processing' && 'animate-spin',
              file.status === 'done' && 'text-success',
              file.status === 'error' && 'text-error',
            )}
          />
        ) : (
          <Play size={12} className={isActive ? 'text-white' : 'text-text-secondary'} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm truncate', isActive ? 'text-text-primary' : 'text-text-secondary')}>
          {file.name}
        </p>
        {file.duration > 0 && (
          <p className="text-xs text-text-secondary">{formatTime(file.duration)}</p>
        )}
        {file.error && (
          <p className="text-xs text-error truncate">{file.error}</p>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
        className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-error transition-all"
        aria-label="Entfernen"
      >
        <X size={14} />
      </button>
    </div>
  )
}
