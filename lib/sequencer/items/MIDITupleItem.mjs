import {SequencerItem} from './SequencerItem.mjs';
import {SectionItem} from './SectionItem.mjs';
import {ItemDB} from './ItemDB.mjs';
import {MIDI} from '../../util/midi.mjs';
import {MIDIItem} from './MIDIItem.mjs';

export class MIDITupleItem extends SectionItem {
  
  #note;
  #channel;
  #velocityOn;
  #velocityOff;
  
  constructor(plain) {
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    this.#note = template.note ?? 0;
    this.#channel = template.channel ?? 0;
    this.#velocityOn = template.velocityOn ?? 127;
    this.#velocityOff = template.velocityOff ?? 127;
    
    super.repeats = 1;
    
    const boundCreateItems = this.#createItems.bind(this);
    
    this.timings.addEventListener('change-length', boundCreateItems);
    this.timings.addEventListener('change-offset', boundCreateItems);
    
    if (this.itemIds.length == 0) {
      
      return this.#createItems().then(() => {return this});
    } else {
      return this;
    }
  }
  
  // set repeats(newVal) {
  //   throw new Error('Cannot repeat');
  // }
  
  // set itemIds(newVal) {
  //   throw new Error('Cannot directly set itemIds');
  // }
  
  updateLength() {
    // noop
  }
  
  set note(value) {
    this.#note = value;
    this.#createItems();
  }
  
  set channel(value) {
    this.#channel = value;
    this.#createItems();
  }
  
  set velocityOn(value) {
    this.#velocityOn = value;
    this.#createItems();
  }
  
  set velocityOff(value) {
    this.#velocityOff = value;
    this.#createItems();
  }
  
  get note() {
    return this.#note;
  }
  
  get channel() {
    return this.#channel;
  }
  
  get velocityOn() {
    return this.#velocityOn;
  }
  
  get velocityOff() {
    return this.#velocityOff;
  }
  
  async #createItems() {
    const noteOn = await ItemDB.set(new MIDIItem({
      message: {
        channel: this.channel,
        method: MIDI.Channel_Voice,
        command: MIDI.Note_On,
        note: this.note,
        velocity: this.velocityOn
      },
      timings: {
        offset: this.timings.offset
      }
    }));
    
    const noteOff = await ItemDB.set(new MIDIItem({
      message: {
        channel: this.channel,
        method: MIDI.Channel_Voice,
        command: MIDI.Note_Off,
        note: this.note,
        velocity: this.velocityOff
      },
      timings: {
        offset: this.timings.offset.add(this.timings.length)
      }
    }));
    
    this.itemIds[0] = noteOn;
    this.itemIds[1] = noteOff;
  }
  
  toJSON(key) {
    let plain = super.toJSON(key);
    
    plain.note = this.note;
    plain.channel = this.channel;
    plain.velocityOn = this.velocityOn;
    plain.velocityOff = this.velocityOff;
    
    return plain;
  }
  
}

SequencerItem.register(MIDITupleItem);