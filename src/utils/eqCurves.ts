import type { EQBand } from '@/types/audio.types'

export const SPEECH_EQ_CURVE: EQBand[] = [
  { id: 'hp',          label: 'HP 80Hz',   freq: 80,    gain: -30, q: 0.7, type: 'highpass', enabled: true },
  { id: 'mud',         label: '200Hz',     freq: 200,   gain: -3,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'body',        label: '400Hz',     freq: 400,   gain: -2,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'presence1',   label: '2kHz',      freq: 2000,  gain: +2,  q: 0.8, type: 'peaking',  enabled: true },
  { id: 'presence2',   label: '3.5kHz',    freq: 3500,  gain: +3,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'articulation',label: '5kHz',      freq: 5000,  gain: +2,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'air',         label: '10kHz',     freq: 10000, gain: +1.5,q: 0.7, type: 'highshelf', enabled: true },
]

export const SPEECH_WARM_EQ: EQBand[] = [
  { id: 'hp',          label: 'HP 80Hz',   freq: 80,    gain: -30, q: 0.7, type: 'highpass', enabled: true },
  { id: 'mud',         label: '200Hz',     freq: 200,   gain: -1,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'body',        label: '400Hz',     freq: 400,   gain: +1,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'presence1',   label: '2kHz',      freq: 2000,  gain: +1,  q: 0.8, type: 'peaking',  enabled: true },
  { id: 'presence2',   label: '3.5kHz',    freq: 3500,  gain: +2,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'articulation',label: '5kHz',      freq: 5000,  gain: +1,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'air',         label: '10kHz',     freq: 10000, gain: +0.5,q: 0.7, type: 'highshelf', enabled: true },
]

export const SPEECH_BRIGHT_EQ: EQBand[] = [
  { id: 'hp',          label: 'HP 80Hz',   freq: 80,    gain: -30, q: 0.7, type: 'highpass', enabled: true },
  { id: 'mud',         label: '200Hz',     freq: 200,   gain: -4,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'body',        label: '400Hz',     freq: 400,   gain: -3,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'presence1',   label: '2kHz',      freq: 2000,  gain: +3,  q: 0.8, type: 'peaking',  enabled: true },
  { id: 'presence2',   label: '3.5kHz',    freq: 3500,  gain: +4,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'articulation',label: '5kHz',      freq: 5000,  gain: +3,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'air',         label: '10kHz',     freq: 10000, gain: +3,  q: 0.7, type: 'highshelf', enabled: true },
]

export const PODCAST_EQ: EQBand[] = [
  { id: 'hp',          label: 'HP 80Hz',   freq: 80,    gain: -30, q: 0.7, type: 'highpass', enabled: true },
  { id: 'mud',         label: '200Hz',     freq: 200,   gain: -2,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'body',        label: '400Hz',     freq: 400,   gain: -1,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'presence1',   label: '2kHz',      freq: 2000,  gain: +2,  q: 0.8, type: 'peaking',  enabled: true },
  { id: 'presence2',   label: '3.5kHz',    freq: 3500,  gain: +2,  q: 1.0, type: 'peaking',  enabled: true },
  { id: 'articulation',label: '5kHz',      freq: 5000,  gain: +1,  q: 1.2, type: 'peaking',  enabled: true },
  { id: 'air',         label: '10kHz',     freq: 10000, gain: +1,  q: 0.7, type: 'highshelf', enabled: true },
]

export const FLAT_EQ: EQBand[] = SPEECH_EQ_CURVE.map(b => ({ ...b, gain: 0 }))

export const EQ_PRESETS = {
  speech_neutral: SPEECH_EQ_CURVE,
  speech_warm: SPEECH_WARM_EQ,
  speech_bright: SPEECH_BRIGHT_EQ,
  podcast: PODCAST_EQ,
  flat: FLAT_EQ,
} as const

export type EQPresetKey = keyof typeof EQ_PRESETS
