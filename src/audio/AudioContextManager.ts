import { AUDIO_CONTEXT_SAMPLE_RATE } from '@/utils/mobileAudio'

type StateListener = (state: AudioContextState) => void

/**
 * Returns a Promise that rejects after `ms` milliseconds.
 * Used to guard against iOS Safari operations that can hang indefinitely
 * (e.g. AudioContext.resume() or audioWorklet.addModule() outside a user gesture).
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`[iOS timeout] ${label} timed out after ${ms} ms`)), ms)
    promise.then(
      (v) => { clearTimeout(timer); resolve(v) },
      (e) => { clearTimeout(timer); reject(e) },
    )
  })
}

class AudioContextManager {
  private ctx: AudioContext | null = null
  private listeners: Set<StateListener> = new Set()
  /**
   * Set to true once the iOS audio session has been switched from the
   * "ringer" bus to the "media playback" bus.  Prevents duplicate unlock
   * calls when initOnUserGesture() is invoked more than once.
   */
  private _sessionUnlocked = false
  /** Prevents registering the visibilitychange listener more than once. */
  private _visibilityListenerAdded = false

  get context(): AudioContext | null {
    return this.ctx
  }

  get state(): AudioContextState {
    return this.ctx?.state ?? 'closed'
  }

  async initOnUserGesture(): Promise<AudioContext> {
    // ── Step 1: fire the iOS audio-session unlock synchronously ───────────────
    // This MUST be called before any `await` so it runs in the same microtask
    // as the original user-gesture event.  On iOS, calling audio.play() more
    // than one microtask hop after a tap is enough for Safari to deny it.
    this.unlockAudioSession()

    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        // iOS Safari can hang on resume() when called outside a synchronous user-gesture
        // handler. Wrap with a generous timeout so loading never freezes.
        await withTimeout(this.ctx.resume(), 3000, 'AudioContext.resume').catch((err) => {
          console.warn('[AudioContextManager] resume() timed out or failed:', err)
        })
      }
      return this.ctx
    }

    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

    const sampleRate = AUDIO_CONTEXT_SAMPLE_RATE

    this.ctx = new AudioCtx({ sampleRate, latencyHint: 'interactive' })

    if (this.ctx.state === 'suspended') {
      await withTimeout(this.ctx.resume(), 3000, 'AudioContext.resume (initial)').catch((err) => {
        console.warn('[AudioContextManager] initial resume() timed out or failed:', err)
      })
    }

    this.ctx.addEventListener('statechange', () => {
      this.listeners.forEach((l) => l(this.ctx!.state))
    })

    // Resume the AudioContext when the page becomes visible again.
    // On Android and some iOS scenarios the context is suspended while the
    // browser tab is in the background (screen lock, app switcher, call, etc.).
    // Without this the user would have to tap a UI control before audio resumes.
    if (!this._visibilityListenerAdded) {
      this._visibilityListenerAdded = true
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.ctx?.state === 'suspended') {
          this.ctx.resume().catch(() => {})
        }
      })
    }

    await this.registerWorklets()
    this.notify()
    return this.ctx
  }

  /**
   * Switches the iOS audio session from the "ringer" route to the
   * "media playback" route by playing a 1-sample silent WAV through an
   * HTMLAudioElement.
   *
   * Without this, Web Audio output on iOS:
   *   - is muted by the hardware silent-mode (mute) switch regardless of
   *     software volume level
   *   - is controlled by the ringer volume buttons, not the media volume
   *   - may route to the earpiece instead of the loudspeaker
   *
   * CRITICAL: this method is SYNCHRONOUS and MUST be called before any
   * `await` in the user-gesture call chain.  iOS only grants `audio.play()`
   * permission if it is called within the same microtask as the user tap.
   * Calling it after even one `await ctx.resume()` is enough for Safari to
   * deny it with NotAllowedError.
   *
   * It is safe to call on non-iOS browsers; the audio element plays silence
   * and is removed within 500 ms.  If `audio.play()` rejects (e.g. gesture
   * epoch expired), `_sessionUnlocked` is reset so the next gesture retries.
   */
  unlockAudioSession(): void {
    if (this._sessionUnlocked) return
    this._sessionUnlocked = true   // optimistic — reset on rejection
    try {
      // Build a minimal 46-byte WAV: 44-byte header + 1 sample of silence.
      const wav = new Uint8Array(46)
      const view = new DataView(wav.buffer)
      const str = (off: number, s: string) => {
        for (let i = 0; i < s.length; i++) wav[off + i] = s.charCodeAt(i)
      }
      str(0, 'RIFF'); view.setUint32(4, 38, true);   str(8, 'WAVE')
      str(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)    // mono
      view.setUint32(24, 22050, true) // sample rate
      view.setUint32(28, 44100, true) // byte rate
      view.setUint16(32, 2, true)    // block align
      view.setUint16(34, 16, true)   // bits per sample
      str(36, 'data'); view.setUint32(40, 2, true)   // 1 sample
      // bytes 44-45 are 0 already (silence)

      const url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }))
      const audioEl = document.createElement('audio')
      audioEl.src = url
      audioEl.setAttribute('playsinline', '')
      // Must NOT be muted — a muted element does not trigger the iOS session switch.
      audioEl.muted = false
      document.body.appendChild(audioEl)

      audioEl.play().then(() => {
        URL.revokeObjectURL(url)
        setTimeout(() => { try { audioEl.pause(); audioEl.remove() } catch { /* */ } }, 500)
      }).catch(() => {
        // play() was denied — gesture epoch had already expired.  Reset so the
        // next user tap (e.g. the play button) gets another chance to unlock.
        this._sessionUnlocked = false
        URL.revokeObjectURL(url)
        try { audioEl.remove() } catch { /* */ }
      })
    } catch (err) {
      this._sessionUnlocked = false
      console.warn('[AudioContextManager] audio session unlock failed:', err)
    }
  }

  private async registerWorklets(): Promise<void> {
    if (!this.ctx) return
    const modules = [
      '/worklets/de-esser-processor.js',
      '/worklets/preview-limiter-processor.js',
      '/rnnoise.worklet.js',
    ]
    for (const path of modules) {
      try {
        // iOS Safari can hang on addModule() — guard with a 6-second timeout per module.
        await withTimeout(this.ctx.audioWorklet.addModule(path), 6000, `addModule(${path})`)
      } catch (err) {
        // Worklet registration failures are non-fatal; the engine falls back to
        // simpler Web Audio nodes when a preview processor is unavailable.
        console.warn(`[AudioContextManager] failed to register worklet ${path}:`, err)
      }
    }
  }

  async suspend(): Promise<void> {
    await this.ctx?.suspend()
    this.notify()
  }

  async resume(): Promise<void> {
    await this.ctx?.resume()
    this.notify()
  }

  onStateChange(listener: StateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.state))
  }
}

export const audioContextManager = new AudioContextManager()
