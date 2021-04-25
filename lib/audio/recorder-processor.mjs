import {RingBuffer} from '../util/ringBuffer.mjs';

class RecorderProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [];
  }
  
  static States = {
    idle: null,
    recording: Symbol('recording'),
    finalising: Symbol('finalising')
  };
  
  #state = RecorderProcessor.States.idle;
  
  #ringBuffer;
  
  #swap = false;
  
  constructor (options) {
    super({
      numberOfInputs: 1,
      numberOfOutputs: 0,
      parameterData: null
    });
    this.port.addEventListener('message', this.#messageHandler.bind(this));
    this.port.start();
  }
  
  process (inputs, outputs, parameters) {
    const input = inputs[0][0];
    // const output = outputs[0][0];
    
    let keepAlive = true;
    
    if (this.#state === RecorderProcessor.States.recording) {
      
      this.#ringBuffer.write(input);
      
      if (!this.#swap && this.#ringBuffer.tail >= this.#ringBuffer.length / 2) {
        this.#swap = true;
        this.port.postMessage({
          command: 'swap',
          low: true
        });
      } else if (this.#swap && this.#ringBuffer.tail < this.#ringBuffer.length / 2) {
        this.#swap = false;
        this.port.postMessage({
          command: 'swap',
          high: true
        });
      }
      
    } else if (this.#state === RecorderProcessor.States.finalising) {
      keepAlive = false;
    }
    
    return keepAlive;
  }
  
  #messageHandler(msg) {
    switch (msg?.data?.command) {
      case 'start':
        this.#state = RecorderProcessor.States.recording;
        break;
      case 'stop':
        this.#state = RecorderProcessor.States.finalising;
        this.port.postMessage({
          command: 'finalise',
          finaliseStart: this.#swap ? this.#ringBuffer.length / 2 : 0,
          finaliseEnd: this.#ringBuffer.tail
        });
        break;
      case 'kill':
        this.#state = RecorderProcessor.States.finalising;
        break;
      case 'sab':
        this.#ringBuffer = new RingBuffer({
          buffer: new Float32Array(msg.data.sharedArrayBuffer)
        });
        break;
    }
  }
}

registerProcessor('recorder-processor', RecorderProcessor);