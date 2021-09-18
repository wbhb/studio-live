import {Scheduler, CONTROL_CODES as SCHEDULER_CONTROL_CODES} from '../scheduler/scheduler.mjs';
import {WBHBSequencerControl} from './wbhb-sequencer-control.mjs';
import {ControlItem} from '../sequencer/items/ControlItem.mjs';
import {MIDI} from '../util/midi.mjs';

const html = `
<wbhb-sequencer-control></wbhb-sequencer-control>
`;

const css = `
:host {
  margin: 0;
  padding: 0;
  width: 90vw;
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

export class WBHBSequencer extends HTMLElement {
  
  static ZOOM_LEVELS = [192, 96, 48, 24, 12, 6, 3, 1];
  
  #connected = false;
  #defaultColumns = 8;
  
  #currentBeat = 0;
  
  #sequencer;
  #items = [];
  
  #boundListeners = {};
  #mutationObserver;
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this.#bindListeners();
  }
  
  static get observedAttributes() {
    return ['columns', 'current-bar', 'zoom-level'];
  }
  
  #bindListeners() {
    this.#boundListeners.itemChange = this.#itemChange.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.columns = this.columns || this.#defaultColumns;
      
      this.#setupListeners();
    }
  }
  
  #setupListeners() {
    
    this.querySelectorAll('wbhb-sequencer-track').forEach((el) => {
      el.addEventListener('item', this.#boundListeners.itemChange);
    });
    
    this.addEventListener('control-scroll-left', () => {
      this.currentBar++;
    });

    this.addEventListener('control-scroll-right', () => {
      this.currentBar--;
    });

    this.addEventListener('control-zoom-in', () => {
      let index = WBHBSequencer.ZOOM_LEVELS.indexOf(this.zoomLevel);
      index = Math.min(index + 1, WBHBSequencer.ZOOM_LEVELS.length - 1);
      this.zoomLevel = WBHBSequencer.ZOOM_LEVELS[index];
    });

    this.addEventListener('control-zoom-out', () => {
      let index = WBHBSequencer.ZOOM_LEVELS.indexOf(this.zoomLevel);
      index = Math.max(index - 1, 0);
      this.zoomLevel = WBHBSequencer.ZOOM_LEVELS[index];
    });
    
    Scheduler.GLOBAL.addEventListener('item', (item) => {
      
      if (item instanceof ControlItem) {
        switch (item.controlCode) {
          case SCHEDULER_CONTROL_CODES.START:
            this.shadowRoot.querySelector('wbhb-sequencer-control').playing = true;
            break;
          case SCHEDULER_CONTROL_CODES.STOP:
            this.currentBar = -1;
            this.shadowRoot.querySelector('wbhb-sequencer-control').playing = false;
            break;
        }
      }
    });
  }
  
  render() {
    return templateEl.content.cloneNode(true);
  }
  
  #itemChange(item) {
    const type = item.type;
    let mediaType = type;
    
    let trackEl = this.shadowRoot.querySelector(`wbhb-sequencer-track[media-type="${mediaType}"]`);
    
    if (!trackEl) {
      mediaType = '*';
      trackEl = this.shadowRoot.querySelector(`wbhb-sequencer-track[media-type="${mediaType}"]`);
    }
    
    if (!trackEl) {
      throw new Error(`item type "${type}" needs a new track`);
    }
    
    this.#items.push(item);
    
    trackEl.items = this.#items;
  }
  
  set sequencer(sequencer) {
    
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {this.shadowRoot.removeChild(el)});
    
    this.#sequencer = sequencer;
    
    this.#addTrack(this.sequencer);
  }
  
  get sequencer() {
    return this.#sequencer;
  }
  
  #addTrack(sequencer, mediaType) {
    
    const trackEl = document.createElement('wbhb-sequencer-track');
    trackEl.columns = this.columns;
    trackEl.sequencer = sequencer;
    // trackEl.addEventListener('item', this.#boundListeners.itemChange);
    // trackEl.items = sequencer.items;
    this.shadowRoot.appendChild(trackEl);
  }
  
  set columns(newValue) {
    this.setAttribute("columns", newValue);
  }
  
  get columns() {
    return Number.parseInt(this.getAttribute("columns"), 10) || 0;
  }
  
  #updateColumns(newValue) {
    this.shadowRoot.querySelectorAll('wbhb-sequencer-item').forEach((el) => {
      el.columns = newValue;
    });
  }
  
  set currentBar(newValue) {
    this.setAttribute('current-bar', newValue);
  }
  
  get currentBar() {
    return Number.parseInt(this.getAttribute("current-bar"), 10) || 0;
  }
  
  #updateCurrentBar(newValue) {
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {
      const barLength = Scheduler.GLOBAL.timeSignature.upper;
      const cellsPerBar = barLength * MIDI.CLOCKS_PER_BEAT / this.zoomLevel;
      el.offset = cellsPerBar * newValue;
    });
  }
  
  set zoomLevel(newValue) {
    this.setAttribute('zoom-level', newValue);
  }
  
  get zoomLevel() {
    return Number.parseInt(this.getAttribute("zoom-level"), 10) || 24;
  }
  
  #updateZoomLevel(newValue) {
    
    const newVal = Number.parseInt(newValue, 10);
    
    if (!WBHBSequencer.ZOOM_LEVELS.includes(newVal)) {
      throw new RangeError(`Zoom Level ${newValue} is not allowed`);
    }
    
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {
      el.zoomLevel = newValue;
    });
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "columns":
        this.#updateColumns(newValue, oldValue);
        break;
      case "current-bar":
        this.#updateCurrentBar(newValue, oldValue);
        break;
      case "zoom-level":
        this.#updateZoomLevel(newValue, oldValue);
        break;
    }
  }
  
}

window.customElements.define('wbhb-sequencer', WBHBSequencer);