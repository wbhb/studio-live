import {RingBuffer} from '../util/ringBuffer.mjs';

class PlaybackProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [];
  }
  
  static States = {
    idle: null,
    playing: Symbol('playing'),
    finalising: Symbol('finalising')
  };
  
  #ringBuffer;
  #state = PlaybackProcessor.States.idle;
  
  #swap;
  
  constructor (options) {
    super({
      numberOfInputs: 0,
      numberOfOutputs: 1,
      parameterData: null
    });
    this.port.addEventListener('message', this.#messageHandler.bind(this));
    this.port.start();
    
  }
  
  process (inputs, outputs, parameters) {
    // const input = inputs[0][0];
    const output = outputs[0][0];
    
    let keepAlive = true;
    
    if (this.#state === PlaybackProcessor.States.playing) {
      this.#ringBuffer.fakeWrite(output.length);
      const buf = this.#ringBuffer.read(output.length);
      if (buf) {
        output.set(buf);
      }
      
      if (!this.#swap && this.#ringBuffer.head > this.#ringBuffer.length / 2) {
        this.#swap = true;
        console.log(`swapSL`);
        this.port.postMessage('swap', {low: true});
      } else if (this.#swap && this.#ringBuffer.head < this.#ringBuffer.length / 2) {
        this.#swap = false;
        
        console.log('swapSH');
        this.port.postMessage('swap', {high: true});
      }
      
    }
    
    return keepAlive;
  }
  
  #messageHandler(msg) {
    switch (msg.data.command) {
      case 'start':
        this.#state = PlaybackProcessor.States.playing;
        this.#ringBuffer.fakeReset();
        break;
      case 'stop':
        console.log("stop");
        this.#state = PlaybackProcessor.States.finalising;
        break;
      case 'kill':
        this.#state = PlaybackProcessor.States.finalising;
        break;
      case 'sab':
        this.#ringBuffer = new RingBuffer({
          buffer: new Float32Array(msg.data.sharedArrayBuffer)
        });
        break;
    }
  }
}

registerProcessor('playback-processor', PlaybackProcessor);