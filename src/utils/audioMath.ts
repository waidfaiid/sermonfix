export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity
  return 20 * Math.log10(linear)
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function formatDb(db: number): string {
  if (!isFinite(db)) return '-∞ dB'
  return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`
}

export function formatLufs(lufs: number): string {
  if (!isFinite(lufs)) return '--- LUFS'
  return `${lufs.toFixed(1)} LUFS`
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function estimateExportSize(
  durationSeconds: number,
  format: string,
  quality: string,
): number {
  const bitrateMap: Record<string, Record<string, number>> = {
    mp3:  { low: 96, medium: 192, high: 320, lossless: 320 },
    aac:  { low: 96, medium: 192, high: 256, lossless: 256 },
    ogg:  { low: 80, medium: 160, high: 240, lossless: 240 },
    flac: { low: 800, medium: 800, high: 800, lossless: 800 },
    wav:  { low: 1411, medium: 1411, high: 1411, lossless: 1411 },
    m4a:  { low: 96, medium: 192, high: 256, lossless: 256 },
  }
  const kbps = bitrateMap[format]?.[quality] ?? 192
  return (kbps * 1000 / 8) * durationSeconds
}

export function createSoftClipCurve(intensity: number): Float32Array {
  const samples = 256
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    const drive = 1 + intensity * 3
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive)
  }
  return curve
}

export function createWarmthCurve(intensity: number): Float32Array {
  const samples = 256
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    const drive = 1 + intensity * 1.5
    curve[i] = (Math.tanh(x * drive) / Math.tanh(drive)) * 0.9 + x * 0.1
  }
  return curve
}
