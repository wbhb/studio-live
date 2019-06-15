import {SampleSequencer} from "./sampleSequencer.js";

const Samples = [
  {
    name: 'metronomeUp',
    filename: 'static/audio/MetronomeUp.wav'
  },
  {
    name: 'metronomeDown',
    filename: 'static/audio/Metronome.wav'
  }
];

export class Metronome extends SampleSequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, {...config, ...{
      samples: Samples
    }});
  }
  
  async _getBeats() {
    let beats = [];
    
    for (let i = 1; i <= this._scheduler.timeSignature.upper; i++) {
      let beat = {};
      beat.beat = i;
      
      if (i == 1) {
        beat.audio = await this._createSampleNode('metronomeUp');
      } else if (this._scheduler.timeSignature.upper % 3 == 0 && (i - 1) % 3 == 0) {
        beat.audio = await this._createSampleNode('metronomeDown', {gain: 0.7});
      } else {
        beat.audio = await this._createSampleNode('metronomeDown', {gain: 0.5});
      }
      
      beats.push(beat);
    }
    
    return beats;
  }
  
  async _nextBar() {
    let beats = await this._getBeats();
    this._scheduler.scheduleNextBar(beats);
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