import {SequencerItem} from './SequencerItem.mjs';

export class AudioItem extends SequencerItem {
  
  #audio;
  
  constructor(plain) {
    super(plain);
  }
  
  get audio() {
    return this.#audio;
  }
  
  set audio(newValue) {
    
    if (newValue instanceof AudioNode) {
      this.#audio = newValue;
    } else {
      throw new TypeError('audio must be an AudioNode');
    }
  }
  
}

SequencerItem.register(AudioItem);
