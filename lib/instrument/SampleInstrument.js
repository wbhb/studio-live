import {MIDIInstrument} from './MIDIInstrument.js';
import {MIDI} from '../util/midi.js';
import {SampleCache} from '../util/sampleCache.js';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class SampleInstrument extends MIDIInstrument {
  
  #sampleMessageHandlers = new Map([
    [
      MIDI.Note_On, (message) => {
        this.voices[message.note].start(this.audioContext, message.velocity / 127.0);
      }
    ],
    [
      MIDI.Note_Off, (message) => {
        this.voices[message.note].stop();
      },
    ],
    [
      MIDI.Polyphonic_Key_Pressure, (message) => {
        this.voices[message.note].changeVolume(message.pressure / 127.0);
      }
    ]
  ]);
  
  #voices;
  
  constructor(config) {
    super(config);
    
    this.#voices = config.voices;
  }
  
  get messageHandlers() {
    return this.#sampleMessageHandlers;
  }
  
  get voices() {
    return this.#voices;
  }
}

export class Voice {
  
  #sample;
  #sampleNode;
  #gainNode;
  #tail;
  
  #active;
  
  #boundListeners = {};
  
  constructor(sample) {
    this.#sample = sample;
    SampleCache.add(this.sample);
    
    this.#active = false;
    
    this.#bindListeners();
  }
  
  #bindListeners() {
    this.#boundListeners.cleanup = this.#cleanup.bind(this);
  }
  
  get sample() {
    return this.#sample;
  }
  
  get active() {
    return this.#active;
  }
  
  async start(audio, gain, tail) {
    this.#sampleNode = await SampleCache.getNode(this.sample);
    
    this.#sampleNode.addEventListener('ended', this.#boundListeners.cleanup);
    
    this.#gainNode = await GlobalScheduler.audioContext.createGain();
    this.#gainNode.gain.value = gain || 1.0;
    
    this.#sampleNode.connect(this.#gainNode)
    
    this.#tail = tail;
    
    if (this.#tail) {
      this.gainNode.connect(this.#tail);
      this.#tail.connect(GlobalScheduler.audioContext.destination);
    } else {
      this.#gainNode.connect(GlobalScheduler.audioContext.destination);
    }
    
    this.#sampleNode.start();
    
    this.#active = true;
  }
  
  stop() {
    this.#sampleNode.stop();
  }
  
  changeVolume(gain, time = 0.1) {
    if (active) {
      this.#gainNode.gain.exponentialRampToValueAtTime(gain, GlobalScheduler.audioContext.currentTime + time);
    }
  }
  
  #cleanup() {
    
    this.#active = false;
    
    if (this.#tail) {
      this.#gainNode.disconnect();
      this.#tail = null;
    }
    
    this.#sampleNode = null;
    this.#gainNode = null;
  }
  
}