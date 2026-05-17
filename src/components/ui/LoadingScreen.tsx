import { Wand2 } from 'lucide-react'
import { useAudioStore } from '@/store/useAudioStore'

const STAGES = [
  { threshold: 0,  label: 'App startet…' },
  { threshold: 20, label: 'Audio-Engine lädt…' },
  { threshold: 60, label: 'Verarbeitungs-Module laden…' },
  { threshold: 90, label: 'Fast fertig…' },
  { threshold: 100, label: 'Bereit!' },
]

interface LoadingScreenProps {
  onDismiss?: () => void
}

export function LoadingScreen({ onDismiss }: LoadingScreenProps) {
  const progress = useAudioStore((s) => s.ffmpegLoadProgress)
  const stage = [...STAGES].reverse().find((s) => progress >= s.threshold) ?? STAGES[0]

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent animate-pulse-soft">
          <Wand2 size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">SermonFix</h1>
        <p className="text-text-secondary text-sm">Audio-Reparatur für Predigten</p>
      </div>

      <div className="w-64 flex flex-col gap-3">
        <div className="h-1.5 bg-slider-track rounded-pill overflow-hidden">
          <div
            className="h-full bg-accent rounded-pill transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-text-secondary text-sm">{stage.label}</p>
      </div>

      {progress === 0 && onDismiss && (
        <button onClick={onDismiss} className="text-text-secondary text-xs underline mt-4">
          Ohne Export-Funktion starten
        </button>
      )}
    </div>
  )
}
