import {MIDIInstrument} from './MIDIInstrument.js';
import {MIDI} from '../util/midi.js';
import {SampleCache} from '../util/sampleCache.js';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class SampleInstrument extends MIDIInstrument {
  
  #sampleMessageHandlers = new Map([
    [
      MIDI.Note_On, (message, time) => {
        this.voices[message.note].start(time, message.velocity / 127.0);
      }
    ],
    [
      MIDI.Note_Off, (message, time) => {
        if (this.mode === SampleInstrument.MODES.Trigger) {
          return;
        }
        this.voices[message.note].stop(time);
      },
    ],
    [
      MIDI.Polyphonic_Key_Pressure, (message) => {
        this.voices[message.note].changeVolume(message.pressure / 127.0);
      }
    ]
  ]);
  
  #voices;
  #mode;
  
  constructor(config) {
    super(config);
    
    this.#voices = config.voices;
    
    this.mode = config.mode || SampleInstrument.MODES.Normal;
  }
  
  get messageHandlers() {
    return this.#sampleMessageHandlers;
  }
  
  get voices() {
    return this.#voices;
  }
  
  set mode(newVal) {
    
    if (!Object.values(SampleInstrument.MODES).includes(newVal)) {
      throw new TypeError(`mode not valid`);
    }
    
    this.#mode = newVal;
  }
  
  get mode() {
    return this.#mode;
  }
  
  static MODES = {
    Normal: Symbol('Normal'), // obeys Note_Off, stops immediately
    Trigger: Symbol('Trigger') // ignores Note_Off, plays until end of sample
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
  
  async start(time, gain, tail) {
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
    
    this.#sampleNode.start(time);
    
    this.#active = true;
  }
  
  stop(time) {
    this.#sampleNode?.stop(time);
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