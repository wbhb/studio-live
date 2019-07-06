// Based on "A Tale of Two Clocks" https://www.html5rocks.com/en/tutorials/audio/scheduling/

import {SequencerItem} from '../sequencer/items/SequencerItem.js';
import {ControlCode, ControlItem} from '../sequencer/items/ControlItem.js';
import {AudioItem} from '../sequencer/items/AudioItem.js';
import {Tempo} from '../util/tempo.js';
import {Length} from '../util/length.js';
import {TimeSignature} from '../util/timeSignature.js';

const TimeSignature = new TimeSignature({
  upper: 4,
  lower: 4
});

const Lookahead = 0.1; // How far ahead to schedule audio (sec)
const Interval = 25.0; // How frequently to call scheduling function (in milliseconds)

const SecondsInMinute = 60.0;

const defaultConfig = {
  tempo: {
    bpm: 120
  },
  timeSignature: TimeSignature,
  lookahead: Lookahead,
  interval: Interval
};

const QUEUE_DELETE_FLAG = Symbol('delete');

const TEMPO = ControlCode.create('tempo', Tempo);
const START = ControlCode.create('start', null);
const STOP = ControlCode.create('stop', null);
const TIME_SIGNATURE = ControlCode.create('timeSignature', TimeSignature);

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
    this.#boundMethods.start = this._start.bind(this);
    this.#boundMethods.command = this._command.bind(this);
    this.#boundMethods.scheduleItem = this._scheduleItem.bind(this);
    this.#boundMethods.scheduler = this._scheduler.bind(this);
  }
  
  _setupEventListeners() {
    this.addEventListener("start", this.#boundMethods.start);
    // this.addEventListener("stop", this._stop.bind(this));
    this.addEventListener('item', this.#boundMethods.command);
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
  
  _start() {
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
      if (item.resolved && item.timings.start < this.audioContext.currentTime + this.#config.lookahead) {
        
        if (item instanceof AudioItem) {
          
          item.audio.start(item.timings.start);
          
        } else if (item instanceof ControlItem) {
          
          setTimeout(this._processCommand.bind(this, item), 1000 * (item.timings.start - this.#audioContext.currentTime));
          
        }
        
        item[QUEUE_DELETE_FLAG] = true;
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
          item.resolve(new Length(this.#nextBarTime, Length.units.second));
        }
      });
      
      this.#nextBarTime += this.tempo.barTime;
    }
  }
  
  scheduleItems(items) {
    items.forEach(this.scheduleItem);
  }
  
  scheduleItem(item) {
    let _item = Object.assign({}, item);
    if (_item.immediate) {
      _item.resolve(new Length(this.#audioCtx.currentTime, Length.units.second));
    }
    this.#queue.push(_item);
  }
  
  _processCommand(item) {
    
    if (! item instanceof ControlItem) {
      throw new TypeError('command is not a ControlItem');
    }
    
    switch (item.controlCode) {
      case START:
        this._start();
        break;
      case STOP:
        this._stop();
        break;
      case TIME_SIGNATURE:
        this.timeSignature = item.payload;
        break;
      case TEMPO:
        this.tempo = item.payload;
        break;
      default:
        console.warn(`Command "${ControlCode.get(item.controlCode).name}" not supported`);
    }
  }

}