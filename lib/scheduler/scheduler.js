// Based on "A Tale of Two Clocks" https://www.html5rocks.com/en/tutorials/audio/scheduling/

const TimeSignature = {
  upper: 4,
  lower: 4
};

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

export class Scheduler extends EventTarget {
  
  constructor(config) {
    super();
    
    this._config = {...defaultConfig, ...config};
    
    this._queue = [];
    
    this.tempo = this._config.tempo;
    
    this._nextBarTime = Infinity;
    
    this._setupEventListeners();
  }
  
  _setupEventListeners() {
    this.addEventListener("start", this._start.bind(this));
    // this.addEventListener("stop", this._stop.bind(this));
    this.addEventListener("command", this._command.bind(this));
    this.addEventListener("scheduleItem", this._scheduleItem.bind(this));
  }
  
  get audioContext() {
    return this._audioCtx;
  }
  
  set audioContext(newValue) {
    this._audioCtx = newValue;
  }
  
  set tempo(newValue) {
    if (newValue) {
      this._config.tempo = newValue;
    } else {
      console.warn("No tempo provided");
      return;
    }
    if (this.tempo.bpm) {
      this._beatTime = this._calculateBeatTime();
      return;
    } else if (this.tempo.beatTime) {
      this._beatTime = this.tempo.beatTime;
      return;
    }
    console.warn("No useful tempo data provided");
    return;
  }
  
  get tempo() {
    return this._config.tempo;
  }
  
  set timeSignature(newValue) {
    if (newValue.upper && newValue.lower) {
      this._config.timeSignature = newValue;
      this._beatTime = this._calculateBeatTime();
    } else {
      console.warn("upper and lower parts required");
      return;
    }
  }
  
  get timeSignature() {
    return this._config.timeSignature;
  }
  
  _calculateBeatTime() {
    return SecondsInMinute / this._config.tempo.bpm / (this._config.timeSignature.lower / 4);
  }
  
  _start() {
    if (!this._audioCtx) {
      console.warn("No audio context");
      return;
    }
    if (this._schedulerTimer) {
      console.warn("Already running");
      return;
    }
    console.log("Starting scheduler");
    this._nextBarTime = this._audioCtx.currentTime;
    this._scheduler();
    
    this._schedulerTimer = window.setInterval(this._scheduler.bind(this), this._config.interval);
  }
  
  _stop() {
    clearInterval(this._schedulerTimer);
    this._schedulerTimer = null;
    this._queue = [];
  }
  
  _command(event) {
    if (event.detail.item.immediate) {
      this._processCommand(event.detail.item);
    } else {
      this.scheduleNextBar([event.detail.item]);
    }
  }
  
  _scheduler() {
    // while there are notes that will need to play before the next interval, schedule them.

    
    this._queue.forEach((item) => {
      if (item.startTime && item.startTime < this._audioCtx.currentTime + this._config.lookahead) {
        
        if (item.audio) {
          
          if (item.audio instanceof window.AudioNode) {
          
            item.audio.start(item.startTime);
          
          } else {
            
            console.error("item is not an AudioNode");
            
          }
          
        } else if (item.type == "command") {
          
          this._processCommand(item);
          
        }
        
        item.delete = true;
      }
    });
    
    this._queue = this._queue.filter((item) => {
      return !item.delete;
    });
    
    if (this._nextBarTime < this._audioCtx.currentTime + this._config.lookahead) {
      
      // process outstanding commands before next bar starts
      this._queue.forEach((item) => {
        // ignore commands that have a beat set
        if (!item.beat && item.command) {
          this._processCommand(item);
          item.delete = true;
        }
      });
    
      this._queue = this._queue.filter((item) => {
        return !item.delete;
      });
      
      this.dispatchEvent(new CustomEvent('nextBar'));
      
      // set start times for outstanding 
      this._queue.forEach((item) => {
        if (item.beat && !item.startTime) {
          if (item.beat >= this._config.timeSignature.upper + 1) {
            console.warn("beat not within bar, ignoring");
            item.delete = true;
            return;
          }
          this._setStartTime(item);
        }
      });
    
      this._queue = this._queue.filter((item) => {
        return !item.delete;
      });
      
      this._nextBarTime += this._config.timeSignature.upper * this._beatTime;
    }
  }
  
  _setStartTime(item) {
    item.startTime = this._nextBarTime + ((item.beat || 1) - 1) * this._beatTime;
  }
  
  /*
    Adds samples to the queue, and sets StartTime, so they schedule during the current bar
  */
  scheduleImmediate(items) {
    items.forEach((item) => {
      // create copy of object
      let _item = Object.assign({}, item);
      // if (_item.type = "command") {
      //   this._processCommand(_item);
      // } else {
        this._setStartTime(_item);
        this._queue.push(_item);
      // }
    });
  }
  
  /*
    Adds samples to the queue
  */
  scheduleNextBar(items) {
    items.forEach((item) => {
      // create copy of object
      let _item = Object.assign({}, item);
      if (!_item.beat) {
        _item.beat = 0;
      }
      this._queue.push(_item);
    });
  }
  
  _scheduleItem(e) {
    let item = e.detail.item;
    
    console.log(`schedule: ${item.type}`);
    console.log(item);
    
    let evt = new window.CustomEvent(item.type, {detail: {item}});
    
    this.dispatchEvent(evt);
  }
  
  _processCommand(item) {
    
    console.log(`command: ${item.command}`);
    console.log(item);
    
    switch (item.command) {
      case "start":
        this._start();
        break;
      case "stop":
        this._stop();
        break;
      case "timeSignature":
        this.timeSignature = item.timeSignature;
        break;
      case "tempo":
        this.tempo = item.tempo;
        break;
      default:
        console.warn(`Command "${item.command}" not supported`);
    }
  }

}

/*
[
  {
    command: setTempo,
    data: {
      bpm: Number
    }
  },
  {
    command: setTimeSignature,
    data: {
      upper: Number,
      lower: Number
    }
  },
  {
    command: start
  },
  {
    command: stop
  }
  {
    audio: AudioNode,
    // floating point number
    beat: 
  }
]
*/