import { useEffect, useRef } from 'react'
import { audioEngine } from '@/audio/AudioEngine'
import { useAudioStore } from '@/store/useAudioStore'
import { useFileStore } from '@/store/useFileStore'
import { LUFSAnalyzer, analyzeDynamics } from '@/audio/analysis/LUFSAnalyzer'

const lufsAnalyzer = new LUFSAnalyzer()

export function useAudioEngine() {
  const { setIsPlaying, setCurrentTime, setDuration, setIsLoading, setAnalysis } = useAudioStore()
  const activeFile = useFileStore((s) => s.getActiveFile())
  const updateFile = useFileStore((s) => s.updateFile)
  const initialized = useRef(false)

  useEffect(() => {
    audioEngine.setOnTimeUpdate(setCurrentTime)
    audioEngine.setOnEnd(() => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
  }, [setCurrentTime, setIsPlaying])

  useEffect(() => {
    if (!activeFile) return

    let cancelled = false

    async function load() {
      if (!activeFile) return
      setIsLoading(true)
      try {
        if (!initialized.current) {
          initialized.current = true
        }
        const buffer = await audioEngine.loadFile(activeFile.file)
        if (cancelled) return

        setDuration(buffer.duration)
        updateFile(activeFile.id, { duration: buffer.duration })

        const dynamics = analyzeDynamics(buffer)
        const lufs = lufsAnalyzer.analyze(buffer)
        setAnalysis({
          ...dynamics,
          lufs,
          hasHum: false,
          hasNoise: dynamics.rms < -40,
        })
      } catch (err) {
        console.error('Failed to load audio:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [activeFile?.id])

  function initAndPlay() {
    if (!activeFile) return
    if (useAudioStore.getState().isPlaying) {
      audioEngine.pause()
      setIsPlaying(false)
    } else {
      audioEngine.play()
      setIsPlaying(true)
    }
  }

  return { initAndPlay }
}
