import {MIDI} from '../util/midi.mjs';
import {Envelope} from './envelope.mjs'; 
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Synth extends EventTarget {
  
  #oscillators = new Map();
  
  envelope = new Envelope({
    attack: 0.25,
    decay: 0.125,
    sustain: 0.5,
    release: 0.5
  });
  
  constructor() {
    super()
  }
  
  start(time, note) {
    
    if (this.#oscillators.has(note)) {
      console.info(`note #${note} already playing`);
      return;
    }
    
    const envelope = this.envelope.createEnvelopeNode(this.envelopeParams);
    
    envelope.connect(GlobalScheduler.audioContext.destination);
    
    const oscillator = GlobalScheduler.audioContext.createOscillator();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(MIDI.getNoteFrequency(note), GlobalScheduler.audioContext.currentTime);
    oscillator.connect(envelope);
    oscillator.start(time);
    envelope.start(time);
    
    this.#oscillators.set(note, {oscillator: oscillator, envelope: envelope});
  }
  
  stop(time, note) {
    
    if (!this.#oscillators.has(note)) {
      console.info(`note #${note} not playing`);
      return;
    }
    
    const oscillator = this.#oscillators.get(note);
    
    let holdingRef = this.#oscillators.get(note)
    
    this.#oscillators.delete(note);
    
    const finalise = () => {
      oscillator.oscillator.stop();
      oscillator.envelope.removeEventListener('ended', finalise);
      holdingRef = null;
    };
    
    oscillator.envelope.addEventListener('ended', finalise);
    
    oscillator.envelope.stop(time);
  }
  
  stopAll(time) {
    for (let [note] of this.#oscillators) {
      this.stop(time, note);
    }
  }
}