import {RackItem} from './RackItem.mjs';
import {MIDI} from '../util/midi.mjs';
import {MidiNode} from './MidiNode.mjs';
import {MIDIItem} from '../sequencer/items/MIDIItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Arpeggiator extends RackItem {
  
  #remap;
  
  #rootNote;
  #clock = 0;
  #currentStep = 0;
  #playing = false;
  
  #baseMessage;
  
  noteLength = 5;//new Length(12, Length.units.midi);
  stepLength = 6;//new Length(12, Length.units.midi);
  
  pattern = [0, 4, 7, 12, 16, 19, 23, 24];
  
  constructor() {
    super({
      inputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI In'
        }
      },{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'Clock In'
        }
      }],
      outputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI Out'
        }
      }
      ],
      enabled: true,
      name: 'Arpeggiator'
    });
    
    this.getNamedInput('MIDI In').node.addEventListener('midi-message', (evt) => {
      if (this.enabled) {
        if (evt.message.command === MIDI.Note_On) {
          this.#playing = true;
          this.#rootNote = evt.message.note;
          this.#currentStep = 0;
          
          this.#baseMessage = evt.message;
          
          const newEvent = new MIDI.Event({
            ...this.#baseMessage,
            ...{
              status: undefined,
              data: undefined,
              note: this.#rootNote + this.pattern[this.#currentStep]
            }
          });
          this.getNamedOutput('MIDI Out').node.send(newEvent);
        }
        if (evt.message.command === MIDI.Note_Off && evt.message.note === this.#rootNote) {
          this.#playing = false;
          
          const newEvent = new MIDI.Event({
            ...this.#baseMessage,
            ...{
              status: undefined,
              data: undefined,
              command: MIDI.Note_Off,
              note: this.#rootNote + this.pattern[this.#currentStep]
            }
          });
          this.getNamedOutput('MIDI Out').node.send(newEvent);
        }
      } else {
        this.getNamedOutput('MIDI Out').node.send(new MIDI.Event(evt.message));
      }
    });
    
    GlobalScheduler.addEventListener('item', (item) => {
      
      if (!this.#playing) {
        return;
      }
      
      if (!this.enabled) {
        return;
      }
      
      if (!(item instanceof MIDIItem)) {
        return;
        // throw new TypeError("Not a MIDI Message");
      }
      
      const message = item.message;
      
      if (!(message instanceof MIDI.Message)) {
        return;
        // throw new TypeError("Not a MIDI Message");
      }
      
      if (message.command === MIDI.Timing_Clock) {
        this.#clock++;
        if (this.#clock % this.stepLength === 0) {
          this.#currentStep++;
          if (this.#currentStep >= this.pattern.length) {
            this.#currentStep = 0;
          }
          const newEvent = new MIDI.Event({
            ...this.#baseMessage,
            ...{
              status: undefined,
              data: undefined,
              note: this.#rootNote + this.pattern[this.#currentStep]
            }
          });
          this.getNamedOutput('MIDI Out').node.send(newEvent);
        }
        
        if (this.#clock % this.stepLength === this.noteLength) {
          const newEvent = new MIDI.Event({
            ...this.#baseMessage,
            ...{
              status: undefined,
              data: undefined,
              command: MIDI.Note_Off,
              note: this.#rootNote + this.pattern[this.#currentStep]
            }
          });
          this.getNamedOutput('MIDI Out').node.send(newEvent);
        }
      }
    });
  }
  
  // *getClockBeat(root) {
    
  // }
}