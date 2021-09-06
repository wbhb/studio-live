import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RackItem} from './RackItem.mjs';
import {MidiNode} from './MidiNode.mjs';
import {MIDIItem} from '../sequencer/items/MIDIItem.mjs';
import {MIDI} from '../util/midi.mjs';

export class Sequencer extends RackItem {
  
  #messageGen = null;
  
  #sequencer = null;
  
  #boundListeners = {};
  
  constructor(options) {
    super({
      inputs: [],
      outputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI Out'
        }
      }
      ],
      enabled: true,
      name: 'Sequencer'
    });
    
    this.bindListeners();
    
    GlobalScheduler.addEventListener('item', this.#boundListeners.handleItem);
  }
  
  bindListeners() {
    this.#boundListeners.handleItem = this.#handleItem.bind(this);
  }
  
  #handleItem(item) {
    
    if (!this.#messageGen) {
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
      
      if (!this.#messageGen) {
        return;
      }
      
      const {value: messages, done} = this.#messageGen.next();
      
      if (messages) {
        for (const message of messages.values()) {
          const newEvent = new MIDI.Event(message);
          this.getNamedOutput('MIDI Out').node.send(newEvent);
        }
      }
      
      if (done) {
        this.#messageGen = null;
      }
    }
  }
  
  get sequencer() {
    return this.#sequencer;
  }
  
  set sequencer(newVal) {
    this.#sequencer = newVal;
    this.#messageGen = this.sequencer.createMessageGen();
  }
}