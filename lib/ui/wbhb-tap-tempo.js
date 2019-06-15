import {WBHBButton} from './wbhb-button.js';
import {Tempo} from '../util/tempo.js';

export class WBHBTapTempo extends HTMLElement {
    
  #buttonEl;
  tempo = new Tempo();
  
  constructor() {
    super();
  }
  
  connectedCallback() {
    
    this.style.display = 'none';
    
    this.#buttonEl = document.createElement('wbhb-button')
    let parentEl = this.parentElement;
    
    parentEl.insertBefore(this.#buttonEl, this);
    
    this.#buttonEl.name = "TAP";
    this.setupListeners();
  }
  
  setupListeners() {
    this.#buttonEl.addEventListener("click", () => {
      this.tempo.tap();
    });
  }
}

window.customElements.define('wbhb-tap-tempo', WBHBTapTempo);