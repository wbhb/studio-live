import {Length} from '../util/length.mjs';
import {Scheduler, CONTROL_CODES as SCHEDULER_CONTROL_CODES} from '../scheduler/scheduler.mjs';
import {WBHBSequencerControl} from './wbhb-sequencer-control.mjs';
import {ControlItem} from '../sequencer/items/ControlItem.mjs';

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
  
  #connected = false;
  #defaultColumns = 8;
  
  #currentBeat = 0;
  
  #sequencers = new Set();
  #items = [];
  
  #boundListeners = {};
  #mutationObserver;
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
  }
  
  static get observedAttributes() {
    return ['media-types', 'columns', 'current-bar'];
  }
  
  _bindListeners() {
    this.#boundListeners.domchange = this._domchange.bind(this);
    this.#boundListeners.itemChange = this._itemChange.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      let mediaTypes = this.mediaTypes;
      
      this.querySelectorAll('wbhb-sequencer-track').forEach((el) => {
        if (!mediaTypes.contains(el.mediaType)) {
          mediaTypes.push(el.mediaType);
        }
        el.addEventListener('item', this.#boundListeners.itemChange);
      });
      
      this.columns = this.columns || this.#defaultColumns;
      
      this.mediaTypes = mediaTypes;
      
      this.#mutationObserver = new MutationObserver(this.#boundListeners.domchange);
      
      this.setupListeners();
      
      this.#mutationObserver.observe(this, {
        childList: true
      });
    }
  }
  
  setupListeners() {
    this.addEventListener('control-scroll-left', () => {
      this.currentBar++;
    });

     this.addEventListener('control-scroll-right', () => {
      this.currentBar--;
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
  
  _itemChange(item) {
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
    
    // if (mediaType == '*') {
    //   trackEl.items = this.#items.mediaType((mediaTypeItem) => {
    //     return !this.mediaTypes.includes(mediaTypeItem.type);
    //   });
    // } else {
    //   trackEl.items = this.#items.mediaType((mediaTypeItem) => {
    //     return mediaTypeItem.type == mediaType;
    //   });
    // }
    
    trackEl.items = this.#items;
  }
  
  _domchange(mutationList) {
    for(var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        console.log(mutation);
      }
    }
  }
  
  set sequencers(sequencers) {
    this.#sequencers.clear();
    
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {this.shadowRoot.removeChild(el)});
    
    sequencers.forEach(this.addSequencer);
  }
  
  addSequencer(sequencer, mediaType) {
    this.#sequencers.add(sequencer);
    
    const trackEl = document.createElement('wbhb-sequencer-track');
    trackEl.mediaType = mediaType;
    trackEl.columns = this.columns;
    trackEl.addEventListener('item', this.#boundListeners.itemChange);
    trackEl.items = sequencer.items;
    this.shadowRoot.appendChild(trackEl);
  }
  // get sequencers() {
  //   return this.#sequencers;
  // }
  
  getBarItems(barNumber) {
    
    return this.sequencers.flatMap(seq => seq.getBarItems(barNumber));
  }
  
  set mediaTypes(newValue) {
    if (newValue instanceof Array) {
      this.setAttribute('media-types', newValue.join(' '));
      return;
    }
    if (newValue instanceof String) {
      this.setAttribute('media-types', newValue);
      return;
    }
    throw new TypeError('media-types must be an array, or a string');
  }
  
  get mediaTypes() {
    return this.getAttribute('media-types').split(' ');
  }
  
  _updateFilters(newValue, oldValue) {
    // let filters = newValue.split(' ');
    
    // let trackElements = [];
    
    // filters.forEach((filter) => {
    //   let trackEl = this.shadowRoot.querySelector(`wbhb-sequencer-track[filter="${filter}"]`);
    //   if (trackEl) {
    //     trackEl = this.shadowRoot.removeChild(trackEl);
    //   } else {
    //     trackEl = document.createElement('wbhb-sequencer-track');
    //     trackEl.filter = filter;
    //     trackEl.columns = this.columns;
    //     trackEl.addEventListener('item', this.#boundListeners.itemChange);
    //   }
    //   trackElements.push(trackEl);
    // });
    
    // this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {this.shadowRoot.removeChild(el)});
    // trackElements.forEach((el) => {this.shadowRoot.appendChild(el)});
  }
  
  set columns(newValue) {
    this.setAttribute("columns", newValue);
  }
  
  get columns() {
    return Number.parseInt(this.getAttribute("columns"), 10) || 0;
  }
  
  _updateColumns(newValue) {
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
  
  _updateCurrentBar(newValue) {
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {el.offset = Scheduler.GLOBAL.timeSignature.upper + new Length(this.currentBar, Length.units.bar).to(Length.units.beat, {timeSignature: Scheduler.GLOBAL.timeSignature}).value;});
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "media-types":
        this._updateFilters(newValue, oldValue);
        break;
      case "columns":
        this._updateColumns(newValue, oldValue);
        break;
      case "current-bar":
        this._updateCurrentBar(newValue, oldValue);
        break;
    }
  }
  
}

window.customElements.define('wbhb-sequencer', WBHBSequencer);