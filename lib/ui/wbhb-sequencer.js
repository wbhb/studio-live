import {Length} from '../util/length.js';
import {Scheduler} from '../scheduler/scheduler.js';
import {WBHBSequencerControl} from './wbhb-sequencer-control.js';

const html = `
<wbhb-sequencer-control></wbhb-sequencer-control>
`;

const css = `
:host {
  margin: 0;
  padding: 0;
  width: 100vw;
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
  
  #scheduler;
  #currentBeat = 0;
  
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
    return ['filters', 'columns', 'current-bar'];
  }
  
  _bindListeners() {
    this.#boundListeners.domchange = this._domchange.bind(this);
    this.#boundListeners.itemChange = this._itemChange.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      let filters = this.filters;
      
      this.querySelectorAll('wbhb-sequencer-track').forEach((el) => {
        if (!filters.contains(el.filter)) {
          filters.push(el.filter);
        }
        el.addEventListener('item', this.#boundListeners.itemChange);
      });
      
      this.columns = this.columns || this.#defaultColumns;
      
      this.filters = filters;
      
      this.#mutationObserver = new MutationObserver(this.#boundListeners.domchange);
      
      this.setupListeners();
      
      this.#mutationObserver.observe(this, {
        childList: true
      });
    }
  }
  
  setupListeners() {
  }
  
  render() {
    return templateEl.content.cloneNode(true);
  }
  
  _itemChange(item) {
    const type = item.type;
    let filter = type;
    
    let trackEl = this.shadowRoot.querySelector(`wbhb-sequencer-track[filter="${filter}"]`);
    
    if (!trackEl) {
      filter = '*';
      trackEl = this.shadowRoot.querySelector(`wbhb-sequencer-track[filter="${filter}"]`);
    }
    
    if (!trackEl) {
      throw new Error('item type needs a new track');
    }
    
    this.#items.push(item);
    
    if (filter == '*') {
      trackEl.items = this.#items.filter((filterItem) => {
        return !this.filters.includes(filterItem.type);
      });
    } else {
      trackEl.items = this.#items.filter((filterItem) => {
        return filterItem.type == filter;
      });
    }
  }
  
  _domchange(mutationList) {
    for(var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        console.log(mutation);
      }
    }
  }
  
  set scheduler(newValue) {
    if (newValue instanceof Scheduler) {
      this.#scheduler = newValue;
      this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {el.scheduler = this.scheduler});
    } else {
      throw new TypeError(`scheduler must be of type 'Scheduler'`);
    }
  }
  
  get scheduler() {
    return this.#scheduler;
  }
  
  set filters(newValue) {
    if (newValue instanceof Array) {
      this.setAttribute('filters', newValue.join(' '));
      return;
    }
    if (newValue instanceof String) {
      this.setAttribute('filters', newValue);
      return;
    }
    throw new TypeError('filters must be an array, or a string');
  }
  
  get filters() {
    return this.getAttribute('filters').split(' ');
  }
  
  _updateFilters(newValue, oldValue) {
    let filters = newValue.split(' ');
    
    let trackElements = [];
    
    filters.forEach((filter) => {
      let trackEl = this.shadowRoot.querySelector(`wbhb-sequencer-track[filter="${filter}"]`);
      if (trackEl) {
        trackEl = this.shadowRoot.removeChild(trackEl);
      } else {
        trackEl = document.createElement('wbhb-sequencer-track');
        trackEl.filter = filter;
        trackEl.columns = this.columns;
        trackEl.addEventListener('item', this.#boundListeners.itemChange);
      }
      trackElements.push(trackEl);
    });
    
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {this.shadowRoot.removeChild(el)});
    trackElements.forEach((el) => {this.shadowRoot.appendChild(el)});
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
    this.shadowRoot.querySelectorAll('wbhb-sequencer-track').forEach((el) => {el.offset = new Length(this.currentBar, Length.units.bar).to(Length.units.beat, {timeSignature: this.scheduler.timeSignature}).value;});
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "filters":
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