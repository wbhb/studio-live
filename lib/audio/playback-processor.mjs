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
  
  #stream;
  #reader;
  #ringBuffer = new RingBuffer(Float32Array);
  #state = PlaybackProcessor.States.idle;
  
  #frameCounter = 0;
  
  constructor (options) {
    super({
      numberOfInputs: 0,
      numberOfOutputs: 1,
      parameterData: null
    });
    this.port.addEventListener('message', this.#messageHandler.bind(this));
    this.port.start();
    
    if (options?.stream) {
      this.stream = options.stream;
    }
  }
  
  set stream(stream) {
    this.#stream = stream;
  }
  
  get stream() {
    return this.#stream;
  }
  
  process (inputs, outputs, parameters) {
    // const input = inputs[0][0];
    const output = outputs[0][0];
    
    let keepAlive = true;
    
    if (this.#state === PlaybackProcessor.States.playing) {
      if (this.#frameCounter > 50) {
        const start = (this.#frameCounter-50) * 128;
        output.set(this.sharedArrayBuffer.slice(start, start + output.length));
      }
      this.#frameCounter++;
    }
    
    // if (this.#state === PlaybackProcessor.States.playing || this.#state === PlaybackProcessor.States.finalising) {
    //   const buf = this.#ringBuffer.read(output.length);
    //   if (buf?.length > 0) {
    //     // console.info(`buf`);
    //     output.set(buf);
    //   } else {
    //     console.info(`no buf`);
    //   }
    //   if (this.#state === PlaybackProcessor.States.playing && this.#ringBuffer.filledLength < output.length * 4*4) {
    //     // console.log("free refills");
    //     this.fillBuffer(output.length * 4 * 4);
    //     // return;
    //   }
    //   if (this.#state === PlaybackProcessor.States.finalising && !buf?.length) {
    //     this.#reader.releaseLock();
    //     this.#reader = null;
    //     this.#ringBuffer.reset();
    //     this.#state = PlaybackProcessor.States.idle;
    //     // return false;
    //   }
    // } else if (this.#state === PlaybackProcessor.States.finalising) {
    //   console.log("Drained");
    //   this.#reader.releaseLock();
    //   this.#reader = null;
    //   this.#state = PlaybackProcessor.States.idle;
    // }
    
    return keepAlive;
  }
  
  fillBuffer = async (minFill) => {
    
    // console.info(`filling ringBuf ${minFill}`);
    
    if (this.#state === PlaybackProcessor.States.finalising) {
      // this.#reader.releaseLock();
      // this.#reader = null;
      // this.#state = PlaybackProcessor.States.idle;
      return;
    }
    
    if (this.#ringBuffer.filledLength >= minFill) {
      // console.info('ringBuf filled');
      return;
    }
    
    const {value, done} = await this.#reader.read();
    
    if (!done) {
      // console.info('filling ringBuf');
      this.#ringBuffer.write(value);
    }
    
    // if (this.#state === PlaybackProcessor.States.playing) {
    //   await this.fillBuffer(minFill);
    // }
  }
  
  #messageHandler(msg) {
    switch (msg.data.command) {
      case 'start':
        this.#state = PlaybackProcessor.States.playing;
        this.#frameCounter = 0;
        // this.#reader = this.stream.getReader();
        // this.fillBuffer(256);
        break;
      case 'stop':
        console.log("stop");
        this.#state = PlaybackProcessor.States.finalising;
        break;
      case 'kill':
        this.#state = PlaybackProcessor.States.finalising;
        break;
      case 'stream':
        this.stream = msg.data.stream;
        break;
      case 'sab':
        this.sharedArrayBuffer = new Float32Array(msg.data.sharedArrayBuffer);
        break;
    }
  }
}

registerProcessor('playback-processor', PlaybackProcessor);