import {WBHBButton} from './wbhb-button.js';
import {Chord} from '../util/chords.js';
import {ChordItem} from '../sequencer/items/ChordItem.js';

export class WBHBChord extends WBHBButton {
  
  #chord;
  #connected = false;
  #scheduler;
  
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
      
      // this.setupListeners();
    }
  }
  
  setupListeners() {
    super.setupListeners();
    
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
  
  set scheduler(newValue) {
    if (newValue != this.#scheduler) {
      this.#scheduler = newValue;
      this.scheduler.addEventListener('item', this.#boundListeners._handleItem);
    }
  }
  
  get scheduler() {
    return this.#scheduler;
  }
}

window.customElements.define('wbhb-chord', WBHBChord);