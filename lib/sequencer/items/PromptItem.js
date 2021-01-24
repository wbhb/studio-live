import {SequencerItem} from './SequencerItem.js';
import {SectionItem} from './SectionItem.js';
import {MIDIItem} from './MIDIItem.js';
import {ItemDB} from './ItemDB.js';
import {Prompts} from '../../instrument/Prompts.js';
import {GLOBAL as GlobalScheduler} from '../../scheduler/scheduler.js';
import {MIDI} from '../../util/midi.js';
import {Length} from '../../util/length.js';

export class PromptItem extends SectionItem {
  
  #count;
  #prompts;
  
  static PromptsCache = new Map();
  
  constructor(plain) {
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
      this.count = template.count;
      this.prompts = template.prompts || [];
    }
  }
  
  set count(newValue) {
    this.#count = new Boolean(newValue);
    if (this.count) {
      for (let i = 1; i < 20; i++) {
        PromptItem.cachePrompt(i.toString(), i - 1);
      }
    }
  }
  
  get count() {
    return this.#count;
  }
  
  set prompts(newValue) {
    this.#prompts = newValue;
    
    newValue.forEach((p, i) => {PromptItem.cachePrompt(p, i)});
  }
  
  get prompts() {
    return this.#prompts;
  }
  
  add(prompt) {
    
    PromptItem.cachePrompt(prompt);
    
    this.prompts.push(prompt, this.prompts.length);
  }
  
  get itemIds() {
    const length = this.count ? Math.max(this.prompts.length, GlobalScheduler.timeSignature.upper) : Math.max(this.prompts.length, 7);
    let ids = [];
    
    for (let i = 0; i < this.prompts.length; i++) {
      ids[i] = PromptItem.PromptsCache.get(`${this.prompts[i]}-${i}`);
    }
    
    for (let j = this.prompts.length; j < length; j++) {
      ids[j] = PromptItem.PromptsCache.get(`${(j + 1).toString()}-${j}`);
    }
    
    return ids;
  }
  
  static async cachePrompt(prompt, offset) {
    
    if (PromptItem.PromptsCache.has(prompt)) {
      return;
    }
    
    const midiPrompt = new MIDIItem({
      message: {
        channel: -2,
        method: MIDI.Channel_Voice,
        command: MIDI.Note_On,
        note: Prompts.getNoteNumber(prompt),
        velocity: 127
      },
      timings: {
        offset: new Length(offset, Length.units.beat)
      }
    });
    
    const uid = await ItemDB.set(midiPrompt);
    
    PromptItem.PromptsCache.set(`${prompt}-${offset}`, uid);
    
    return uid;
  }
  
  toJSON(key) {
    let plain = super.toJSON(key);
    
    plain.count = this.count;
    plain.prompts = this.prompts;
    plain.itemIds = undefined;
    
    return plain;
  }
  
}

SequencerItem.register(PromptItem);
