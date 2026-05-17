import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { useAudioStore } from '@/store/useAudioStore'
import { audioEngine } from '@/audio/AudioEngine'
import { formatTime } from '@/utils/audioMath'
import { cn } from '@/utils/cn'

export function TransportControls() {
  const { isPlaying, currentTime, duration } = useAudioStore()

  function togglePlay() {
    if (isPlaying) {
      audioEngine.pause()
      useAudioStore.getState().setIsPlaying(false)
    } else {
      audioEngine.play()
      useAudioStore.getState().setIsPlaying(true)
    }
  }

  function skip(delta: number) {
    const next = Math.max(0, Math.min(duration, currentTime + delta))
    audioEngine.seek(next)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="px-4 pb-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary w-10 tabular-nums">{formatTime(currentTime)}</span>
        <div className="flex-1 h-1 bg-slider-track rounded-pill overflow-hidden">
          <div
            className="h-full bg-accent rounded-pill transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-text-secondary w-10 tabular-nums text-right">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => skip(-10)}
          className="flex items-center justify-center w-11 h-11 rounded-full text-text-secondary hover:text-text-primary hover:bg-card transition-colors"
          aria-label="-10 Sekunden"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={togglePlay}
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-full transition-all active:scale-95',
            'bg-accent hover:bg-accent-hover text-white',
          )}
          aria-label={isPlaying ? 'Pause' : 'Abspielen'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
        </button>

        <button
          onClick={() => skip(10)}
          className="flex items-center justify-center w-11 h-11 rounded-full text-text-secondary hover:text-text-primary hover:bg-card transition-colors"
          aria-label="+10 Sekunden"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  )
}
