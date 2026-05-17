import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/utils/cn'

const icons = {
  info: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-card border animate-fade-in pointer-events-auto',
              'bg-card border-card-border',
              { 'border-l-4 border-l-success': t.type === 'success' },
              { 'border-l-4 border-l-error': t.type === 'error' },
              { 'border-l-4 border-l-warning': t.type === 'warning' },
              { 'border-l-4 border-l-accent': t.type === 'info' },
            )}
          >
            <Icon size={16} className="mt-0.5 shrink-0 text-text-secondary" />
            <p className="flex-1 text-sm text-text-primary">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
