import {MIDI} from '../util/midi.mjs';

export class MidiNode extends EventTarget {
  
  #connections = new Set();
  
  constructor(options) {
    super(options);
    
    this.addEventListener('midi-message', this.onmessage.bind(this));
  }
  
  connect(destination) {
    if (! (destination instanceof MidiNode)) {
      throw new TypeError('MidiNode must be conencted to another MidiNode');
    }
    this.#connections.add(destination);
    return destination;
  }
  
  disconnect(destination) {
    this.#connections.remove(destination);
  }
  
  send(evt) {
    this.dispatchEvent(evt);
  }
  
  onmessage(evt) {
    this.#connections.forEach((destination) => {
      const e = new MIDI.Event(evt.message);
      destination.dispatchEvent(e);
    });
  }
}

export class MidiContextSourceNode extends MidiNode {
  
  #midiContext;
  
  constructor(options) {
    super(options);
    
    this.#midiContext = options.midiContext ?? new MIDI(options);
    
    this.#midiContext.addEventListener('midi-message', this.onmessage.bind(this));
  }
  
  send() {
    throw new TypeError('Cannot send from MidiContextSourceNode');
  }
}