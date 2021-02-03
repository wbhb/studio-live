class EnvelopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [
    {
      name: 'attack',
      defaultValue: 1.0,
      minValue: 0.0,
      automationRate: 'k-rate'
    },
    {
      name: 'decay',
      defaultValue: 1.0,
      minValue: 0.0,
      automationRate: 'k-rate'
    },
    {
      name: 'sustain',
      defaultValue: 1.0,
      minValue: 0.0,
      maxValue: 1.0,
      automationRate: 'k-rate'
    },
    {
      name: 'release',
      defaultValue: 1.0,
      minValue: 0.0,
      automationRate: 'k-rate'
    }
    ]
  }
  
  static Phases = {
    idle: null,
    attack: Symbol('attack'),
    decay: Symbol('decay'),
    sustain: Symbol('sustain'),
    release: Symbol('release')
  }
  
  static OffThreshold = 1.0 / 128;
  
  #phase = EnvelopeProcessor.Phases.idle;
  #gain = 0.0;
  #quanta = 1.0/sampleRate;
  
  constructor (options) {
    super({
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      parameterData: null
    });
    this.port.addEventListener('message', this.#messageHandler.bind(this));
    this.port.start();
  }
  
  process (inputs, outputs, parameters) {
    const input = inputs[0][0];
    const output = outputs[0][0];
    
    currentTime
    
    inputs.forEach((input, i) => {
      
      if (this.#phase == EnvelopeProcessor.Phases.idle) {
        if (input != 0) {
          this.#phase = EnvelopeProcessor.Phases.attack;
        }
        this.#gain = 0.0;
      }
      
      if (this.#phase == EnvelopeProcessor.Phases.attack) {
        if (this.#gain >= 1 || parameters['attack'][0] == 0.0) {
          this.#phase = EnvelopeProcessor.Phases.decay;
        }
        this.#gain += this.#quanta / parameters['attack'][0];
      }
      
      if (this.#phase == EnvelopeProcessor.Phases.decay) {
        if (this.#gain <= parameters.sustain || parameters['decay'][0] == 0.0) {
          this.#phase = EnvelopeProcessor.Phases.decay;
        }
        this.#gain -= this.#quanta / parameters['decay'][0];
      }
      
      if (this.#phase == EnvelopeProcessor.Phases.sustain) {
        this.#gain = parameters['sustain'][0];
      }
      
      if (this.#phase == EnvelopeProcessor.Phases.release) {
        if (this.#gain <= EnvelopeProcessor.OffThreshold  || parameters['release'][0] == 0.0) {
          this.#gain = 0.0
          this.#phase = EnvelopeProcessor.Phases.idle;
        } else {
          this.#gain -= this.#quanta / parameters['release'][0];
        }
      }
      
      output[i] = input * this.#gain;
    });
    
    if (this.#phase === EnvelopeProcessor.Phases.release ) {
      return true;
    }
    return false;
  }
  
  #messageHandler(msg) {
    switch (msg.data.command) {
      case 'start':
        this.#phase = EnvelopeProcessor.Phases.attack;
        break;
      case 'stop':
        this.#phase = EnvelopeProcessor.Phases.release;
        break;
      case 'kill':
        this.#phase = EnvelopeProcessor.Phases.idle;
        break;
    }
  }
}

registerProcessor('envelope-processor', EnvelopeProcessor);