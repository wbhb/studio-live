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
      this.#writer.ready.then(() => {
        return this.#writer.write(input);
      });
    } else if (this.#state === RecorderProcessor.States.finalising) {
      this.#writer.ready.then(() => {
        this.#state = RecorderProcessor.States.idle;
        this.#writer.releaseLock();
        this.#writer = null;
        keepAlive = false;
      });
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
        break;
      case 'kill':
        this.#state = RecorderProcessor.States.finalising;
        break;
      case 'stream':
        this.stream = msg.data.stream;
        break;
    }
  }
}

registerProcessor('recorder-processor', RecorderProcessor);