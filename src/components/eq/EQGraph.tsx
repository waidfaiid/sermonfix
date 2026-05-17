import { useEffect, useRef, useCallback } from 'react'
import type { EQBand } from '@/types/audio.types'

interface EQGraphProps {
  bands: EQBand[]
  selectedBandId: string | null
  onBandSelect: (id: string) => void
  onBandChange: (id: string, freq: number, gain: number) => void
  onBandQChange: (id: string, q: number) => void
}

const MIN_FREQ = 20
const MAX_FREQ = 20000
const MIN_GAIN = -18
const MAX_GAIN = 18

function freqToX(freq: number, width: number): number {
  return (Math.log10(freq / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ)) * width
}

function xToFreq(x: number, width: number): number {
  return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, x / width)
}

function gainToY(gain: number, height: number): number {
  return ((MAX_GAIN - gain) / (MAX_GAIN - MIN_GAIN)) * height
}

function yToGain(y: number, height: number): number {
  return MAX_GAIN - (y / height) * (MAX_GAIN - MIN_GAIN)
}

function computeFreqResponse(bands: EQBand[], sampleRate = 48000): Float32Array {
  const points = 512
  const response = new Float32Array(points).fill(0)

  for (const band of bands) {
    if (!band.enabled) continue
    const w0 = (2 * Math.PI * band.freq) / sampleRate
    const A = Math.pow(10, band.gain / 40)
    const alpha = Math.sin(w0) / (2 * band.q)

    let b0 = 0, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0

    if (band.type === 'peaking') {
      b0 = 1 + alpha * A; b1 = -2 * Math.cos(w0); b2 = 1 - alpha * A
      a0 = 1 + alpha / A; a1 = -2 * Math.cos(w0); a2 = 1 - alpha / A
    } else if (band.type === 'highshelf') {
      b0 = A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * alpha)
      b1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(w0))
      b2 = A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * alpha)
      a0 = (A + 1) - (A - 1) * Math.cos(w0) + 2 * Math.sqrt(A) * alpha
      a1 = 2 * ((A - 1) - (A + 1) * Math.cos(w0))
      a2 = (A + 1) - (A - 1) * Math.cos(w0) - 2 * Math.sqrt(A) * alpha
    } else if (band.type === 'highpass') {
      b0 = (1 + Math.cos(w0)) / 2; b1 = -(1 + Math.cos(w0)); b2 = (1 + Math.cos(w0)) / 2
      a0 = 1 + alpha; a1 = -2 * Math.cos(w0); a2 = 1 - alpha
    } else {
      continue
    }

    for (let i = 0; i < points; i++) {
      const freq = MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, i / points)
      const w = (2 * Math.PI * freq) / sampleRate
      const cos_w = Math.cos(w), sin_w = Math.sin(w)
      const re_num = b0 - b2 + (b0 + b2) * cos_w - b1 * cos_w
      const im_num = b1 * sin_w - (b0 - b2) * sin_w
      const re_den = a0 - a2 + (a0 + a2) * cos_w - a1 * cos_w
      const im_den = a1 * sin_w - (a0 - a2) * sin_w
      const mag = Math.sqrt((re_num ** 2 + im_num ** 2) / (re_den ** 2 + im_den ** 2))
      response[i] += 20 * Math.log10(Math.max(mag, 1e-6))
    }
  }
  return response
}

export function EQGraph({ bands, selectedBandId, onBandSelect, onBandChange, onBandQChange }: EQGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragging = useRef<{ id: string; startX: number; startY: number; startFreq: number; startGain: number } | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    ;[50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach((f) => {
      const x = freqToX(f, W)
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    })
    ;[-12, -6, 0, 6, 12].forEach((g) => {
      const y = gainToY(g, H)
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    })
    // 0dB line slightly brighter
    ctx.strokeStyle = '#374151'
    const y0 = gainToY(0, H)
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()

    // EQ Curve
    const response = computeFreqResponse(bands)
    ctx.beginPath()
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 2
    for (let i = 0; i < response.length; i++) {
      const freq = MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, i / response.length)
      const x = freqToX(freq, W)
      const y = gainToY(Math.max(MIN_GAIN, Math.min(MAX_GAIN, response[i])), H)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Band dots
    bands.forEach((band) => {
      if (band.type === 'highpass') return
      const x = freqToX(band.freq, W)
      const y = gainToY(band.gain, H)
      const isSelected = band.id === selectedBandId

      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 9 : 6, 0, Math.PI * 2)
      ctx.fillStyle = band.enabled ? (isSelected ? '#6366f1' : '#818cf8') : '#374151'
      ctx.fill()
      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }, [bands, selectedBandId])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio)
      draw()
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw])

  function getBandAtPoint(x: number, y: number, canvas: HTMLCanvasElement) {
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    return bands.find((band) => {
      if (band.type === 'highpass') return false
      const bx = freqToX(band.freq, W)
      const by = gainToY(band.gain, H)
      return Math.hypot(x - bx, y - by) < 16
    })
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const band = getBandAtPoint(x, y, canvas)
    if (band) {
      onBandSelect(band.id)
      dragging.current = { id: band.id, startX: x, startY: y, startFreq: band.freq, startGain: band.gain }
    }
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragging.current) return
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const freq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, xToFreq(x, canvas.offsetWidth)))
    const gain = Math.max(MIN_GAIN, Math.min(MAX_GAIN, yToGain(y, canvas.offsetHeight)))
    onBandChange(dragging.current.id, Math.round(freq), parseFloat(gain.toFixed(1)))
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    if (!selectedBandId) return
    const band = bands.find((b) => b.id === selectedBandId)
    if (!band) return
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newQ = Math.max(0.1, Math.min(10, band.q + delta))
    onBandQChange(selectedBandId, parseFloat(newQ.toFixed(2)))
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-44 cursor-crosshair"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={() => { dragging.current = null }}
      onMouseLeave={() => { dragging.current = null }}
      onWheel={onWheel}
    />
  )
}
