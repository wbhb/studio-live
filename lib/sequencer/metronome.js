import {SampleSequencer} from "./sampleSequencer.js";
import {AudioItem} from './items/AudioItem.js';
import {Length} from '../util/length.js';

const urlRoot = document.location.href.substring(0, document.location.href.lastIndexOf('/'));

const Samples = new Map();
Samples.set('metronomeUp', new URL(`${urlRoot}/static/audio/MetronomeUp.wav`));
Samples.set('metronomeDown', new URL(`${urlRoot}/static/audio/Metronome.wav`));

export class Metronome extends SampleSequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, {...config, ...{
      samples: Samples
    }});
  }
  
  async _getBeats() {
    let beats = [];
    
    for (let i = 0; i < this.scheduler.timeSignature.upper; i++) {
      let beat = new AudioItem();
      beat.timings.offset = new Length(i, Length.units.beat);
      beat.timings.length = new Length(1, Length.units.beat);
      
      if (i == 0) {
        beat.audio = await this._createSampleNode(Samples.get('metronomeUp'));
      } else if (this.scheduler.timeSignature.upper % 3 == 0 && (i - 1) % 3 == 0) {
        beat.audio = await this._createSampleNode(Samples.get('metronomeDown'), {gain: 0.7});
      } else {
        beat.audio = await this._createSampleNode(Samples.get('metronomeDown'), {gain: 0.5});
      }
      
      beats.push(beat);
    }
    
    return beats;
  }
  
  async _nextBar() {
    console.info('nextBar');
    let beats = await this._getBeats();
    this.scheduler.scheduleItems(beats);
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