import {Sequencer} from './sequencer.js';
import {MIDI} from '../util/midi.js';
import {Length} from '../util/length.js';
import {SequencerItem} from './items/SequencerItem.js';
import {MIDIItem} from './items/MIDIItem.js';

import {CONTROL_CODES, GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class MIDISequencer extends Sequencer {
  
  constructor(config) {
    super(config);
    
    const kick = {
      channel: 9,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_On,
      note: 36,
      velocity: 127
    };
    
    const drumBeats = [
      new MIDIItem({
        message: kick,
        timings: {
          offset: new Length(0, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: kick,
        timings: {
          offset: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: kick,
        timings: {
          offset: new Length(2.5, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: kick,
        timings: {
          offset: new Length(3, Length.units.beat)
        }
      })
    ];
    
    const C3_on = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_On,
      note: 36,
      velocity: 127
    };
    
    const C3_off = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_Off,
      note: 36,
      velocity: 127
    };
    
    const Cs3_on = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_On,
      note: 37,
      velocity: 127
    };
    
    const Cs3_off = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_Off,
      note: 37,
      velocity: 127
    };
    
    const B3_on = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_On,
      note: 35,
      velocity: 127
    };
    
    const B3_off = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_Off,
      note: 35,
      velocity: 127
    };
    
    const Bb3_on = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_On,
      note: 34,
      velocity: 127
    };
    
    const Bb3_off = {
      channel: 0,
      method: MIDI.Channel_Voice,
      command: MIDI.Note_Off,
      note: 34,
      velocity: 127
    };
    
    const synthEven = [
      new MIDIItem({
        message: C3_on,
        timings: {
          offset: new Length(0, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_off,
        timings: {
          offset: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_on,
        timings: {
          offset: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_off,
        timings: {
          offset: new Length(2, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: Bb3_on,
        timings: {
          offset: new Length(2, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: Bb3_off,
        timings: {
          offset: new Length(3, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_on,
        timings: {
          offset: new Length(3, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_off,
        timings: {
          offset: new Length(4, Length.units.beat)
        }
      })
    ];
    
    const synthOdd = [
      new MIDIItem({
        message: C3_on,
        timings: {
          offset: new Length(0, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_off,
        timings: {
          offset: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_on,
        timings: {
          offset: new Length(1, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_off,
        timings: {
          offset: new Length(2, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: Cs3_on,
        timings: {
          offset: new Length(2, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: Cs3_off,
        timings: {
          offset: new Length(3, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_on,
        timings: {
          offset: new Length(3, Length.units.beat)
        }
      }),
      new MIDIItem({
        message: C3_off,
        timings: {
          offset: new Length(4, Length.units.beat)
        }
      })
    ];
    
    for (let i = 0; i < 24; i++) {
      this.items[i] = [];
      this.items[i].push(...drumBeats.map(item => SequencerItem.create(item.toJSON())));
      if (i%2 == 0) {
        this.items[i].push(...synthEven.map(item => SequencerItem.create(item.toJSON())));
      } else {
        this.items[i].push(...synthOdd.map(item => SequencerItem.create(item.toJSON())));
      }
    }
    
  }
  
  _nextBar(e) {
    
    const beats = this.items?.[e.barNumber];
    
    if (beats) {
      GlobalScheduler.scheduleItems(beats);
    }
  }
  
}