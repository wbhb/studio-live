import {MIDI} from '../util/midi.js';

export class Synth extends EventTarget {
  
  #oscillators;
  #audioContext;
  
  constructor(audioContext) {
    super()
    
    this.#oscillators = new Map();
    
    this.#audioContext = audioContext;
  }
  
  start(note) {
    
    if (this.#oscillators.has(note)) {
      console.info(`note #${note} already playing`);
      return;
    }
    
    const envelope = this.#audioContext.createGain();
    envelope.gain.exponentialRampToValueAtTime(1.0, this.#audioContext.currentTime + this.attack);
    setTimeout(() => {
      
      const oscHandle = this.#oscillators.get(note);
      
      this.#oscillators.get(note).starting = false;
      if (this.#oscillators.get(note).ending === true) {
        this.stop(note);
        return;
      }
      envelope.gain.exponentialRampToValueAtTime(this.sustain, this.#audioContext.currentTime + this.decay);
    }, this.attack*1000+25);
    
    envelope.connect(this.#audioContext.destination);
    
    const oscillator = this.#audioContext.createOscillator();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(MIDI.getNoteFrequency(note), this.#audioContext.currentTime);
    oscillator.connect(envelope);
    oscillator.start();
    
    this.#oscillators.set(note, {oscillator: oscillator, envelope: envelope, starting: true, ending: false});
  }
  
  stop(note) {
    
    if (!this.#oscillators.has(note)) {
      console.info(`note #${note} not playing`);
      return;
    }
    
    const oscillator = this.#oscillators.get(note);
    
    if (this.#oscillators.get(note).starting) {
      // will auto-stop once attack ends
      oscillator.ending = true;
      return;
    }
    
    oscillator.ending = true;
    oscillator.envelope.gain.exponentialRampToValueAtTime(0.01, this.#audioContext.currentTime + this.release);
    
    this.#oscillators.delete(note);
    
    setTimeout(() => {
      
      oscillator.oscillator.stop();
      
    }, this.release*1000+25);
    
  }
}