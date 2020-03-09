import {Length} from '../util/length.js';
import {SequencerItem} from '../sequencer/items/SequencerItem.js';

const html = `
<div class="length"></div>
<div class="info"></div>
`;

const css = `
:host {
  margin: 1vmin;
  display: flex;
  justify-content: left;
  align-items: center;
  
  position: relative;
  
  transition: opacity 0.3s;
  
  contain: layout style size;
}

:host[fading] {
  opacity: 0;
}

.info{
  height: 8vmin;
  width: 8vmin;
  position: absolute;
  border-radius: 4vmin;
  background-color: var(--wbhb-color-black);
  border: solid 2px var(--wbhb-color-yellow);
  transition: transform 0.3s;
  font-size: 1vmin;
  display: flex;
  justify-content: center;
  align-items: center;
}

:host[partial] .info {
  transform: translateX(10vmin) scale(0.5);
  border-width: 4px;
}

:host[fading] .info {
  transform: scale(0.5);
}

.length {
  width: 100%;
  height: 2.5vmin;
  border-radius: 1.25vmin;
  background-color: var(--wbhb-color-black);
  border: solid 2px var(--wbhb-color-yellow);
}

`;

const template = `
${html}
<style>
  ${css}
</style>
`;

const templateEl = document.createElement('template');
templateEl.innerHTML = template;

export class WBHBSequencerItem extends HTMLElement {
  
  #connected = false;
  
  #boundListeners = {};
  
  #item;
  
  constructor(item) {
    super();
    
    if (item instanceof SequencerItem) {
      this.#item = item;
    } else {
      throw new TypeError('WBHBSequencerItem must be instantiated with an item of type SequencerItem');
    }
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
  }
  
  _bindListeners() {
    this.#boundListeners._updateLength = this._updateLength.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.setupListeners();
      
    }
  }
  
  static get observedAttributes() {
    return ['partial', 'fading'];
  }
  
  setupListeners() {
    this.item.timings.addEventListener('change-length', () => {});
    this.item.timings.addEventListener('change-offset', () => {});
    this.item.timings.addEventListener('change-start', () => {});
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    root.querySelector('.info').textContent = this.item.type;
    
    return root;
  }
  
  get item() {
    return this.#item;
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "partial":
        break;
      case "fading":
        break;
    }
  }
  
}

window.customElements.define('wbhb-sequencer-item', WBHBSequencerItem);