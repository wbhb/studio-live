import {SequencerItem} from 'SequencerItem.js';

export class AudioItem extends SequencerItem {
  
  #audio;
  
  constructor(plain) {
    super(plain);
  }
  
  get audio() {
    return this.#audioNode;
  }
  
  set audio(newValue) {
    
    if (newValue instanceof AudioNode) {
      this.#audio = newValue;
    } else {
      throw new TypeError('audio must be an AudioNode');
    }
  }
  
}