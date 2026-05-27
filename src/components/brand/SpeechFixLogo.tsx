import { AudioLines } from 'lucide-react'
import { cn } from '@/utils/cn'
import { HeroWaveform } from '@/components/import/FeatureCarousel'

interface SpeechFixLogoProps {
  className?: string
  /** Kompakte Variante ohne Wellenform */
  compact?: boolean
}

export function SpeechFixLogo({ className, compact = false }: SpeechFixLogoProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center w-full max-w-[280px]',
        className,
      )}
    >
      <div
        className={cn(
          'w-full rounded-2xl border border-card-border/80 bg-card/50 backdrop-blur-sm',
          'shadow-lg shadow-black/25 overflow-hidden',
          compact ? 'px-3 py-2' : 'px-4 pt-3 pb-2',
        )}
      >
        <div className="flex items-center justify-center gap-2.5">
          <div
            className={cn(
              'shrink-0 rounded-xl bg-background border border-accent/25 flex items-center justify-center',
              compact ? 'w-9 h-9' : 'w-10 h-10',
            )}
          >
            <AudioLines
              className={cn('text-accent', compact ? 'w-5 h-5' : 'w-5 h-5')}
              aria-hidden
            />
          </div>
          <p className="text-[1.65rem] font-bold tracking-tight leading-none">
            <span className="text-white">Speech</span>
            <span className="text-accent">Fix</span>
          </p>
        </div>
        {!compact && (
          <div className="mt-2 pt-2 border-t border-card-border/50">
            <HeroWaveform size="md" className="opacity-90" />
          </div>
        )}
      </div>
    </div>
  )
}
