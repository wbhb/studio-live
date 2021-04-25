import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class EnvelopeNode extends AudioWorkletNode {
  
  /*
   * attack: rise time int/float in seconds
   * decay: decay time int/float in seconds
   * sustain: sustain volume, float from 0.0 to 1.0 (out of range is clamped)
   * release: release time int/float in seconds
   *
   * gain will always start at 0 when created and started
   */
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, 'envelope-processor');
    
    this.attack.setValueAtTime(options?.attack || 0.1, this.context.currentTime);
    this.decay.setValueAtTime(options?.decay || 0.1, this.context.currentTime);
    this.sustain.setValueAtTime(options?.sustain || 0.75, this.context.currentTime);
    this.release.setValueAtTime(options?.release || 0.1, this.context.currentTime);
    
    this.port.onmessage = (e) => {
      if (e.data.command === 'stop') {
        this.dispatchEvent(new Event('ended'));
      }
    };
  }
  
  start(time) {
    
    const startTime = time || GlobalScheduler.audioContext.currentTime;
    
    this.port.postMessage({
      command: 'start',
      time: startTime
    });
  }
  
  stop(time) {
    
    const stopTime = time || GlobalScheduler.audioContext.currentTime;
    
    this.port.postMessage({
      command: 'stop',
      time: stopTime
    });
  }
  
  get attack() {
    return this.parameters.get('attack');
  }
  
  get decay() {
    return this.parameters.get('decay');
  }
  
  get sustain() {
    return this.parameters.get('sustain');
  }
  
  get release() {
    return this.parameters.get('release');
  }
  
  get key() {
    return this.parameters.get('key');
  }
}


GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/envelope-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e)});
