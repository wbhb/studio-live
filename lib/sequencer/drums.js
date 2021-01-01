import {SampleSequencer} from './sampleSequencer.js';
import {SequencerItem} from './items/SequencerItem.js';
import {AudioItem} from './items/AudioItem.js';
import {CachedAudioItem} from './items/CachedAudioItem.js';
import {Length} from '../util/length.js';

const urlRoot = document.location.href.substring(0, document.location.href.lastIndexOf('/'));

const Samples = new Map();
Samples.set('Closed Hat', new URL(`${urlRoot}/static/audio/drums/CO/ClosedHat.wav`));
Samples.set('Crash', new URL(`${urlRoot}/static/audio/drums/CO/CrashCymbal.wav`));
Samples.set('Floor Tom', new URL(`${urlRoot}/static/audio/drums/CO/FloorTom.wav`));
Samples.set('Kick', new URL(`${urlRoot}/static/audio/drums/CO/Kick.wav`));
Samples.set('Mid Hat', new URL(`${urlRoot}/static/audio/drums/CO/MidHat.wav`));
Samples.set('Mid Tom', new URL(`${urlRoot}/static/audio/drums/CO/MidTom.wav`));
Samples.set('Open Hat 1', new URL(`${urlRoot}/static/audio/drums/CO/OpenHat1.wav`));
Samples.set('Open Hat 2', new URL(`${urlRoot}/static/audio/drums/CO/OpenHat2.wav`));
Samples.set('Ride', new URL(`${urlRoot}/static/audio/drums/CO/RideCymbal.wav`));
Samples.set('Sample 1', new URL(`${urlRoot}/static/audio/drums/CO/Sample1.wav`));
Samples.set('Sample 2', new URL(`${urlRoot}/static/audio/drums/CO/Sample2.wav`));

export class Drums extends SampleSequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, {...config, ...{
      samples: Samples
    }});
    
  }
  
  _handleItem(item) {
    if (!item instanceof SequencerItem) {
      throw new Error("trying to handle item that isn't a SequencerItem");
    }
    
    if (item instanceof CachedAudioItem) {
      this._scheduleAudio(item);
    } else {
      super._handleItem(item);
    }
  }
  
  async _scheduleAudio(item) {
    
    let beat = new AudioItem();
    beat.timings.offset = item.timings.offset;
    beat.timings.length = item.timings.length;
    beat.timings.start = item.timings.start;
    // beat.timings.immediate = item.timings.immediate;
    // console.log(Samples.get(item.cacheKey));
    beat.audio = await this._createSampleNode(Samples.get(item.cacheKey));
    this.scheduler.scheduleItem(beat);
  }
  
  _nextBar(e) {
    this.items.filter((item) => {
      
      return  item instanceof CachedAudioItem
          &&  item.timings.offset.to(Length.units.bar, {timeSignature: this.scheduler.timeSignature, wholeBar: true}).value == e.barNumber;
    }).forEach((item) => {
      console.log(item);
      this._scheduleAudio(item);
    });
  }

}
