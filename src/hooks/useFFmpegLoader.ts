import { useEffect } from 'react'
import { ffmpegManager } from '@/audio/ffmpeg/FFmpegManager'
import { useAudioStore } from '@/store/useAudioStore'

export function useFFmpegLoader() {
  const { setFfmpegLoaded, setFfmpegLoadProgress } = useAudioStore()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setFfmpegLoadProgress(10)
      try {
        ffmpegManager.setProgressCallback((p) => {
          if (!cancelled) setFfmpegLoadProgress(10 + p * 0.9)
        })
        await ffmpegManager.load()
        if (!cancelled) {
          setFfmpegLoadProgress(100)
          setFfmpegLoaded(true)
        }
      } catch (err) {
        console.error('FFmpeg load failed:', err)
        if (!cancelled) setFfmpegLoadProgress(0)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])
}
