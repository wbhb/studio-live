import {SectionItem} from './SectionItem.mjs';

export class MIDITupleItem extends SectionItem {
  
  constructor(plain) {
    super(plain);
    
    super.repeats = 1;
    
    this.timings.addEventListener('change-offset');
    this.timings.addEventListener('change-length');
  }
  
  set repeats(newVal) {
    throw new Error('Cannot repeat');
  }
  
  set itemIds(newVal) {
    throw new Error('Cannot directly set itemIds');
  }
  
  set note(value) {
    
  }
  
  async #updateOnOffset() {
    
  }
  
  async #updateOffOffset() {
    
  }
  
}