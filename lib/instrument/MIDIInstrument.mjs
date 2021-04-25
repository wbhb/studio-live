import {MIDI} from '../util/midi.mjs';
import {MIDIItem} from '../sequencer/items/MIDIItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RackItem} from '../rack/RackItem.mjs';

export class MIDIInstrument extends RackItem {
  
  #midiChannel = 0;
  #boundListeners = {};
  
  constructor(config) {
    super(config);
    
    this._bindListeners();
    
    GlobalScheduler.addEventListener('item', this.#boundListeners.midiMessageHandler);
  }
  
  _bindListeners() {
    this.#boundListeners.midiMessageHandler = this.midiMessageHandler.bind(this);
  }
  
  set midiChannel(newVal) {
    if (typeof newVal !== 'number') {
      throw new TypeError("MIDI channel must be a number");
    }
    
    this.#midiChannel = newVal;
  }
  
  get midiChannel() {
    return this.#midiChannel;
  }
  
  get messageHandlers() {
    throw new Error('messageHandlers should be overidden to return a Map');
  }
  
  midiMessageHandler(item) {
    
    if (!(item instanceof MIDIItem)) {
      return;
      // throw new TypeError("Not a MIDI Message");
    }
    
    const message = item.message;
    
    if (!(message instanceof MIDI.Message)) {
      return;
      // throw new TypeError("Not a MIDI Message");
    }
    
    if ((message.method === MIDI.Channel_Voice
        || message.method === MIDI.Channel_Mode)
        && message.channel !== this.midiChannel) {
      
      // message is not intended for this instrument
      // console.info('wrong channel');
      return false;
    }
    
    const handler = this.messageHandlers.get(message.command);
    
    if (!handler) {
      //instrument does not use this command
      // console.info('no handler');
      return;
    }
    
    handler(message, item.timings?.timestamp);
  }
}