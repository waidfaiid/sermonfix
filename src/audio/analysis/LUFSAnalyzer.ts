// ITU-R BS.1770-4 implementation

interface FilterState {
  x1: number; x2: number; y1: number; y2: number
}

function applyBiquad(
  input: Float32Array,
  b: [number, number, number],
  a: [number, number, number],
  state: FilterState,
): Float32Array {
  const output = new Float32Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const x = input[i]
    const y = b[0] * x + b[1] * state.x1 + b[2] * state.x2
              - a[1] * state.y1 - a[2] * state.y2
    state.x2 = state.x1; state.x1 = x
    state.y2 = state.y1; state.y1 = y
    output[i] = y
  }
  return output
}

export class LUFSAnalyzer {
  // K-weighting stage 1 (pre-filter, 48kHz)
  private static S1_B: [number, number, number] = [1.53512485958697, -2.69169618940638, 1.19839281085285]
  private static S1_A: [number, number, number] = [1.0, -1.69065929318241, 0.73248077421585]
  // K-weighting stage 2 (RLB, 48kHz)
  private static S2_B: [number, number, number] = [1.0, -2.0, 1.0]
  private static S2_A: [number, number, number] = [1.0, -1.99004745483398, 0.99007225036621]

  analyze(buffer: AudioBuffer): number {
    const filtered = this.applyKWeighting(buffer)
    const sr = buffer.sampleRate
    const blockSize = Math.floor(sr * 0.4)
    const hopSize = Math.floor(sr * 0.1)
    const blocks: number[] = []

    for (let i = 0; i + blockSize < filtered.length; i += hopSize) {
      let sum = 0
      for (let j = 0; j < blockSize; j++) sum += filtered[i + j] ** 2
      blocks.push(sum / blockSize)
    }

    if (blocks.length === 0) return -70

    const absGate = Math.pow(10, -70 / 10)
    const gated1 = blocks.filter((b) => b > absGate)
    if (gated1.length === 0) return -70

    const ungated = gated1.reduce((a, b) => a + b, 0) / gated1.length
    const relGate = ungated * Math.pow(10, -10 / 10)
    const gated2 = gated1.filter((b) => b > relGate)
    if (gated2.length === 0) return -70

    const mean = gated2.reduce((a, b) => a + b, 0) / gated2.length
    return -0.691 + 10 * Math.log10(mean)
  }

  private applyKWeighting(buffer: AudioBuffer): Float32Array {
    let mixed = new Float32Array(buffer.length)
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < mixed.length; i++) mixed[i] += data[i]
    }
    if (buffer.numberOfChannels > 1) {
      for (let i = 0; i < mixed.length; i++) mixed[i] /= buffer.numberOfChannels
    }

    const s1: FilterState = { x1: 0, x2: 0, y1: 0, y2: 0 }
    const s2: FilterState = { x1: 0, x2: 0, y1: 0, y2: 0 }
    const stage1 = applyBiquad(mixed, LUFSAnalyzer.S1_B, LUFSAnalyzer.S1_A, s1)
    return applyBiquad(stage1, LUFSAnalyzer.S2_B, LUFSAnalyzer.S2_A, s2)
  }
}

export function analyzeDynamics(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0)
  let sumSq = 0
  let peak = 0
  for (let i = 0; i < data.length; i++) {
    sumSq += data[i] * data[i]
    if (Math.abs(data[i]) > peak) peak = Math.abs(data[i])
  }
  const rmsDb = 20 * Math.log10(Math.sqrt(sumSq / data.length) || 1e-9)
  const peakDb = 20 * Math.log10(peak || 1e-9)
  const crestFactor = peakDb - rmsDb

  const category =
    crestFactor > 20 ? 'very_dynamic' :
    crestFactor > 12 ? 'normal' :
    crestFactor > 6  ? 'compressed' : 'clipped'

  return {
    rms: rmsDb,
    peak: peakDb,
    crestFactor,
    dynamicsCategory: category as 'very_dynamic' | 'normal' | 'compressed' | 'clipped',
    suggestedThreshold: rmsDb + crestFactor * 0.25,
    suggestedRatio: category === 'very_dynamic' ? 6 : category === 'normal' ? 4 : category === 'compressed' ? 2 : 8,
    hasHum: false,
    hasNoise: false,
  }
}
