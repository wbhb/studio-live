import {MIDIInstrument} from './MIDIInstrument.mjs';
import {Synth} from '../audio/synth.mjs';
import {MIDI} from '../util/midi.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

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
    // [
    //   MIDI.Control_Change, (message, time) => {
    //     switch (message.controllerNumber) {
    //       case 20:
    //         this.synth.envelope.attack.setValueAtTime((127 - message.value) / 127, GlobalScheduler.audioContext.currentTime);
    //         break;
    //       case 21:
    //         this.synth.envelope.decay.setValueAtTime((127 - message.value) / 127, GlobalScheduler.audioContext.currentTime);
    //         break;
    //       case 22:
    //         this.synth.envelope.sustain.setValueAtTime((message.value) / 127, GlobalScheduler.audioContext.currentTime);
    //         break;
    //       case 23:
    //         this.synth.envelope.release.setValueAtTime((127 - message.value) / 127, GlobalScheduler.audioContext.currentTime);
    //         break;
    //       default:
    //         console.warn('Unknown control');
    //     }
    //   }
    // ],
    [
      MIDI.All_Notes_Off, (message, time) => {
        this.synth.stopAll(time);
      }
    ]
  ]);
  
  #synth;
  
  constructor(config = {}) {
    super({...config, ...{
      inputs: [
        {
          node: new GainNode(GlobalScheduler.audioContext, {
            gain: 1.0,
            'channelCount': 1,
            'channelInterpretation': 'discrete',
            'channelCountMode': 'explicit'
          }),
          config: {
            type: 'AudioParam',
            name: 'Attack'
          }
        }, {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Decay'
          }
        }, {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Sustain'
          }
        }, {
          node: GlobalScheduler.audioContext.createGain(),
          config: {
            type: 'AudioParam',
            name: 'Release'
          }
        }
      ],
      enabled: true,
      name: 'Simple Synth'
    }});
    
    this.#synth = new Synth({
      attack: this.getNamedInput('Attack').node,
      decay: this.getNamedInput('Decay').node,
      sustain: this.getNamedInput('Sustain').node,
      release: this.getNamedInput('Release').node
    });
  }
  
  get messageHandlers() {
    return this.#synthMessageHandlers;
  }
  
  get synth() {
    return this.#synth;
  }
}