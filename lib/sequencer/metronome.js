import {Sequencer} from "./sequencer.js";
import {MIDIItem} from './items/MIDIItem.js';
import {Length} from '../util/length.js';
import {MIDI} from '../util/midi.js';
import {DrumKit} from '../instrument/DrumKit.js';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

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
  }
  
  async _getBeats() {
    let beats = [];
    
    for (let i = 0; i < GlobalScheduler.timeSignature.upper; i++) {
      let beat = new MIDIItem();
      beat.timings.offset = new Length(i, Length.units.beat);
      beat.timings.length = new Length(1, Length.units.beat);
      
      if (i == 0) {
        beat.message = Metronome.Bell;
      } else if (GlobalScheduler.timeSignature.upper % 3 == 0 && (i - 1) % 3 == 0) {
        beat.message = Metronome.Emphasis;
      } else {
        beat.message = Metronome.Click;
      }
      
      beats.push(beat);
    }
    
    return beats;
  }
  
  async _nextBar() {
    let beats = await this._getBeats();
    GlobalScheduler.scheduleItems(beats);
  }

}