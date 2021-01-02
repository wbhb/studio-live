import {MIDIInstrument} from './MIDIInstrument.js';
import {Synth} from '../audio/synth.js';
import {MIDI} from '../util/midi.js';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class SynthInstrument extends MIDIInstrument {
  
  #synthMessageHandlers = new Map([
    [
      MIDI.Note_On, (message, time) => {
        this.synth.start(time, message.note, message.velocity / 127.0);
      }
    ],
    [
      MIDI.Note_Off, (message, time) => {
        this.synth.stop(time, message.note);
      },
    ],
    // [
    //   MIDI.Polyphonic_Key_Pressure, (message) => {
    //     this.voices[message.note].changeVolume(message.pressure / 127.0);
    //   }
    // ],
    [
      MIDI.Control_Change, (message) => {
        switch (message.controllerNumber) {
          case 20:
            this.synth.envelope.attack = (127 - message.value) / 127;
            break;
          case 21:
            this.synth.envelope.decay = (127 - message.value) / 127;
            break;
          case 22:
            this.synth.envelope.sustain = (message.value) / 127;
            break;
          case 23:
            this.synth.envelope.release = (127 - message.value) / 127;
            break;
          default:
            console.warn('Unknown control')
        }
      }
    ]
  ]);
  
  #synth;
  
  constructor(config) {
    super(config);
    
    this.#synth = new Synth();
  }
  
  get messageHandlers() {
    return this.#synthMessageHandlers;
  }
  
  get synth() {
    return this.#synth;
  }
}