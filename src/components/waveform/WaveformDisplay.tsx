import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useAudioStore } from '@/store/useAudioStore'
import { audioEngine } from '@/audio/AudioEngine'

interface WaveformDisplayProps {
  file: File
}

export function WaveformDisplay({ file }: WaveformDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const setDuration = useAudioStore((s) => s.setDuration)
  const setCurrentTime = useAudioStore((s) => s.setCurrentTime)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#1e293b',
      progressColor: '#6366f1',
      cursorColor: '#6366f1',
      cursorWidth: 2,
      height: 72,
      normalize: true,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: true,
      backend: 'WebAudio',
    })

    wavesurferRef.current = ws

    ws.on('ready', (dur: number) => {
      setDuration(dur)
    })

    ws.on('interaction', () => {
      const time = ws.getCurrentTime()
      setCurrentTime(time)
      audioEngine.seek(time)
    })

    ws.on('timeupdate', (time: number) => {
      setCurrentTime(time)
    })

    ws.loadBlob(file)

    return () => {
      ws.destroy()
    }
  }, [file, setDuration, setCurrentTime])

  return (
    <div className="px-4 py-3">
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
    </div>
  )
}
