import {SequencerItem} from './items/SequencerItem.js';
import {ControlItem} from './items/ControlItem.js';
import {CONTROL_CODES} from '../scheduler/scheduler.js';

export class Sequencer {
  
  #config;
  #scheduler;
  #boundMethods = {};
  #items = [];
  #currentBar = 0;
  
  constructor(scheduler, config) {
    
    this.#config = config;
    
    this.#scheduler = scheduler;
    
    this._bindMethods();
    
    this._setupEventListeners();
  }
  
  get config() {
    return this.#config;
  }
  
  get scheduler() {
    return this.#scheduler;
  }
  
  set items(newValue) {
    this.#items = newValue;
  }
  
  get items() {
    return this.#items;
  }
  
  get currentBar() {
    return this.#currentBar;
  }
  
  _bindMethods() {
    this.#boundMethods._nextBar = this._nextBar.bind(this);
    this.#boundMethods._handleItem = this._handleItem.bind(this);
  }
  
  _setupEventListeners() {
    this.#scheduler.addEventListener("nextBar", this.#boundMethods._nextBar);
    this.#scheduler.addEventListener("item", this.#boundMethods._handleItem);
  }
  
  _nextBar() {
    this.#currentBar++;
    console.log(this.#currentBar);
    // throw new Error("method _nextBar must be overridden");
  }
  
  _handleItem(item) {
    if (!item instanceof SequencerItem) {
      throw new Error("trying to handle item that isn't a SequencerItem");
    }
    
    if (item instanceof ControlItem) {
      switch (item.controlCode) {
        case CONTROL_CODES.START:
          this._start();
          break;
        case CONTROL_CODES.STOP:
          this._stop();
          break;
      }
    }
  }
  
  _start() {
    // by default do nothing
  }
  
  _stop() {
    // by default do nothing
  }

}
