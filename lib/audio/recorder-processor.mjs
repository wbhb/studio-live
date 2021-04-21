class RecorderProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [];
  }
  
  static States = {
    idle: null,
    recording: Symbol('recording'),
    finalising: Symbol('finalising')
  };
  
  #stream;
  #writer;
  #state = RecorderProcessor.States.idle;
  
  #frameCounter = 0;
  
  constructor (options) {
    super({
      numberOfInputs: 1,
      numberOfOutputs: 0,
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
    const input = inputs[0][0];
    // const output = outputs[0][0];
    
    let keepAlive = true;
    
    if (this.#state === RecorderProcessor.States.recording) {
      
      console.log(`Rec:
      sab length: ${this.sharedArrayBuffer.length}
      input length: ${input.length}
      frame length: ${this.#frameCounter * 128}`);
      
      if (this.#frameCounter * 128 + input.length < this.sharedArrayBuffer.length) {
      
        this.sharedArrayBuffer.set(input, this.#frameCounter * 128);
        this.#frameCounter++;
      
      } else {
        console.warn("Full");
      }
      // this.#writer.ready.then(() => {
      //   return this.#writer.write(input);
      // });
      // this.#writer.write(input);
    } else if (this.#state === RecorderProcessor.States.finalising) {
      keepAlive = false;
    }
    
    return keepAlive;
  }
  
  #messageHandler(msg) {
    switch (msg.data.command) {
      case 'start':
        this.#state = RecorderProcessor.States.recording;
        this.#writer = this.stream.getWriter();
        break;
      case 'stop':
        this.#state = RecorderProcessor.States.finalising;
        this.#writer?.ready.then(() => {
          this.#state = RecorderProcessor.States.idle;
          this.#writer.releaseLock();
          this.#writer = null;
        });
        break;
      case 'kill':
        this.#state = RecorderProcessor.States.finalising;
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

registerProcessor('recorder-processor', RecorderProcessor);