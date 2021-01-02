import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class EnvelopeNode extends GainNode {
  
  #attack;
  #decay;
  #sustain;
  #release;
  
  /*
   * attack: rise time int/float in seconds
   * decay: decay time int/float in seconds
   * sustain: sustain volume, float from 0.0 to 1.0 (out of range is clamped)
   * release: release time int/float in seconds
   *
   * gain will always start at 0 when created and started
   */
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, {...options});
    
    this.#attack = options?.attack || 0.1;
    this.#decay = options?.decay || 0.1;
    this.#sustain = options?.sustain || 0.75;
    this.#release = options?.release || 0.1;
  }
  
  start(time) {
    
    this.gain.exponentialRampToValueAtTime(1.0, time + this.#attack);
    this.gain.exponentialRampToValueAtTime(this.#sustain, time + this.#attack + this.#decay);
  }
  
  stop(time) {
    
    this.gain.cancelAndHoldAtTime(time)
    this.gain.exponentialRampToValueAtTime(0.0001, time + this.#release);
    
    setTimeout(() => {
      
      this.gain.value = 0;
      this.dispatchEvent(new Event('ended'));
      
    }, time + (this.#release*1000));
  }
}

export class Envelope {
  
  #attack;
  #decay;
  #sustain;
  #release;
  
  constructor(options) {
    this.attack = options?.attack || 0.1;
    this.decay = options?.decay || 0.1;
    this.sustain = options?.sustain || 0.75;
    this.release = options?.release || 0.1;
  }
  
  createEnvelopeNode() {
    return new EnvelopeNode(GlobalScheduler.audioContext, {
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release
    })
  }
  
  set attack(newVal) {
    this.#attack = newVal;
  }
  
  get attack() {
    return this.#attack;
  }
  
  set decay(newVal) {
    this.#decay = newVal;
  }
  
  get decay() {
    return this.#decay;
  }
  
  set sustain(newVal) {
    this.#sustain = newVal;
  }
  
  get sustain() {
    return this.#sustain;
  }
  
  set release(newVal) {
    this.#release = newVal;
  }
  
  get release() {
    return this.#release;
  }
}