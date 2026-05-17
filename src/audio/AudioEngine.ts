import { audioContextManager } from './AudioContextManager'
import type { ProcessingParams } from '@/types/processing.types'
import { createSoftClipCurve, createWarmthCurve, dbToLinear } from '@/utils/audioMath'
import type { EQBand } from '@/types/audio.types'

export class AudioEngine {
  private ctx: AudioContext | null = null
  private source: AudioBufferSourceNode | null = null
  private buffer: AudioBuffer | null = null

  // Processing nodes
  private humFilters: BiquadFilterNode[] = []
  private noiseGate: DynamicsCompressorNode | null = null
  private noiseHP: BiquadFilterNode | null = null
  private eqNodes: BiquadFilterNode[] = []
  private compressor: DynamicsCompressorNode | null = null
  private exciterWaveshaper: WaveShaperNode | null = null
  private exciterGain: GainNode | null = null
  private limiterGain: GainNode | null = null
  private processedGain: GainNode | null = null
  private bypassGain: GainNode | null = null
  private masterOut: GainNode | null = null
  private keepAliveOsc: OscillatorNode | null = null

  private startTime = 0
  private pausedAt = 0
  private playing = false

  private onTimeUpdate: ((t: number) => void) | null = null
  private onEnd: (() => void) | null = null
  private rafId: number | null = null

  get isPlaying() { return this.playing }
  get currentTime() {
    if (!this.ctx || !this.playing) return this.pausedAt
    return this.pausedAt + (this.ctx.currentTime - this.startTime)
  }

  async init(): Promise<void> {
    this.ctx = await audioContextManager.initOnUserGesture()
    this.buildGraph()
    this.startKeepAlive()
  }

  private buildGraph(): void {
    if (!this.ctx) return
    const ctx = this.ctx

    // Hum removal: 4 notch filters
    this.humFilters = [50, 100, 150, 200].map((freq) => {
      const n = ctx.createBiquadFilter()
      n.type = 'notch'
      n.frequency.value = freq
      n.Q.value = 30
      return n
    })

    // Noise gate for preview
    this.noiseHP = ctx.createBiquadFilter()
    this.noiseHP.type = 'highpass'
    this.noiseHP.frequency.value = 80

    this.noiseGate = ctx.createDynamicsCompressor()
    this.noiseGate.threshold.value = -50
    this.noiseGate.knee.value = 10
    this.noiseGate.ratio.value = 20
    this.noiseGate.attack.value = 0
    this.noiseGate.release.value = 0.1

    // EQ (7 bands) – starts flat
    this.eqNodes = Array.from({ length: 7 }, () => {
      const n = ctx.createBiquadFilter()
      n.type = 'peaking'
      return n
    })

    // Compressor
    this.compressor = ctx.createDynamicsCompressor()
    this.compressor.threshold.value = -24
    this.compressor.knee.value = 6
    this.compressor.ratio.value = 4
    this.compressor.attack.value = 0.01
    this.compressor.release.value = 0.1

    // Exciter
    this.exciterWaveshaper = ctx.createWaveShaper()
    this.exciterWaveshaper.curve = createSoftClipCurve(0.3) as unknown as Float32Array<ArrayBuffer>
    this.exciterWaveshaper.oversample = '4x'
    this.exciterGain = ctx.createGain()
    this.exciterGain.gain.value = 0

    // Limiter / output gain
    this.limiterGain = ctx.createGain()
    this.limiterGain.gain.value = 0.9

    // A/B gains
    this.processedGain = ctx.createGain()
    this.processedGain.gain.value = 1
    this.bypassGain = ctx.createGain()
    this.bypassGain.gain.value = 0

    this.masterOut = ctx.createGain()
    this.masterOut.gain.value = 1

    // Wire processed chain
    this.connectChain([
      ...this.humFilters,
      this.noiseHP,
      this.noiseGate,
      ...this.eqNodes,
      this.compressor,
      this.exciterWaveshaper,
      this.limiterGain,
      this.processedGain,
      this.masterOut,
    ])

    this.masterOut.connect(ctx.destination)
  }

  private connectChain(nodes: AudioNode[]): void {
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1])
    }
  }

  private startKeepAlive(): void {
    if (!this.ctx) return
    this.keepAliveOsc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    g.gain.value = 0.00001
    this.keepAliveOsc.connect(g)
    g.connect(this.ctx.destination)
    this.keepAliveOsc.start()
  }

  async loadFile(file: File): Promise<AudioBuffer> {
    if (!this.ctx) await this.init()
    const ctx = this.ctx!
    const arrayBuffer = await file.arrayBuffer()
    const decoded = await ctx.decodeAudioData(arrayBuffer)
    this.buffer = decoded
    this.pausedAt = 0
    return decoded
  }

  play(startFrom?: number): void {
    if (!this.ctx || !this.buffer) return
    this.stop()
    const ctx = this.ctx

    if (startFrom !== undefined) this.pausedAt = startFrom

    this.source = ctx.createBufferSource()
    this.source.buffer = this.buffer
    this.source.connect(this.humFilters[0] ?? ctx.destination)
    this.source.start(0, this.pausedAt)
    this.source.onended = () => {
      if (this.playing) {
        this.playing = false
        this.pausedAt = 0
        this.onEnd?.()
      }
    }

    // Bypass connection
    if (this.bypassGain && this.masterOut) {
      this.source.connect(this.bypassGain)
      this.bypassGain.connect(this.masterOut)
    }

    this.startTime = ctx.currentTime
    this.playing = true
    this.startRaf()
  }

  pause(): void {
    if (!this.playing) return
    this.pausedAt = this.currentTime
    this.source?.stop()
    this.playing = false
    this.stopRaf()
  }

  stop(): void {
    try { this.source?.stop() } catch { /* already stopped */ }
    this.source = null
    this.playing = false
    this.stopRaf()
  }

  seek(time: number): void {
    const wasPlaying = this.playing
    this.stop()
    this.pausedAt = time
    if (wasPlaying) this.play()
  }

  setABMode(mode: 'original' | 'processed'): void {
    if (!this.ctx || !this.processedGain || !this.bypassGain) return
    const now = this.ctx.currentTime
    const fade = 0.01
    if (mode === 'processed') {
      this.bypassGain.gain.linearRampToValueAtTime(0, now + fade)
      this.processedGain.gain.linearRampToValueAtTime(1, now + fade)
    } else {
      this.processedGain.gain.linearRampToValueAtTime(0, now + fade)
      this.bypassGain.gain.linearRampToValueAtTime(1, now + fade)
    }
  }

  updateParams(params: ProcessingParams): void {
    if (!this.ctx) return
    const now = this.ctx.currentTime

    // Hum
    this.humFilters.forEach((f) => {
      f.gain.setTargetAtTime(params.humEnabled ? -params.humAmount * 30 : 0, now, 0.016)
    })

    // Noise gate
    if (this.noiseGate) {
      const threshold = params.noiseEnabled ? -50 + params.noiseAmount * 30 : -100
      this.noiseGate.threshold.setTargetAtTime(threshold, now, 0.016)
    }

    // EQ
    params.eqBands.forEach((band, i) => {
      const node = this.eqNodes[i]
      if (!node) return
      node.type = band.type
      node.frequency.setTargetAtTime(band.freq, now, 0.016)
      const gain = params.eqEnabled && band.enabled ? band.gain * params.eqIntensity : 0
      if (band.type !== 'highpass' && band.type !== 'lowpass') {
        node.gain.setTargetAtTime(gain, now, 0.016)
      }
      node.Q.setTargetAtTime(band.q, now, 0.016)
    })

    // Compressor
    if (this.compressor) {
      const threshold = params.compressionEnabled ? -40 + params.compressionAmount * 20 : 0
      this.compressor.threshold.setTargetAtTime(threshold, now, 0.016)
      this.compressor.ratio.setTargetAtTime(params.compressionEnabled ? 4 : 1, now, 0.016)
    }

    // Exciter
    if (this.exciterWaveshaper && this.exciterGain) {
      const curve = params.exciterMode === 'warmth'
        ? createWarmthCurve(params.exciterAmount)
        : createSoftClipCurve(params.exciterAmount)
      this.exciterWaveshaper.curve = params.exciterEnabled ? (curve as unknown as Float32Array<ArrayBuffer>) : null
      this.exciterGain.gain.setTargetAtTime(
        params.exciterEnabled ? params.exciterAmount * 0.3 : 0,
        now, 0.016,
      )
    }

    // Limiter target
    if (this.limiterGain) {
      const targetLinear = dbToLinear(params.limiterTarget + 1)
      this.limiterGain.gain.setTargetAtTime(Math.min(targetLinear, 1), now, 0.05)
    }
  }

  private startRaf(): void {
    const tick = () => {
      this.onTimeUpdate?.(this.currentTime)
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stopRaf(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  setOnTimeUpdate(fn: (t: number) => void) { this.onTimeUpdate = fn }
  setOnEnd(fn: () => void) { this.onEnd = fn }

  destroy(): void {
    this.stop()
    this.keepAliveOsc?.stop()
    this.ctx?.close()
  }
}

export const audioEngine = new AudioEngine()
