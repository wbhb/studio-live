import {SequencerItem} from './items/SequencerItem.js';
import {ControlItem} from './items/ControlItem.js';
import {CONTROL_CODES, GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class Sequencer {
  
  #config;
  #boundMethods = {};
  #items = [];
  
  constructor(config) {
    
    this.#config = config;
    
    this._bindMethods();
    
    this._setupEventListeners();
  }
  
  get config() {
    return this.#config;
  }
  
  set items(newValue) {
    this.#items = newValue;
  }
  
  get items() {
    return this.#items;
  }
  
  _bindMethods() {
    this.#boundMethods._nextBar = this._nextBar.bind(this);
    this.#boundMethods._handleItem = this._handleItem.bind(this);
  }
  
  _setupEventListeners() {
    GlobalScheduler.addEventListener("nextBar", this.#boundMethods._nextBar);
    GlobalScheduler.addEventListener("item", this.#boundMethods._handleItem);
  }
  
  _nextBar(e) {
    
    const beats = this.items?.[e.barNumber]?.map(item => SequencerItem.create(item.toJSON()));
    
    if (beats) {
      GlobalScheduler.scheduleItems(beats);
    }
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
