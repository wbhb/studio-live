import {SequencerItem} from './SequencerItem.js';
import {Chord} from '../../util/chords.js';

export class ChordItem extends SequencerItem {
  
  #chord;
  
  constructor(plain) {
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
      if (template.chord) {
        this.chord = new Chord(template.chord);
      }
    }
  }
  
  set chord(newValue) {
    
    if (!newValue instanceof Chord) {
      throw new Error("chord is not a Chord");
    }
    
    this.#chord = newValue;
  }
  
  get chord() {
    return this.#chord;
  }
  
}