import {Sequencer} from './sequencer.mjs';
import {MIDI} from '../util/midi.mjs';
import {MIDIItem} from './items/MIDIItem.mjs';

import {CONTROL_CODES, GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class MIDISequencer extends Sequencer {
  
  constructor(config) {
    super(config);
    
  }
  
  _stop() {
    super._stop();
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