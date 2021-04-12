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
      const buf = this.#ringBuffer.read(output.length);
      if (buf?.length > 0) {
        output.set(buf);
        // console.info(`buf.length: ${buf.length}`);
      // } else {
      //   console.info(`no buf`);
      }
    } else if (this.#state === PlaybackProcessor.States.finalising) {
      
      this.#state = PlaybackProcessor.States.idle;
      this.#reader.releaseLock();
      this.#reader = null;
      keepAlive = false;
    }
    
    return keepAlive;
  }
  
  fillBuffer = async (minFill) => {
    
    // console.info(`filling ringBuf ${minFill}`);
    
    if (this.#ringBuffer.filledLength >= minFill) {
      // console.info('ringBuf filled');
      return;
    }
    
    const {value, done} = await this.#reader.read();
    
    if (!done) {
      // console.info('filling ringBuf');
      this.#ringBuffer.write(value);
    }
    
    if (this.#state === PlaybackProcessor.States.playing) {
      await this.fillBuffer(minFill);
    }
  }
  
  #messageHandler(msg) {
    switch (msg.data.command) {
      case 'start':
        this.#state = PlaybackProcessor.States.playing;
        this.#reader = this.stream.getReader();
        this.fillBuffer(2048);
        break;
      case 'stop':
        console.log('stop');
        this.#state = PlaybackProcessor.States.finalising;
        break;
      case 'kill':
        this.#state = PlaybackProcessor.States.finalising;
        break;
      case 'stream':
        this.stream = msg.data.stream;
        break;
    }
  }
}

registerProcessor('playback-processor', PlaybackProcessor);