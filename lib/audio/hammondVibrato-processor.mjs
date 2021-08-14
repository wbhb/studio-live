class HammondVibratoProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors () {
    return [];
  }
  
  constructor(options) {
    super({
      numberOfInputs: 18, // audio, lfo, delay 1-16ms 
      numberOfOutputs: 1,
      outputChannelCount: [1],
      parameterData: null
    });
    // this.port.addEventListener('message', this.#messageHandler.bind(this));
    // this.port.start();
  }
  
  process (inputs, outputs, parameters) {
    const input = inputs[0][0];
    const lfo = inputs[1][0];
    const output = outputs[0][0];
    
    let scanner;
    
    let delay;
    
    let hlfo;
    
    let fade;
    
    let keepAlive = true;
    
    input?.forEach((sample, i) => {
      
      hlfo = (lfo[i] + 1)/2;
      
      scanner = Math.floor(hlfo*16);
    
      delay = inputs[scanner + 2][0];
      
      
      fade = hlfo % 0.0625;
      
      if (fade >= 0.03125) {
        fade -= hlfo % 0.03125;
      }
      
      fade *= 16;
      
      output[i] = (sample + delay[i] * fade) / 2;
    });
    
    return keepAlive;
  }
}

registerProcessor('hammondVibrato-processor', HammondVibratoProcessor);