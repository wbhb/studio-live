import {WBHBButton} from './wbhb-button.mjs';
import {Chord} from '../util/chords.mjs';
import {ChordItem} from '../sequencer/items/ChordItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class WBHBChord extends WBHBButton {
  
  #chord;
  #connected = false;
  
  #boundListeners = {};
  
  constructor() {
    super();
    
    this.#boundListeners._handleItem = this._handleItem.bind(this);
  }
  
  connectedCallback() {
    super.connectedCallback();
    if (!this.#connected) {
      
      this.#connected = true;
    
      this.type = 'Current Chord';
      this.setAttribute('wide', "");
      
      this.setupListeners();
    }
  }
  
  setupListeners() {
    // super.setupListeners();
    GlobalScheduler.addEventListener('item', this.#boundListeners._handleItem);
  }
  
  _handleItem(item) {
    if (item instanceof ChordItem) {
      this.chord = item.chord;
    }
  }
  
  set chord(newValue) {
    if (!newValue instanceof Chord) {
      throw new Error('chord needs to be a Chord');
    }
    
    this.#chord = newValue;
    this.name = this.#chord.toString();
  }
  
  get chord() {
    return this.#chord;
  }
}

window.customElements.define('wbhb-chord', WBHBChord);