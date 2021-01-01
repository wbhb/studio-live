import {SequencerItem} from './SequencerItem.js';
import {MIDI} from '../../util/midi.js';

export class MIDIItem extends SequencerItem {
  
  #message;
  
  constructor(plain) {
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
      this.message = new MIDI.Message(template.message);
    }
  }
  
  set message(newVal) {
    if (newVal instanceof MIDI.Message) {
      this.#message = newVal;
    } else {
      throw new TypeError('message must be a MIDI.Message');
    }
  }
  
  get message() {
    return this.#message;
  }
}

SequencerItem.register(MIDIItem);
