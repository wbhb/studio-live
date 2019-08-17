import {SampleSequencer} from './sampleSequencer.js';
import {SequencerItem} from './items/SequencerItem.js';
import {AudioItem} from './items/AudioItem.js';
import {PromptItem} from './items/PromptItem.js';
import {Length} from '../util/length.js';

const urlRoot = document.location.href.substring(0, document.location.href.lastIndexOf('/'));

const Samples = new Map();
Samples.set('Ad Lib', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Ad Lib.wav`));
Samples.set('All In', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - All In.wav`));
Samples.set('Bass', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Bass.wav`));
Samples.set('Big Ending', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Big Ending.wav`));
Samples.set('Break', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Break.wav`));
Samples.set('Build', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Build.wav`));
Samples.set('Drums In', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Drums In.wav`));
Samples.set('Drums', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Drums.wav`));
Samples.set('Hits', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Hits.wav`));
Samples.set('Hold', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Hold.wav`));
Samples.set('Key Change Down', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Key Change Down.wav`));
Samples.set('Key Change Up', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Key Change Up.wav`));
Samples.set('Keys', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Keys.wav`));
Samples.set('Last Time', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Last Time.wav`));
Samples.set('Slowly Build', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Slowly Build.wav`));
Samples.set('Softly', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Softly.wav`));
Samples.set('Swell', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Swell.wav`));
Samples.set('Worship Freely', new URL(`${urlRoot}/static/audio/prompts/dynamic/English Female - Worship Freely.wav`));
Samples.set('1', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 1.wav`));
Samples.set('2', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 2.wav`));
Samples.set('3', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 3.wav`));
Samples.set('4', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 4.wav`));
Samples.set('5', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 5.wav`));
Samples.set('6', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 6.wav`));
Samples.set('7', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - 7.wav`));
Samples.set('Acapella', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Acapella.wav`));
Samples.set('Breakdown', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Breakdown.wav`));
Samples.set('Bridge 1', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Bridge 1.wav`));
Samples.set('Bridge 2', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Bridge 2.wav`));
Samples.set('Bridge 3', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Bridge 3.wav`));
Samples.set('Bridge 4', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Bridge 4.wav`));
Samples.set('Bridge', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Bridge.wav`));
Samples.set('Chorus 1', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Chorus 1.wav`));
Samples.set('Chorus 2', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Chorus 2.wav`));
Samples.set('Chorus 3', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Chorus 3.wav`));
Samples.set('Chorus 4', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Chorus 4.wav`));
Samples.set('Chorus', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Chorus.wav`));
Samples.set('Ending', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Ending.wav`));
Samples.set('Exhortation', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Exhortation.wav`));
Samples.set('Instrumental', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Instrumental.wav`));
Samples.set('Interlude', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Interlude.wav`));
Samples.set('Intro', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Intro.wav`));
Samples.set('Outro', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Outro.wav`));
Samples.set('Post Chorus', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Post Chorus.wav`));
Samples.set('Pre Chorus 1', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Pre Chorus 1.wav`));
Samples.set('Pre Chorus 2', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Pre Chorus 2.wav`));
Samples.set('Pre Chorus 3', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Pre Chorus 3.wav`));
Samples.set('Pre Chorus 4', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Pre Chorus 4.wav`));
Samples.set('Pre Chorus', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Pre Chorus.wav`));
Samples.set('Rap', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Rap.wav`));
Samples.set('Refrain', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Refrain.wav`));
Samples.set('Solo', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Solo.wav`));
Samples.set('Tag', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Tag.wav`));
Samples.set('Turnaround', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Turnaround.wav`));
Samples.set('Vamp', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Vamp.wav`));
Samples.set('Verse 1', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse 1.wav`));
Samples.set('Verse 2', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse 2.wav`));
Samples.set('Verse 3', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse 3.wav`));
Samples.set('Verse 4', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse 4.wav`));
Samples.set('Verse 5', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse 5.wav`));
Samples.set('Verse 6', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse 6.wav`));
Samples.set('Verse', new URL(`${urlRoot}/static/audio/prompts/sections/English Female - Verse.wav`));

export class Prompts extends SampleSequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, {...config, ...{
      samples: Samples
    }});
    
  }
  
  _handleItem(item) {
    if (!item instanceof SequencerItem) {
      throw new Error("trying to handle item that isn't a SequencerItem");
    }
    
    if (item instanceof PromptItem) {
      if (item.prompts.length) {
        this._schedulePrompt(item);
      }
    } else {
      super._handleItem(item);
    }
  }
  
  async _schedulePrompt(item) {
    let beats = await this._getBeats(item);
    this.scheduler.scheduleItems(beats);
  }
  
  async _getBeats(item) {
    let beats = [];
    
    let iterations = item.count ? this.scheduler.timeSignature.upper : item.prompts.length;
    
    for (let i = 1; i <= iterations; i++) {
      let beat = new AudioItem();
      beat.timings.offset = new Length(i - 1, Length.units.beat);
      beat.timings.length = new Length(1, Length.units.beat);
      
      if (i <= item.prompts.length) {
        beat.audio = await this._createSampleNode(Samples.get(item.prompts[i - 1]));
      } else {
        beat.audio = await this._createSampleNode(Samples.get(`${i}`), {gain: 0.5});
      }
      
      beats.push(beat);
    }
    
    return beats;
  }
  
  _nextBar(e) {
    //do nothing
  }

}
