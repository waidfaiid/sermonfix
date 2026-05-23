/**
 * RNNoise AudioWorklet — based on simple-rnnoise-wasm with two fixes:
 * 1. Per-processor WASM instance (no shared static state across nodes).
 * 2. Fresh heap view each block so memory growth cannot stale the Float32Array.
 */
class RNNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super({
      ...options,
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    })

    this.exports = new WebAssembly.Instance(options.processorOptions.module).exports
    this.state = this.exports.newState()
    this.alive = true
    this.statSize = Math.ceil(sampleRate / 128)
    this.stat = new Float32Array(2 * this.statSize)
    this.statPtr = 0
    this.ts = 0

    this.port.onmessage = ({ data: keepalive }) => {
      if (!this.alive) return
      if (keepalive) {
        const message = { vadProb: this.exports.getVadProb(this.state) }
        if (keepalive === 'stat') message.stat = this.stat
        this.port.postMessage(message)
      } else {
        this.alive = false
        this.exports.deleteState(this.state)
      }
    }
  }

  process(inputs, outputs) {
    if (!this.alive) return false

    const input = inputs[0]?.[0]
    const output = outputs[0]?.[0]
    if (!input || !output) return true

    const heap = new Float32Array(this.exports.memory.buffer)
    const ts = Date.now()

    heap.set(input, this.exports.getInput(this.state) >> 2)
    const ptr = this.exports.pipe(this.state, output.length) >> 2
    if (ptr) {
      output.set(heap.subarray(ptr, ptr + output.length))
    }

    if (this.ts !== 0) {
      this.stat[this.statPtr] = ts - this.ts
      this.stat[this.statPtr + this.statSize] = Date.now() - this.ts
      this.statPtr = (this.statPtr + 1) % this.statSize
    }
    this.ts = ts
    return true
  }
}

registerProcessor('rnnoise', RNNoiseProcessor)
