import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AudioLines,
  Lock,
  Zap,
  Headphones,
  Church,
  Podcast,
  Mic,
  Radio,
  Download,
  SlidersHorizontal,
  Upload,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useInView } from '@/hooks/useInView'
import { useAudioFilePicker } from '@/hooks/useAudioFilePicker'
import { FileUploadArea } from './FileUploadArea'
import { HeroWaveform } from './FeatureCarousel'

const USE_CASES = [
  { icon: Mic, label: 'Predigten & Vorträge', desc: 'Klarere Stimme für Podcast & Kirche' },
  { icon: Radio, label: 'Aufnahmen reparieren', desc: 'Brummen, Rauschen, Zischen entfernen' },
  { icon: Download, label: 'Schnell exportieren', desc: 'Ohne DAW — direkt im Browser' },
] as const

const BENEFITS: ReadonlyArray<{ icon: LucideIcon; text: string }> = [
  { icon: Zap, text: 'Sofort starten, keine Anmeldung' },
  { icon: Sparkles, text: 'Keine Vorkenntnisse nötig' },
  { icon: SlidersHorizontal, text: 'Jeder Effekt intuitiv mit einem Regler einstellbar' },
]

const WORKFLOW_STEPS = [
  { icon: Upload, label: 'Importieren', hint: 'Aufnahme rein' },
  { icon: Headphones, label: 'Hören', hint: 'Unterschied merken' },
  { icon: SlidersHorizontal, label: 'Regler', hint: 'justieren' },
  { icon: Download, label: 'Exportieren', hint: 'speichern' },
  { icon: CheckCircle2, label: 'Fertig', hint: 'teilen' },
] as const

function WorkflowJourney() {
  return (
    <div
      className="w-full mt-2 rounded-xl border border-accent/25 bg-gradient-to-br from-accent/8 via-card/70 to-card/40 p-3.5 shadow-inner shadow-black/20"
      aria-label="Ablauf in fünf Schritten"
    >
      <p className="text-[11px] font-semibold text-white text-center leading-snug">
        Vom Mitschnitt zur fertigen Datei
      </p>
      <p className="text-[10px] text-text-secondary text-center mt-0.5 mb-3">
        Fünf Schritte — ohne Umwege
      </p>
      <ol className="flex items-start justify-between gap-0">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon
          const isLast = index === WORKFLOW_STEPS.length - 1
          return (
            <li key={step.label} className="flex flex-1 min-w-0 items-start">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-background/90 border border-accent/35 flex items-center justify-center shadow-sm shadow-black/25">
                  <Icon className="w-3.5 h-3.5 text-accent" aria-hidden />
                </div>
                <span className="mt-1.5 text-[9px] font-semibold text-white text-center leading-tight px-0.5">
                  {step.label}
                </span>
                <span className="text-[8px] text-text-secondary text-center leading-tight px-0.5">
                  {step.hint}
                </span>
              </div>
              {!isLast && (
                <ChevronRight
                  className="w-3 h-3 text-accent/50 shrink-0 mt-2.5 -mx-0.5"
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <section
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className,
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </section>
  )
}

export function ImportLanding() {
  const picker = useAudioFilePicker()

  return (
    <article className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-none">
      <header className="relative px-4 pt-8 pb-4 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-card border border-card-border flex items-center justify-center shadow-lg shadow-black/30">
            <AudioLines className="w-7 h-7 text-accent" aria-hidden />
          </div>
          <HeroWaveform />
          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Sprach-Audio
            <span className="text-accent"> reparieren</span>
          </h2>
          <p className="text-text-secondary text-sm leading-snug max-w-[300px]">
            Professionelle Audio Aufbereitung
            <br />
            für Reden, Predigten und Podcasts
            <br />
            — direkt im Browser.
          </p>
          <div
            className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-success/10 border border-success/30 text-success text-center max-w-[300px]"
            role="status"
          >
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold leading-snug">
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>100&nbsp;% lokal — kein Upload, kein Server</span>
            </div>
            <p className="text-[10px] font-medium leading-snug text-success/95 px-1">
              alles wird ausschließlich auf deinem Gerät berechnet
            </p>
          </div>
          <div className="w-full mt-2">
            <FileUploadArea variant="landing" picker={picker} />
          </div>
          <ul className="w-full mt-3 space-y-1.5 text-left">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-card/50 border border-card-border/70"
              >
                <Icon className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" aria-hidden />
                <span className="text-[11px] text-text-primary leading-snug">{text}</span>
              </li>
            ))}
          </ul>
          <WorkflowJourney />
        </div>
      </header>

      <div className="px-4 flex flex-col gap-8 pb-8">
        <RevealSection delay={80}>
          <h3 className="text-[11px] font-tech uppercase tracking-widest text-text-secondary mb-3">
            Ideal für
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {USE_CASES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex gap-3 p-3 rounded-lg border border-card-border bg-card-elevated/50"
              >
                <div className="w-9 h-9 rounded-lg bg-background border border-card-border flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-text-secondary bg-background border border-card-border px-2.5 py-1 rounded-pill">
              <Church className="w-3 h-3 text-accent" aria-hidden /> Gemeinde & Kirche
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-text-secondary bg-background border border-card-border px-2.5 py-1 rounded-pill">
              <Podcast className="w-3 h-3 text-accent" aria-hidden /> Podcast & Video
            </span>
          </div>
        </RevealSection>

      </div>

      <div className="sr-only">
        <p>
          SpeechFix ist ein Browser-Tool zur Audio-Reparatur von Sprachaufnahmen:
          KI-Rauschunterdrückung, Brummfilter, EQ, Kompressor, De-Esser, Exciter und Export.
          Alle Verarbeitung erfolgt lokal ohne Upload.
        </p>
      </div>
    </article>
  )
}
