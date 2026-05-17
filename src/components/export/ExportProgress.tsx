import { X } from 'lucide-react'
import { useFileStore } from '@/store/useFileStore'
import { cn } from '@/utils/cn'

export function ExportProgress() {
  const progress = useFileStore((s) => s.exportProgress)
  const isExporting = useFileStore((s) => s.isExporting)

  if (!isExporting || !progress) return null

  const overallPct = Math.round(((progress.fileIndex - 1) / progress.totalFiles) * 100 + progress.stepProgress / progress.totalFiles)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end animate-fade-in">
      <div className="w-full bg-card border-t border-card-border rounded-t-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-text-primary font-semibold">Wird verarbeitet…</p>
          <span className="text-text-secondary text-sm">
            {progress.fileIndex}/{progress.totalFiles}
          </span>
        </div>

        {/* Per-file progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary truncate max-w-[200px]">{progress.fileName}</span>
            <span className="text-text-secondary">{progress.stepProgress}%</span>
          </div>
          <div className="h-2 bg-slider-track rounded-pill overflow-hidden">
            <div
              className="h-full bg-accent rounded-pill transition-all duration-300"
              style={{ width: `${progress.stepProgress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary">{progress.stepLabel}</p>
        </div>

        {/* Overall progress */}
        {progress.totalFiles > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Gesamt</span>
              <span>{overallPct}%</span>
            </div>
            <div className="h-1 bg-slider-track rounded-pill overflow-hidden">
              <div
                className="h-full bg-accent/60 rounded-pill transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-center text-text-secondary">
          Bitte warte bis die Verarbeitung abgeschlossen ist
        </p>
      </div>
    </div>
  )
}
