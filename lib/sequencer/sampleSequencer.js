import {Sequencer} from "./sequencer.js";

export const SampleCache = new WeakMap();

export class SampleSequencer extends Sequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, config);
    
    this._init();
  }
  
  async _init() {
    this.config.samples.forEach(SampleSequencer._cacheSample.bind(this));
  }
  
  static async _cacheSample(url) {
    if (!SampleCache.has(url)) {
      const sample = await SampleSequencer._setupSample(url);
      this.scheduler.addEventListener('AudioContextChanged', async () => {
        const decodedSample = await this.scheduler.audioContext.decodeAudioData(sample);
        SampleCache.set(url, decodedSample);
      }); 
      
    }
  }
  
  static async _setupSample(filepath) {
    const response = await window.fetch(filepath);
    return response.arrayBuffer();
  }
  
  async _createSampleNode(sampleUrl, options) {
    const sampleSource = this.scheduler.audioContext.createBufferSource();
    let tail = sampleSource;
    
    const sample = SampleCache.get(sampleUrl);
    if (!SampleCache.get(sampleUrl)) {
      console.warn('sample not cached yet, ignoring');
      sampleSource.buffer = this.scheduler.audioContext.createBuffer(1, 1, this.scheduler.audioContext.sampleRate);
    } else {
      sampleSource.buffer = sample;
    }
    
    if (options && options.gain) {
      const gainNode = this.scheduler.audioContext.createGain();
      gainNode.gain.value = options.gain;
      tail.connect(gainNode);
      tail = gainNode;
    }
    
    tail.connect(this.scheduler.audioContext.destination);
    return sampleSource;
  }

}
