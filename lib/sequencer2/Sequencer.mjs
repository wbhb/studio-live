import {MIDI} from '../util/midi.mjs';

export class Sequencer extends Map {
  
  *createMessageGen(message) {
    throw new SyntaxError('createMessageGen must be overidden');
  }
}