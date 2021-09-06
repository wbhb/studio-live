import {MIDI} from '../util/midi.mjs';

export class OneBarSequencer {
  
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
  
  constructor(options) {
    
  }
  
  get tracks() {
    return this.#tracks;
  }
  
  *createMessageGen(message) {
    
    let clock = 0;
    
    while (true) {
      
      const messages = new Set();
      
      this.#tracks.forEach((track, note) => {
        switch(track[clock]) {
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
      
      clock++;
      
      if (clock >= MIDI.CLOCKS_PER_BEAT * 4) {
        return messages;
      }
      
      yield messages;
    }
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