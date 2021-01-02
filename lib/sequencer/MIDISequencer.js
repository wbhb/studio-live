import {Sequencer} from './sequencer.js';
import {MIDI} from '../util/midi.js';
import {Length} from '../util/length.js';
import {SequencerItem} from './items/SequencerItem.js';
import {MIDIItem} from './items/MIDIItem.js';

import {CONTROL_CODES, GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class MIDISequencer extends Sequencer {
  
  constructor(config) {
    super(config);
    
  }
  
  _nextBar(e) {
    
    const beats = this.items?.[e.barNumber];
    
    if (beats) {
      GlobalScheduler.scheduleItems(beats);
    }
  }
  
}