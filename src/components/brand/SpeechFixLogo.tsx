import { AudioLines } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SpeechFixLogoProps {
  className?: string
}

export function SpeechFixLogo({ className }: SpeechFixLogoProps) {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-center gap-3 px-1',
        className,
      )}
      aria-label="SpeechFix"
    >
      <AudioLines className="w-9 h-9 sm:w-10 sm:h-10 text-accent shrink-0" aria-hidden />
      <p className="text-[2rem] sm:text-[2.35rem] font-bold tracking-tight leading-none">
        <span className="text-white">Speech</span>
        <span className="text-accent">Fix</span>
      </p>
    </div>
  )
}
