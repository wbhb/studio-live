import {Sequencer} from "./sequencer.js";

export class SampleSequencer extends Sequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, config);
    
    this._samples = {};
    
    this._init();
  }
  
  async _init() {
    for (let sample of this._config.samples) {
      this._samples[sample.name] = await this._setupSample(sample.filename);
    }
  }
  
  async _setupSample(filepath) {
    const response = await window.fetch(filepath);
    return response.arrayBuffer();
  }
  
  async _createSampleNode(sampleName, options) {
    const sampleSource = this._scheduler.audioContext.createBufferSource();
    let tail = sampleSource;
    if (this._samples[sampleName] instanceof ArrayBuffer) {
      this._samples[sampleName] = await this._scheduler.audioContext.decodeAudioData(this._samples[sampleName]);
    }
    sampleSource.buffer = this._samples[sampleName];
    if (options && options.gain) {
      const gainNode = this._scheduler.audioContext.createGain();
      gainNode.gain.value = options.gain;
      tail.connect(gainNode);
      tail = gainNode;
    }
    tail.connect(this._scheduler.audioContext.destination);
    return sampleSource;
  }

}
