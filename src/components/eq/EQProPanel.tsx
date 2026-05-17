import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useProcessingStore } from '@/store/useProcessingStore'
import { useUIStore } from '@/store/useUIStore'
import { EQGraph } from './EQGraph'
import { EQ_PRESETS, type EQPresetKey } from '@/utils/eqCurves'
import * as RadixSlider from '@radix-ui/react-slider'
import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '@/utils/cn'
import type { BiquadFilterType } from '@/types/audio.types'

const PRESET_LABELS: Record<EQPresetKey, string> = {
  speech_neutral: 'Standard',
  speech_warm: 'Warm',
  speech_bright: 'Brillant',
  podcast: 'Podcast',
  flat: 'Flach',
}

const FILTER_TYPES: { value: BiquadFilterType; label: string }[] = [
  { value: 'peaking', label: 'Peaking' },
  { value: 'highshelf', label: 'High Shelf' },
  { value: 'lowshelf', label: 'Low Shelf' },
  { value: 'highpass', label: 'High Pass' },
  { value: 'lowpass', label: 'Low Pass' },
  { value: 'notch', label: 'Notch' },
]

export function EQProPanel() {
  const { showEQPro, setShowEQPro } = useUIStore()
  const { eqBands, setEqBand, setEqBands } = useProcessingStore()
  const [selectedId, setSelectedId] = useState<string | null>(eqBands[0]?.id ?? null)

  const selected = eqBands.find((b) => b.id === selectedId)

  return (
    <Dialog.Root open={showEQPro} onOpenChange={setShowEQPro}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 animate-fade-in" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-card-border rounded-t-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-card border-b border-card-border px-4 py-3 flex items-center justify-between">
            <Dialog.Title className="text-text-primary font-semibold">Equalizer</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Schließen">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 space-y-4">
            {/* Presets */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(Object.keys(EQ_PRESETS) as EQPresetKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setEqBands(EQ_PRESETS[key].map((b) => ({ ...b })))}
                  className="shrink-0 px-3 py-1.5 rounded-pill text-xs font-medium bg-slider-track text-text-secondary hover:text-text-primary hover:bg-card-border transition-colors"
                >
                  {PRESET_LABELS[key]}
                </button>
              ))}
            </div>

            {/* Graph */}
            <div className="bg-background border border-card-border rounded-card overflow-hidden">
              <EQGraph
                bands={eqBands}
                selectedBandId={selectedId}
                onBandSelect={setSelectedId}
                onBandChange={(id, freq, gain) => setEqBand(id, { freq, gain })}
                onBandQChange={(id, q) => setEqBand(id, { q })}
              />
              {/* Freq labels */}
              <div className="flex justify-between px-2 pb-2">
                {['20', '50', '100', '200', '500', '1k', '2k', '5k', '10k', '20k'].map((f) => (
                  <span key={f} className="text-text-secondary text-xs">{f}</span>
                ))}
              </div>
            </div>

            {/* Band selection */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {eqBands.map((band) => (
                <button
                  key={band.id}
                  onClick={() => setSelectedId(band.id)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-pill text-xs font-medium transition-colors',
                    selectedId === band.id
                      ? 'bg-accent text-white'
                      : 'bg-slider-track text-text-secondary hover:text-text-primary',
                    !band.enabled && 'opacity-50',
                  )}
                >
                  {band.label}
                </button>
              ))}
            </div>

            {/* Selected band controls */}
            {selected && (
              <div className="bg-background border border-card-border rounded-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-text-primary font-medium text-sm">{selected.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      {selected.enabled ? 'An' : 'Aus'}
                    </span>
                    <RadixSwitch.Root
                      checked={selected.enabled}
                      onCheckedChange={(v) => setEqBand(selected.id, { enabled: v })}
                      className="w-9 h-5 rounded-pill bg-slider-track data-[state=checked]:bg-accent transition-colors"
                    >
                      <RadixSwitch.Thumb className="block w-4 h-4 rounded-full bg-white translate-x-0.5 data-[state=checked]:translate-x-4 transition-transform" />
                    </RadixSwitch.Root>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-text-secondary">Frequenz</label>
                    <input
                      type="number"
                      value={selected.freq}
                      min={20} max={20000}
                      onChange={(e) => setEqBand(selected.id, { freq: Number(e.target.value) })}
                      className="w-full bg-slider-track text-text-primary text-sm rounded-lg px-3 py-2 border border-card-border focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs text-text-secondary">Hz</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-text-secondary">Verstärkung</label>
                    <input
                      type="number"
                      value={selected.gain}
                      min={-18} max={18} step={0.5}
                      onChange={(e) => setEqBand(selected.id, { gain: Number(e.target.value) })}
                      className="w-full bg-slider-track text-text-primary text-sm rounded-lg px-3 py-2 border border-card-border focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs text-text-secondary">dB</span>
                  </div>
                </div>

                {selected.type !== 'highpass' && selected.type !== 'lowpass' && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs text-text-secondary">Güte (Q) — Scroll auf Graph</label>
                      <span className="text-xs text-text-primary">{selected.q.toFixed(2)}</span>
                    </div>
                    <RadixSlider.Root
                      value={[selected.q]}
                      onValueChange={([v]) => setEqBand(selected.id, { q: v })}
                      min={0.1} max={10} step={0.05}
                      className="relative flex items-center select-none touch-none w-full h-9"
                    >
                      <RadixSlider.Track className="bg-slider-track relative grow rounded-pill h-1.5">
                        <RadixSlider.Range className="absolute bg-accent rounded-pill h-full" />
                      </RadixSlider.Track>
                      <RadixSlider.Thumb className="block w-5 h-5 bg-white rounded-full border-2 border-accent focus-visible:outline-none" />
                    </RadixSlider.Root>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Filter-Typ</label>
                  <select
                    value={selected.type}
                    onChange={(e) => setEqBand(selected.id, { type: e.target.value as BiquadFilterType })}
                    className="w-full bg-slider-track text-text-primary text-sm rounded-lg px-3 py-2 border border-card-border focus:outline-none focus:border-accent"
                  >
                    {FILTER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
