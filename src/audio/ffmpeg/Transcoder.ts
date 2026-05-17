import { ffmpegManager } from './FFmpegManager'
import type { ProcessingParams, ExportOptions } from '@/types/processing.types'

const QUALITY_BITRATE: Record<string, Record<string, string>> = {
  mp3:  { low: '96k',  medium: '192k', high: '320k',  lossless: '320k' },
  aac:  { low: '96k',  medium: '192k', high: '256k',  lossless: '256k' },
  ogg:  { low: '3',    medium: '6',    high: '9',     lossless: '9' },
  flac: { low: '0',    medium: '0',    high: '0',     lossless: '0' },
  wav:  { low: '0',    medium: '0',    high: '0',     lossless: '0' },
  m4a:  { low: '96k',  medium: '192k', high: '256k',  lossless: '256k' },
}

export function buildFilterChain(params: ProcessingParams): string {
  const filters: string[] = []

  if (params.humEnabled && params.humAmount > 0) {
    const g = -(params.humAmount * 30)
    filters.push(`equalizer=f=50:width_type=o:width=2:g=${g.toFixed(1)}`)
    filters.push(`equalizer=f=100:width_type=o:width=2:g=${(g * 0.5).toFixed(1)}`)
    filters.push(`equalizer=f=150:width_type=o:width=2:g=${(g * 0.3).toFixed(1)}`)
    filters.push(`equalizer=f=200:width_type=o:width=2:g=${(g * 0.2).toFixed(1)}`)
  }

  if (params.noiseEnabled && params.noiseAmount > 0) {
    const nf = -(20 + params.noiseAmount * 30)
    filters.push(`afftdn=nf=${nf.toFixed(0)}`)
  }

  // High-pass always on
  filters.push('highpass=f=80')

  if (params.eqEnabled) {
    params.eqBands.forEach((band) => {
      if (!band.enabled || band.id === 'hp') return
      const gain = band.gain * params.eqIntensity
      if (Math.abs(gain) < 0.1) return
      if (band.type === 'highshelf') {
        filters.push(`treble=f=${band.freq}:g=${gain.toFixed(1)}`)
      } else if (band.type === 'lowshelf') {
        filters.push(`bass=f=${band.freq}:g=${gain.toFixed(1)}`)
      } else {
        filters.push(`equalizer=f=${band.freq}:width_type=o:width=${band.q.toFixed(1)}:g=${gain.toFixed(1)}`)
      }
    })
  }

  if (params.compressionEnabled && params.compressionAmount > 0) {
    const threshold = -40 + params.compressionAmount * 20
    filters.push(`acompressor=threshold=${threshold.toFixed(0)}dB:ratio=4:attack=10:release=100:knee=6`)
  }

  filters.push(`loudnorm=I=${params.limiterTarget}:TP=-1:LRA=11`)

  return filters.join(',')
}

export async function exportFile(
  file: File,
  params: ProcessingParams,
  options: ExportOptions,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  if (!ffmpegManager.isLoaded) await ffmpegManager.load()

  const inputName = `input_${Date.now()}.${file.name.split('.').pop()}`
  const outputName = `output_${Date.now()}.${options.format}`

  await ffmpegManager.writeFile(inputName, file)

  const filterChain = buildFilterChain(params)
  const args = [
    '-i', inputName,
    '-af', filterChain,
    '-ar', String(options.sampleRate),
    '-ac', String(options.channels),
  ]

  if (options.format === 'mp3') {
    args.push('-c:a', 'libmp3lame', '-b:a', QUALITY_BITRATE.mp3[options.quality])
  } else if (options.format === 'aac' || options.format === 'm4a') {
    args.push('-c:a', 'aac', '-b:a', QUALITY_BITRATE.aac[options.quality])
  } else if (options.format === 'ogg') {
    args.push('-c:a', 'libvorbis', '-q:a', QUALITY_BITRATE.ogg[options.quality])
  } else if (options.format === 'flac') {
    args.push('-c:a', 'flac')
  } else if (options.format === 'wav') {
    args.push('-c:a', 'pcm_s16le')
  }

  args.push('-y', outputName)

  ffmpegManager.setProgressCallback(onProgress ?? (() => {}))
  await ffmpegManager.exec(args)

  const data = await ffmpegManager.readFile(outputName)
  await ffmpegManager.deleteFile(inputName)
  await ffmpegManager.deleteFile(outputName)

  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac',
    aac: 'audio/aac', m4a: 'audio/mp4', ogg: 'audio/ogg',
  }
  return new Blob([data as unknown as ArrayBuffer], { type: mimeTypes[options.format] ?? 'audio/mpeg' })
}
