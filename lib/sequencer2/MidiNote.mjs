import {MIDI} from '../util/midi.mjs';
import {Sequencer} from './Sequencer.mjs';

export class MidiNote extends Sequencer {
  
  #note;
  #template;
  
  static EMPTY_SET = new Set();
  
  constructor(note, length, template) {
    super();
    
    this.#note = note;
    this.length = length;
    this.#template = template || new MIDI.Message({
      channel: 0,
      velocity: 127
    });
  }
  
  *createMessageGen(message) {
    
    let clock = 0;
    
    const noteOn = this.noteOn;
    const noteOff = this.noteOff;
    
    yield new Set([noteOn]);
    
    clock++;
    
    while (clock < this.length) {
      yield MidiNote.EMPTY_SET;
      clock++;
    }
    
    return new Set([noteOff]);
  }
  
  get noteOn() {
    const message = new MIDI.Message(this.#template);
    message.method = MIDI.Channel_Voice;
    message.command = MIDI.Note_On;
    message.note = this.#note;
    return message;
  }
  
  get noteOff() {
    const message = new MIDI.Message(this.#template);
    message.method = MIDI.Channel_Voice;
    message.command = MIDI.Note_Off;
    message.note = this.#note;
    return message;
  }
}