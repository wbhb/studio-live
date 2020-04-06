import {Sequencer} from "./sequencer.js";

export const SampleCache = new WeakMap();

export class SampleSequencer extends Sequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, config);
    
    this._init();
  }
  
  async _init() {
    this.config.samples.forEach(SampleSequencer._cacheSample);
  }
  
  static async _cacheSample(url) {
    if (!SampleCache.has(url)) {
      const sample = await SampleSequencer._setupSample(url);
      SampleCache.set(url, sample);
    }
  }
  
  static async _setupSample(filepath) {
    const response = await window.fetch(filepath);
    return response.arrayBuffer();
  }
  
  async _createSampleNode(sampleUrl, options) {
    const sampleSource = this.scheduler.audioContext.createBufferSource();
    let tail = sampleSource;
    if (SampleCache.get(sampleUrl) instanceof ArrayBuffer) {
      const sample = await this.scheduler.audioContext.decodeAudioData(SampleCache.get(sampleUrl));
      SampleCache.set(sampleUrl, sample);
    }
    sampleSource.buffer = SampleCache.get(sampleUrl);
    if (options && options.gain) {
      const gainNode = this.scheduler.audioContext.createGain();
      gainNode.gain.value = options.gain;
      tail.connect(gainNode);
      tail = gainNode;
    }
    tail.connect(this.scheduler.audioContext.destination);
    return sampleSource;
  }
  
  _nextBar(e) {
    super._nextBar(e);
  }

}
