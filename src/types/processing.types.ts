import type { EQBand, ExciterMode } from './audio.types'

export interface ProcessingParams {
  humEnabled: boolean
  humAmount: number

  noiseEnabled: boolean
  noiseAmount: number

  eqEnabled: boolean
  eqIntensity: number
  eqBands: EQBand[]

  compressionEnabled: boolean
  compressionAmount: number

  exciterEnabled: boolean
  exciterAmount: number
  exciterMode: ExciterMode

  limiterTarget: number
}

export type ExportFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'm4a' | 'ogg'
export type ExportQuality = 'low' | 'medium' | 'high' | 'lossless'
export type SampleRate = 44100 | 48000

export interface ExportOptions {
  format: ExportFormat
  quality: ExportQuality
  sampleRate: SampleRate
  channels: 1 | 2
  normalizeToLUFS: number
  filename: string
}
