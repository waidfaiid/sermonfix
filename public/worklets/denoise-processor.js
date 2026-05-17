// AudioWorklet for RNNoise-style denoising placeholder
// In the real implementation this would load rnnoise-wasm
// The preview path uses the AudioEngine's noise gate instead

class DenoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.intensity = 0.5
    this.frameBuffer = new Float32Array(480)
    this.outputBuffer = new Float32Array(480)
    this.bufferIndex = 0

    this.port.onmessage = (e) => {
      if (e.data.type === 'SET_INTENSITY') {
        this.intensity = e.data.value
      }
    }
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0]
    const output = outputs[0]?.[0]
    if (!input || !output) return true

    for (let i = 0; i < input.length; i++) {
      this.frameBuffer[this.bufferIndex++] = input[i]

      if (this.bufferIndex >= 480) {
        // Simple spectral gate approximation
        let energy = 0
        for (let j = 0; j < 480; j++) energy += this.frameBuffer[j] ** 2
        energy /= 480
        const noiseFloor = 0.0001 * (1 - this.intensity)
        const gate = energy > noiseFloor ? 1 : 0
        for (let j = 0; j < 480; j++) {
          this.outputBuffer[j] = this.frameBuffer[j] * (gate + (1 - gate) * (1 - this.intensity))
        }
        this.bufferIndex = 0
      }

      const denoised = this.outputBuffer[i] ?? input[i]
      output[i] = denoised * this.intensity + input[i] * (1 - this.intensity)
    }

    return true
  }
}

registerProcessor('denoise-processor', DenoiseProcessor)
