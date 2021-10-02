import {Sequencer} from "./Sequencer.mjs";
import {MIDI} from '../util/midi.mjs';
import {DrumKit} from '../instrument/DrumKit.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Metronome extends Sequencer {
  
  static Bell = new MIDI.Message({
    channel: -1,
    method: MIDI.Channel_Voice,
    command: MIDI.Note_On,
    note: DrumKit.getNoteNumber('Metronome Bell'),
    velocity: 127
  });
  
  static Click = new MIDI.Message({
    channel: -1,
    method: MIDI.Channel_Voice,
    command: MIDI.Note_On,
    note: DrumKit.getNoteNumber('Metronome Click'),
    velocity: 64
  });
  
  static Emphasis = new MIDI.Message({
    channel: -1,
    method: MIDI.Channel_Voice,
    command: MIDI.Note_On,
    note: DrumKit.getNoteNumber('Metronome Click'),
    velocity: 96
  });
  
  constructor(config) {
    
    super(config);

    this.opaque = true;
  }
  
  *createMessageGen(message) {
    let clock = 0;

    while (true) {
      const noteLength = MIDI.CLOCKS_PER_BEAT / (GlobalScheduler.timeSignature.lower / 4);
      const barLength = noteLength * GlobalScheduler.timeSignature.upper;

      const simple = GlobalScheduler.timeSignature.upper === 2 || GlobalScheduler.timeSignature.upper === 3 || GlobalScheduler.timeSignature.upper === 4;
      const compound = !simple && GlobalScheduler.timeSignature.upper % 3 === 0;
      const odd = !simple && !compound;

      let beatLength = null;
      if (compound) {
        beatLength = noteLength * 3;
      }

      let emphasis = [];
      if (odd) {
        GlobalScheduler.timeSignature?.emphasis.forEach((len, i) => {
          let last = 0;
          if (i !== 0) {
            last = emphasis[i-1];
          }
          emphasis.push(last + len * noteLength);
        });
      }

      yield new Set([Metronome.Bell]);
      
      clock++;

      while (clock < barLength) {
        if (clock % noteLength === 0) {
          let note = Metronome.Click;
          if (compound && clock % beatLength === 0) {
            note = Metronome.Emphasis;
          } else if (odd && emphasis.includes(clock)) {
            note = Metronome.Emphasis;
          }
          yield new Set([note])
        } else {
          yield new Set();
        }

        clock++;
      }

      clock = 0;
    }
  }

}