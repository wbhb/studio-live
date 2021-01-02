import {Sequencer} from './sequencer.js';
import {MIDI} from '../util/midi.js';
import {Length} from '../util/length.js';
import {MIDIItem} from './items/MIDIItem.js';

import {CONTROL_CODES, GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class MIDISequencer extends Sequencer {
  
  constructor(config) {
    super(config);
  }
  
  _nextBar() {
    const beats = [
      new MIDIItem({
        message: {
          channel: 9,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_On,
          note: 36,
          velocity: 127
        },
        timings: {
          offset: new Length(0, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 0,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_On,
          note: 36,
          velocity: 127
        },
        timings: {
          offset: new Length(0, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 0,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_Off,
          note: 36,
          velocity: 127
        },
        timings: {
          offset: new Length(2, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 9,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_On,
          note: 36,
          velocity: 64
        },
        timings: {
          offset: new Length(1, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 0,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_On,
          note: 37,
          velocity: 127
        },
        timings: {
          offset: new Length(3, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 0,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_Off,
          note: 37,
          velocity: 127
        },
        timings: {
          offset: new Length(4, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 9,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_On,
          note: 36,
          velocity: 64
        },
        timings: {
          offset: new Length(2.5, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: {
          channel: 9,
          method: MIDI.Channel_Voice,
          command: MIDI.Note_On,
          note: 36,
          velocity: 64
        },
        timings: {
          offset: new Length(3, Length.units.beat),
          length: new Length(1, Length.units.beat)
        }
      })
    ];
    
    GlobalScheduler.scheduleItems(beats);
  }
  
}