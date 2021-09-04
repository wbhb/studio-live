import {RackItem} from './RackItem.mjs';
import {MIDI} from '../util/midi.mjs';
import {MidiNode} from './MidiNode.mjs';
import {MIDIItem} from '../sequencer/items/MIDIItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class OneBarSequencer extends RackItem {
  
  #clock = 0;
  
  #tracks = new Map([
    // kick
    [36, OneBarSequencer.makeTrack({
      [OneBarSequencer.states.on]: [0, 48]
    })],
    // snare
    [38, OneBarSequencer.makeTrack({
      [OneBarSequencer.states.on]: [24, 72]
    })],
    // hi hat
    [42, OneBarSequencer.makeTrack({
      [OneBarSequencer.states.on]: [0, 12, 24, 36, 48, 60, 72, 84]
    })]
  ]);
  
  constructor() {
    super({
      outputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI Out'
        }
      }
      ],
      enabled: true,
      name: 'One Bar Sequencer'
    });
    
    GlobalScheduler.addEventListener('item', (item) => {
      
      if (!this.enabled) {
        return;
      }
      
      if (!(item instanceof MIDIItem)) {
        return;
        // throw new TypeError("Not a MIDI Message");
      }
      
      const message = item.message;
      
      if (!(message instanceof MIDI.Message)) {
        return;
        // throw new TypeError("Not a MIDI Message");
      }
      
      if (message.command === MIDI.Timing_Clock) {
        
        
        const messages = new Set();
        
        this.#tracks.forEach((track, note) => {
          switch(track[this.#clock]) {
            case OneBarSequencer.states.on:
              messages.add(new MIDI.Message({
                channel: 9,
                method: MIDI.Channel_Voice,
                command: MIDI.Note_On,
                note: note,
                velocity: 127
              }));
              break;
            case OneBarSequencer.states.off:
              messages.add(new MIDI.Message({
                channel: 9,
                method: MIDI.Channel_Voice,
                command: MIDI.Note_Off,
                note: note,
                velocity: 127
              }));
              break;
          }
        });
        
        for (const message of messages.values()) {
          const newEvent = new MIDI.Event(message);
          this.getNamedOutput('MIDI Out').node.send(newEvent);
        }
        
        this.#clock++;
      
        if (this.#clock >= MIDI.CLOCKS_PER_BEAT * 4) {
          this.#clock = 0;
        }
      }
    });
  }
  
  static states = {
    on: MIDI.Note_On,
    off: MIDI.Note_Off,
    blank: Symbol(null)
  };
  
  static makeTrack(options) {
    
    const track = new Array(MIDI.CLOCKS_PER_BEAT * 4);
    track.fill(OneBarSequencer.states.blank);
    
    for (let state in OneBarSequencer.states) {
      state = OneBarSequencer.states[state];
      options[state]?.forEach((i) => {
        track[i] = state;
      });
    }
    
    return track;
  }
}