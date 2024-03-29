import {MIDI} from '../util/midi.mjs';
import {EnvelopeNode} from './envelope.mjs'; 
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Synth extends EventTarget {
  
  #oscillators = new Map();
  
  envelope;
  
  #audioOut;
  
  constructor(inputs, audioOut) {
    super();
    this.attack = inputs.attack;
    this.decay = inputs.decay;
    this.sustain = inputs.sustain;
    this.release = inputs.release;
    this.detune = inputs.detune;
    
    this.#audioOut = audioOut;
  }
  
  start(time, note) {
    
    time = time ?? GlobalScheduler.audioContext.currentTime;
    
    if (this.#oscillators.has(note)) {
      this.#oscillators.get(note).envelope.key.setValueAtTime(1.0, time);
      return;
    }
    
    try {
      const envelope = new EnvelopeNode(GlobalScheduler.audioContext, /*{
        attack: 0.25,
        decay: 0.25,
        sustain: 0.5,
        release: 0.5
      }*/);
    
      envelope.connect(this.#audioOut);
      
      this.attack.connect(envelope.attack);
      this.decay.connect(envelope.decay);
      this.sustain.connect(envelope.sustain);
      this.release.connect(envelope.release);
      
      const oscillator = GlobalScheduler.audioContext.createOscillator();
  
      oscillator.type = 'triangle';
      const freq = MIDI.getNoteFrequency(note);
      oscillator.frequency.setValueAtTime(freq, time);
      oscillator.connect(envelope);
      this.detune.connect(oscillator.detune);
      oscillator.start(time);
      // envelope.start(time);
      envelope.key.setValueAtTime(1.0, time);
      
      this.#oscillators.set(note, {oscillator: oscillator, envelope: envelope});
    
    } catch (e) {
      console.debug(e);
      return;
    }
  }
  
  stop(time, note) {
    
    if (!this.#oscillators.has(note)) {
      return;
    }
    
    let oscillator = this.#oscillators.get(note);
    
    this.#oscillators.delete(note);
    
    const finalise = () => {
      oscillator.oscillator.stop();
      oscillator = null;
    };
    
    oscillator.envelope.addEventListener('ended', finalise, {once: true});
    
    // oscillator.envelope.stop(time);
    oscillator.envelope.key.setValueAtTime(0.01, time || GlobalScheduler.audioContext.currentTime);
  }
  
  stopAll(time) {
    for (let [note] of this.#oscillators) {
      this.stop(time, note);
    }
  }
}