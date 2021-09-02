// Based on "A Tale of Two Clocks" https://www.html5rocks.com/en/tutorials/audio/scheduling/

import {SequencerItem} from '../sequencer/items/SequencerItem.mjs';
import {MIDIItem} from '../sequencer/items/MIDIItem.mjs';
import {ControlCode, ControlItem} from '../sequencer/items/ControlItem.mjs';
import {AudioItem} from '../sequencer/items/AudioItem.mjs';
import {Tempo} from '../util/tempo.mjs';
import {Length} from '../util/length.mjs';
import {TimeSignature} from '../util/timeSignature.mjs';

const Lookahead = 0.1; // How far ahead to schedule audio (sec)
const Interval = 25.0;//5.0; // How frequently to call scheduling function (in milliseconds)

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

class NextBeat extends Event {
  
  #absoluteBeatNumber;
  
  #barNumber;
  #beatInBar;
  
  constructor(absoluteBeatNumber, barNumber, beatInBar) {
    super('nextBeat');
    this.#absoluteBeatNumber = absoluteBeatNumber;
    this.#barNumber = barNumber;
    this.#beatInBar = beatInBar;
  }
  
  get absoluteBeatNumber() {
    return this.#absoluteBeatNumber;
  }
  
  get barNumber() {
    return this.#barNumber;
  }
  
  get beatInBar() {
    return this.#beatInBar;
  }
}

class AudioContextChanged extends Event {
  constructor() {
    super('AudioContextChanged');
  }
}

export class Scheduler extends EventTarget {
  
  #boundMethods = {};
  #config = {};
  #queue = [];
  #schedulerTimer;
  #barNumber = -1;
  #absoluteBeatNumber = -1;
  #beatInBarNumber = -1;
  #nextBarTime = Infinity;
  #nextBeatTime = Infinity;
  #audioCtx;
  
  static GLOBAL = new Scheduler();
  
  constructor(config) {
    super(config);
    
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
    // this.addEventListener('item', this.#boundMethods.scheduleItem);
  }
  
  get audioContext() {
    return this.#audioCtx;
  }
  
  set audioContext(newValue) {
    if (this.audioContext != newValue) {
      this.#audioCtx = newValue;
      this.dispatchEvent(new AudioContextChanged());
    }
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
    this.#nextBarTime = this.audioContext.currentTime;
    this.#nextBeatTime = this.audioContext.currentTime;
    
    this.#absoluteBeatNumber = -1;
    this.#beatInBarNumber = -1;
    this.#barNumber = -1;
    
    this.#schedulerTimer = setInterval(this.#boundMethods.scheduler, this.#config.interval);
    
    this.#boundMethods.scheduler();
  }
  
  stop() {
    clearInterval(this.#schedulerTimer);
    this.#schedulerTimer = null;
    this.#absoluteBeatNumber = -1;
    this.#beatInBarNumber = -1;
    this.#barNumber = -1;
    this.#queue = [];
  }
  
  _scheduler() {
    // while there are notes that will need to play before the next interval, schedule them.
    
    this.#queue.forEach((item) => {
      
      if (item.resolved) {
        
        const start = item.timings.start.to(Length.units.second).value;
        
        if (start < (this.audioContext.currentTime + this.#config.lookahead)) {
        
          if (item instanceof AudioItem) {
            
            item.audio.start(start);
            
          } else if (item instanceof MIDIItem) {
            
            item.timings.timestamp = start;
            
            this.dispatchEvent(item);
            
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
      this.#beatInBarNumber = -1;
      this.dispatchEvent(new NextBar(this.#barNumber));
      
      // set start times for outstanding 
      this.#queue.forEach((item) => {
        if (!item.resolved) {
          item.resolve(new Length(this.#nextBarTime, Length.units.second), {tempo: this.tempo});
        }
      });
      
      this.#nextBarTime += this.tempo.barTime;
    }
    
    if (this.#nextBeatTime < this.#audioCtx.currentTime + this.#config.lookahead) {
    
      this.#queue = this.#queue.filter(item => !item[QUEUE_DELETE_FLAG]);
      
      this.#absoluteBeatNumber++;
      this.#beatInBarNumber++;
      
      this.dispatchEvent(new NextBeat(this.#absoluteBeatNumber, this.#barNumber, this.#beatInBarNumber));
      
      // set start times for outstanding 
      // this.#queue.forEach((item) => {
      //   if (!item.resolved) {
      //     item.resolve(new Length(this.#nextBarTime, Length.units.second), {tempo: this.tempo});
      //   }
      // });
      
      this.#nextBeatTime += this.tempo.beatTime;
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
    
    item[QUEUE_DELETE_FLAG] = false;
    
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
        this.stop();
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
    
    this.dispatchEvent(item);
  }
  
};

export const GLOBAL = Scheduler.GLOBAL;

if (!Scheduler.GLOBAL.audioContext) {
  Scheduler.GLOBAL.audioContext = new AudioContext();
}