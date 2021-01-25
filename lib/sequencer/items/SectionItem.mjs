import {SequencerItem} from './SequencerItem.mjs';
import {ItemDB} from './ItemDB.mjs';
import {Length} from '../../util/length.mjs';
import {GLOBAL as GlobalScheduler} from '../../scheduler/scheduler.mjs';

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
      this.itemIds = template.itemIds || [];
      this.repeats = template.repeats ?? this.#repeats;
      // null = config.setupItems;
    }
  }
  
  set itemIds(ids) {
    this.#itemIds = ids;
    this.updateLength()
  }
  
  get itemIds() {
    return this.#itemIds;
  }
  
  get repeats() {
    return this.#repeats;
  }
  
  updateLength() {
    
    if (this.itemIds[0] instanceof Array) {
      this.timings.length = new Length(this.itemIds.length, Length.units.bar);
    } else {
      this.timings.length = this.itemIds.reduce((max, item) => {
        const width = ItemDB.timings(item).offset.to(Length.units.beat, {timeSignature: GlobalScheduler.timeSignature})
          .add(ItemDB.timings(item).length, {timeSignature: GlobalScheduler.timeSignature});
        
        return width.value > max.value ? width : max;
        
      }, new Length(0, Length.units.beat));
    }
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