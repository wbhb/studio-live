import {SequencerItem} from './SequencerItem.mjs';
import {SectionItem} from './SectionItem.mjs';
import {MIDIItem} from './MIDIItem.mjs';
import {ItemDB} from './ItemDB.mjs';
import {Prompts} from '../../instrument/Prompts.mjs';
import {GLOBAL as GlobalScheduler} from '../../scheduler/scheduler.mjs';
import {MIDI} from '../../util/midi.mjs';
import {Length} from '../../util/length.mjs';

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
    this.#updateLength();
    this.#updateItemIds();
  }
  
  get count() {
    return this.#count;
  }
  
  set prompts(newValue) {
    this.#prompts = newValue;
    
    Promise.all(newValue.map((p, i) => PromptItem.cachePrompt(p, i))).then(() => {
      this.#updateLength();
      this.#updateItemIds();
    });
  }
  
  get prompts() {
    return this.#prompts;
  }
  
  async add(prompt) {
    
    PromptItem.cachePrompt(prompt).then(() => {
      this.#updateLength();
      this.#updateItemIds();
    });
    
    this.prompts.push(prompt, this.prompts.length);
    
  }
  
  #updateLength() {
    let length = this.count ? Math.max(this.prompts?.length, GlobalScheduler.timeSignature.upper) : this.prompts?.length ?? 0;
    this.timings.length = new Length(length, Length.units.beat);
  }
  
  #updateItemIds() {
    const length = this.timings.length.value;
    let ids = [];
    
    for (let i = 0; i < this.prompts?.length ?? 0; i++) {
      ids[i] = PromptItem.PromptsCache.get(`${this.prompts[i]}-${i}`);
    }
    
    for (let j = this.prompts?.length ?? 0; j < length; j++) {
      ids[j] = PromptItem.PromptsCache.get(`${(j + 1).toString()}-${j}`);
    }
    
    this.itemIds = ids;
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
