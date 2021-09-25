import {MIDI} from '../util/midi.mjs';

export class Sequencer extends Map {
  
  #opaque = false;

  get opaque() {
    return this.#opaque;
  }

  set opaque(newValue) {
    this.#opaque = Boolean(newValue);
  }

  *createMessageGen(message) {
    throw new SyntaxError('createMessageGen must be overidden');
  }
}