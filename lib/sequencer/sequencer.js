export class Sequencer {
  
  constructor(scheduler, config) {
    
    this._config = config;
    
    this._scheduler = scheduler;
    
    this._setupEventListeners();
  }
  
  _setupEventListeners() {
    this._scheduler.addEventListener("nextBar", this._nextBar.bind(this));
    this._scheduler.addEventListener("start", this._start.bind(this));
    this._scheduler.addEventListener("stop", this._stop.bind(this));
  }
  
  _nextBar() {
    throw new Error("method _nextBar must be overridden");
  }
  
  _start() {
    // by default do nothing
  }
  
  _stop() {
    // by default do nothing
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