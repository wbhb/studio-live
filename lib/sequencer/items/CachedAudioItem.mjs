import {SequencerItem} from './SequencerItem.mjs';

export class CachedAudioItem extends SequencerItem {
  
  #cacheKey;
  
  constructor(plain) {
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
      this.cacheKey = template.cacheKey;
    }
  }
  
  set cacheKey(newValue) {
    this.#cacheKey = newValue;
  }
  
  get cacheKey() {
    return this.#cacheKey;
  }
  
  toJSON(key) {
    let plain = super.toJSON(key);
    
    plain.cacheKey = this.cacheKey;
    
    return plain;
  }
  
}

SequencerItem.register(CachedAudioItem);
