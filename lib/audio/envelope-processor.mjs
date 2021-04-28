class EnvelopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [
    {
      name: 'attack',
      defaultValue: 0.0,
      minValue: 0.0,
      automationRate: 'k-rate'
    },
    {
      name: 'decay',
      defaultValue: 0.0,
      minValue: 0.0,
      automationRate: 'k-rate'
    },
    {
      name: 'sustain',
      defaultValue: 0.0,
      minValue: 0.0,
      maxValue: 1.0,
      automationRate: 'k-rate'
    },
    {
      name: 'release',
      defaultValue: 0.0,
      minValue: 0.0,
      automationRate: 'k-rate'
    },
    {
      name: 'key',
      defaultValue: 0.0,
      minValue: 0.0,
      maxValue: 1.0,
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
    
    let gain = this.#gain;
    let step = 0.0;
    
    let keepAlive = true;
    
    if (this.#phase === EnvelopeProcessor.Phases.idle) {
      if (parameters['key'][0] > 0.1) {
        this.#phase = EnvelopeProcessor.Phases.attack;
      }
    } else {
      if (parameters['key'][0] <= 0.1) {
        this.#phase = EnvelopeProcessor.Phases.release;
      }
    }
    
    switch (this.#phase) {
      case EnvelopeProcessor.Phases.idle:
        gain = 0.0;
        break;
      
      case EnvelopeProcessor.Phases.attack:
        if (gain >= 1 || parameters['attack'][0] == 0.0) {
          this.#phase = EnvelopeProcessor.Phases.decay;
        }
        step = this.#quanta / parameters['attack'][0];
        break;
      
      case EnvelopeProcessor.Phases.decay:
        if (gain <= parameters.sustain || parameters['decay'][0] == 0.0) {
          this.#phase = EnvelopeProcessor.Phases.sustain;
        }
        step = 0.0 - this.#quanta / parameters['decay'][0];
        break;
      
      case EnvelopeProcessor.Phases.sustain:
        gain = parameters['sustain'][0];
        step = 0.0;
        break
      
      case EnvelopeProcessor.Phases.release:
        if (gain <= EnvelopeProcessor.OffThreshold  || parameters['release'][0] == 0.0) {
          gain = 0.0
          step = 0.0;
          this.#phase = EnvelopeProcessor.Phases.idle;
          this.port.postMessage({command: 'stop'});
          keepAlive = false;
        } else {
          step = 0.0 - this.#quanta / parameters['release'][0];
        }
        break;
    }
    
    input?.forEach((sample, i) => {
      
      gain += step;
      
      output[i] = sample * gain;
    });
    
    this.#gain = gain;
    
    // if (this.#phase === EnvelopeProcessor.Phases.idle ) {
    //   return false;
    // }
    return keepAlive;
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