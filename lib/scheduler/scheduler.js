// Based on "A Tale of Two Clocks" https://www.html5rocks.com/en/tutorials/audio/scheduling/

import {SequencerItem} from '../sequencer/items/SequencerItem.js';
import {ControlCode, ControlItem} from '../sequencer/items/ControlItem.js';
import {AudioItem} from '../sequencer/items/AudioItem.js';
import {Tempo} from '../util/tempo.js';
import {Length} from '../util/length.js';
import {TimeSignature} from '../util/timeSignature.js';

const Lookahead = 0.1; // How far ahead to schedule audio (sec)
const Interval = 25.0; // How frequently to call scheduling function (in milliseconds)

const SecondsInMinute = 60.0;

const defaultConfig = {
  tempo: new Tempo({
    BPM: 120,
    timeSignature: new TimeSignature(4, 4)
  }),
  lookahead: Lookahead,
  interval: Interval
};

const QUEUE_DELETE_FLAG = Symbol('delete');

export const CONTROL_CODES = {
  TEMPO: ControlCode.create('tempo', Tempo),
  START: ControlCode.create('start', null),
  STOP: ControlCode.create('stop', null),
  TIME_SIGNATURE: ControlCode.create('timeSignature', TimeSignature)
};

class NextBar extends Event {
  
  #barNumber;
  
  constructor(barNumber) {
    super('nextBar');
    this.#barNumber = barNumber;
  }
  
  get barNumber() {
    return this.#barNumber;
  }
}

export class Scheduler extends EventTarget {
  
  #boundMethods = {};
  #config = {};
  #queue = [];
  #schedulerTimer;
  #barNumber = 0;
  #nextBarTime = Infinity;
  #audioCtx;
  
  constructor(config) {
    super();
    
    this.#config = {...defaultConfig, ...config};
    
    this._bindMethods();
    
    this._setupEventListeners();
  }
  
  _bindMethods() {
    // this.#boundMethods.start = this.start.bind(this);
    this.#boundMethods.scheduleItem = this._scheduleItem.bind(this);
    this.#boundMethods.scheduleItems = this._scheduleItems.bind(this);
    this.#boundMethods.scheduler = this._scheduler.bind(this);
    
    this.scheduleItem = this.#boundMethods.scheduleItem;
    this.scheduleItems = this.#boundMethods.scheduleItems;
  }
  
  _setupEventListeners() {
    // this.addEventListener("start", this.#boundMethods.start);
    this.addEventListener('item', this.#boundMethods.scheduleItem);
  }
  
  get audioContext() {
    return this.#audioCtx;
  }
  
  set audioContext(newValue) {
    this.#audioCtx = newValue;
  }
  
  set tempo(newValue) {
    if (newValue instanceof Tempo) {
      this.#config.tempo = newValue;
    } else {
      throw new TypeError('tempo must be of type Tempo');
    }
  }
  
  get tempo() {
    return this.#config.tempo;
  }
  
  set timeSignature(newValue) {
    this.tempo.timeSignature = newValue;
  }
  
  get timeSignature() {
    return this.tempo.timeSignature;
  }
  
  start() {
    if (!this.audioContext) {
      console.warn("No audio context");
      return;
    }
    if (this._schedulerTimer) {
      console.warn("Already running");
      return;
    }
    console.info("Starting scheduler");
    this.#nextBarTime = this.audioContext.currentTime;
    this.#boundMethods.scheduler();
    
    this.#schedulerTimer = setInterval(this.#boundMethods.scheduler, this.#config.interval);
  }
  
  _stop() {
    clearInterval(this.#schedulerTimer);
    this.#schedulerTimer = null;
    this.#barNumber = 0;
    this.#queue = [];
  }
  
  _scheduler() {
    // while there are notes that will need to play before the next interval, schedule them.

    
    this.#queue.forEach((item) => {
      
      if (item.resolved) {
        
        const start = item.timings.start.to(Length.units.second).value;
        
        if (start < this.audioContext.currentTime + this.#config.lookahead) {
        
          if (item instanceof AudioItem) {
            
            item.audio.start(start);
            
          } else if (item instanceof ControlItem) {
            
            setTimeout(this._processCommand.bind(this, item), 1000 * (item.timings.start - this.audioContext.currentTime));
            
          }
          
          item[QUEUE_DELETE_FLAG] = true;
        }
      }
    });
    
    this.#queue = this.#queue.filter(item => !item[QUEUE_DELETE_FLAG]);
    
    if (this.#nextBarTime < this.#audioCtx.currentTime + this.#config.lookahead) {
      
      // process outstanding commands before next bar starts
      this.#queue.forEach((item) => {
        // ignore commands that have a beat set
        if (item instanceof ControlItem) {
          this._processCommand(item);
          item[QUEUE_DELETE_FLAG] = true;
        }
      });
    
      this.#queue = this.#queue.filter(item => !item[QUEUE_DELETE_FLAG]);
      
      this.#barNumber++;
      this.dispatchEvent(new NextBar(this.#barNumber));
      
      // set start times for outstanding 
      this.#queue.forEach((item) => {
        if (!item.resolved) {
          item.resolve(new Length(this.#nextBarTime, Length.units.second), {tempo: this.tempo});
        }
      });
      
      this.#nextBarTime += this.tempo.barTime;
    }
  }
  
  _scheduleItems(items) {
    items.forEach(this.scheduleItem);
  }
  
  _scheduleItem(item) {
    if (item.controlCode === CONTROL_CODES.START) {
      this.start();
      return;
    }
    
    if (item.immediate) {
      item.resolve(new Length(this.#audioCtx.currentTime, Length.units.second), {tempo: this.tempo});
    }
    this.#queue.push(item);
  }
  
  _processCommand(item) {
    
    if (! item instanceof ControlItem) {
      throw new TypeError('command is not a ControlItem');
    }
    
    switch (item.controlCode) {
      case CONTROL_CODES.START:
        this.start();
        break;
      case CONTROL_CODES.STOP:
        this._stop();
        break;
      case CONTROL_CODES.TIME_SIGNATURE:
        this.timeSignature = item.payload;
        break;
      case CONTROL_CODES.TEMPO:
        this.tempo = item.payload;
        break;
      default:
        console.warn(`Command "${ControlCode.get(item.controlCode).name}" not supported`);
    }
  }

}