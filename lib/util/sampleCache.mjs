import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

const DefaultSampleCache = new Map();

export class SampleCache {
  
  static async add(url) {
    const key = url.toString();
    if (!DefaultSampleCache.has(key)) {
      DefaultSampleCache.set(key, null)
      const sample = await SampleCache._setupSample(key);
      if (GlobalScheduler.audioContext) {
        SampleCache._decodeAndStoreSample(key, sample);
      }
      GlobalScheduler.addEventListener('AudioContextChanged', () => {SampleCache._decodeAndStoreSample(key, sample)});
    }
  }
  
  static async cacheSample(url) {
    console.warn("SampleCache.cacheSample(url) is deprecated - use SampleCache.add(url)");
    return SampleCache.add(url);
  }
  
  static async _setupSample(filepath) {
    const response = await window.fetch(filepath);
    return response.arrayBuffer();
  }
  
  static async _decodeAndStoreSample(key, sample) {
    const decodedSample = await GlobalScheduler.audioContext.decodeAudioData(sample);
    DefaultSampleCache.set(key, decodedSample);
  }
  
  static async getNode(url) {
    
    const key = url.toString();
    
    const sampleSource = GlobalScheduler.audioContext.createBufferSource();
    
    let sample = DefaultSampleCache.get(key);
    if (!sample) {
      console.warn('sample not cached yet, ignoring');
      sample = GlobalScheduler.audioContext.createBuffer(1, 1, GlobalScheduler.audioContext.sampleRate);
    }
    
    sampleSource.buffer = sample;
    
    return sampleSource;
  }
  
  static async createSampleNode(url, options) {
    
    const key = url.toString();
    
    const sampleSource = await SampleCache.getNode(key);
    let tail = sampleSource;
    
    if (options?.gain) {
      const gainNode = GlobalScheduler.audioContext.createGain();
      gainNode.gain.value = options.gain;
      tail.connect(gainNode);
      tail = gainNode;
    }
    
    tail.connect(GlobalScheduler.audioContext.destination);
    return sampleSource;
  }

}
