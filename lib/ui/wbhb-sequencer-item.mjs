import {Length} from '../util/length.mjs';
import {SequencerItem} from '../sequencer/items/SequencerItem.mjs';

const html = `
<div class="length"></div>
<div class="info"></div>
<div class="controls">
  <div class="drag-handle" draggable="true" data-timingshandle="offset">
    <span class="icon material-icons">first_page</span>
  </div>
  <div class="drag-handle" draggable="true" data-timingshandle="length">
    <span class="icon material-icons">last_page</span>
  </div>
</div>
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

@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://example.com/MaterialIcons-Regular.eot); /* For IE6-8 */
  src: local('Material Icons'),
    local('MaterialIcons-Regular'),
    url(https://example.com/MaterialIcons-Regular.woff2) format('woff2'),
    url(https://example.com/MaterialIcons-Regular.woff) format('woff'),
    url(https://example.com/MaterialIcons-Regular.ttf) format('truetype');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
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

:host(.repeat) .info {
  border-color: var(--wbhb-color-grey);
}

.length {
  width: 100%;
  height: 2.5vmin;
  border-radius: 1.25vmin;
  background-color: var(--wbhb-color-black);
  border: solid 2px var(--wbhb-color-yellow);
}

:host(.repeat) .length {
  border-color: var(--wbhb-color-grey);
}

.controls {
  position: absolute;
  width: 100%;
  height: 100%;
  
  display: flex;
  flex-direction: vertical;
  align-items: center;
  justi-content: center;
  
  opacity: 0;
  transition: opacity 0.3s ease-in-out
}

.controls:hover {
  opacity: 1;
}

.controls .drag-handle {
  contain: content;
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(var(--grid-size) / 4);
  height: calc(var(--grid-size) / 4);
  border-radius: 50%;
  border: solid 2px var(--wbhb-color-yellow);
  background-color: var(--wbhb-color-black);
}

.icon {
  font-size: calc(var(--grid-size) / 8);
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
    this.#boundListeners.dragstart = this.dragstart.bind(this);
    this.#boundListeners.drag = this.drag.bind(this);
    this.#boundListeners.dragend = this.dragend.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected && this.isConnected) {
      
      this.#connected = true;
      
      this.setupListeners();
      
    }
  }
  
  static get observedAttributes() {
    return ['partial', 'fading'];
  }
  
  setupListeners() {
    this.shadowRoot.querySelectorAll('.drag-handle[data-timingshandle]')
      .forEach((el) => {
        el.addEventListener("dragstart", this.#boundListeners.dragstart);
        el.addEventListener("touchstart", (e) => {this.#boundListeners.dragstart(e.touches[0]);});
        el.addEventListener("drag", this.#boundListeners.drag);
        el.addEventListener("touchmove", (e) => {this.#boundListeners.drag(e.touches[0]);});
        el.addEventListener("dragend", this.#boundListeners.dragend);
        el.addEventListener("touchend", (e) => {this.#boundListeners.dragend(e.touches[0]);});
      });
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    root.querySelector('.info').textContent = this.item.type;
    
    return root;
  }
  
  dragstart(e) {
    
    if (e instanceof DragEvent) {
      e.dataTransfer.setDragImage(document.createElement('image'), 0, 0);
    }
  }
  
  drag(e) {
    const bounds = this.getBoundingClientRect();
    const size = bounds.height;
    const offsetX = e.screenX - bounds.x;
    const distance = Math.round(offsetX / size);
  }
  
  dragend(e) {
    const bounds = this.getBoundingClientRect();
    const size = bounds.height;
    const offsetX = e.screenX - bounds.x;
    const distance = Math.round(offsetX / size);
    
    if (e.target.dataset.timingshandle === 'length') {
      if (distance < 1) {
        return;
      }
      this.item.timings.length = new Length(distance, Length.units.beat);
    } else if (e.target.dataset.timingshandle === 'offset') {
      this.item.timings.offset = this.item.timings.offset.add(new Length(distance, Length.units.beat));
    }
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