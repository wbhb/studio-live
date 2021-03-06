import {ItemDB} from './items/ItemDB.mjs';
import {SequencerItem} from './items/SequencerItem.mjs';
import {SectionItem} from './items/SectionItem.mjs';
import {ControlItem} from './items/ControlItem.mjs';
import {CONTROL_CODES, GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Sequencer {
  
  #config;
  #boundMethods = {};
  #items = [];
  #activeSections = new Map();
  
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
  
  getBarItems(bar) {
    return this.items?.[bar] ?? [];
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
    
    const ids = Array.from(this.getBarItems(e.barNumber));
    
    this.#activeSections.forEach((section, key) => {
      const result = section.next();
      
      if (result.done) {
        this.#activeSections.delete(key);
      }
      
      if (result.value) {
        ids.push(...result.value);
      }
      
    });
    
    
    const beats = this.expandItems(ids);
    
    
    if (beats) {
      GlobalScheduler.scheduleItems(beats);
    }
  }
  
  expandItems(itemIds) {
    return itemIds.flatMap((id) => {
      
      const item = ItemDB.get(id);
      
      if (item instanceof SectionItem) {
        const gen = item.nextBar();
        
        const result = gen.next();
        
        if (!result.done) {
          this.#activeSections.set(id, gen);
        }
        
        //cyclic check
        
        return this.expandItems(result.value);
        
      } else {
        return item;
      }
    });
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
    this.#activeSections.clear();
  }
  
  _stop() {
    this.#activeSections.clear();
  }

}
