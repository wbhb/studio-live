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
  
  _stop() {
    let items = [];
    
    for (let i = 0; i <= 15; i++) {
      items.push(new MIDIItem({
        message: {
          channel: i,
          method: MIDI.Channel_Mode,
          command: MIDI.All_Notes_Off
        },
        timings: {
          immediate: true
        }
      }));
    }
    
    // GlobalScheduler.scheduleItems(items);
    
    items.forEach((item) => {
      GlobalScheduler.dispatchEvent(item);
    });
  }
  
}