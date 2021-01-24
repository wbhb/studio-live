import {SequencerItem} from './SequencerItem.mjs';
import {ItemDB} from './ItemDB.mjs';

// a sectionitem 

export class SectionItem extends SequencerItem {
  
  #itemIds = [];
  #repeats = 1;
  
  constructor(plain) {
    
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
      this.#itemIds = template.itemIds || [];
      this.repeats = template.repeats ?? this.#repeats;
      // null = config.setupItems;
    }
    
  }
  
  get itemIds() {
    return this.#itemIds;
  }
  
  get repeats() {
    return this.#repeats;
  }
  
  // setting to 0 will repeat forever
  set repeats(newVal) {
    
    if (typeof newVal !== 'number') {
      throw new TypeError('repeats must be positive number');
    }
    
    if (newVal === 0) {
      this.#repeats = Number.POSITIVE_INFINITY;
      return;
    }
    
    this.#repeats = newVal;
  }
  
  *nextBar() {
    for (let i = 0; i < this.repeats; i++) {
      if (this.itemIds[0] instanceof Array) {
        for (const j in this.itemIds) {
          yield this.itemIds[j];
        }
      } else {
        yield this.itemIds;
      }
    }
  }
  
  toJSON(key) {
    
    let plain = super.toJSON(key);
    
    plain.itemIds = this.itemIds;
    
    plain.repeats = this.repeats === Number.POSITIVE_INFINITY ? 0 : this.repeats;
    
    //setup
    
    return plain;
  }
}

SequencerItem.register(SectionItem);