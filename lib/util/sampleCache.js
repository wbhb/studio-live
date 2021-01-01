import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

const DefaultSampleCache = new WeakMap();

export class SampleCache {
  
  static async add(url) {
    if (!DefaultSampleCache.has(url)) {
      const sample = await SampleCache._setupSample(url);
      GlobalScheduler.addEventListener('AudioContextChanged', async () => {
        const decodedSample = await GlobalScheduler.audioContext.decodeAudioData(sample);
        DefaultSampleCache.set(url, decodedSample);
      });
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
  
  static async getNode(sampleUrl) {
    const sampleSource = GlobalScheduler.audioContext.createBufferSource();
    
    const sample = DefaultSampleCache.get(sampleUrl);
    if (!DefaultSampleCache.get(sampleUrl)) {
      console.warn('sample not cached yet, ignoring');
      sampleSource.buffer = GlobalScheduler.audioContext.createBuffer(1, 1, GlobalScheduler.audioContext.sampleRate);
    } else {
      sampleSource.buffer = sample;
    }
    
    return sampleSource;
  }
  
  static async createSampleNode(sampleUrl, options) {
    const sampleSource = await SampleCache.getNode(sampleUrl);
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
