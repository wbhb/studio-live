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
      outputChannelCount: [1],
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
        
        const iDat = new DataView(buf.buffer);
        const oDat = new DataView(output.buffer);
        
        for (let i = 0; i < iDat.byteLength; i += Float32Array.BYTES_PER_ELEMENT) {
          oDat.setFloat32(i, iDat.getFloat32(i));
          // console.log(`${i}: ${iDat.getFloat32(i)} -> ${oDat.getFloat32(i)}`);
        }
        
        // output.set(buf);
        // console.log(output);
      }
      
      if ((!this.#swap) && this.#ringBuffer.head >= this.#ringBuffer.length / 2) {
        this.#swap = true;
        console.log(`swapSL`);
        this.port.postMessage({
          command: 'swap',
          low: true
        });
        
      } else if (this.#swap && this.#ringBuffer.head < this.#ringBuffer.length / 2) {
        this.#swap = false;
        console.log('swapSH');
        this.port.postMessage({
          command: 'swap',
          high: true
        });
      }
      
    }
    
    return keepAlive;
  }
  
  #messageHandler(msg) {
    switch (msg.data.command) {
      case 'start':
        this.#state = PlaybackProcessor.States.playing;
        this.#ringBuffer.fakeReset();
        this.#swap = false;
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