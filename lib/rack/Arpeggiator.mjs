import {RackItem} from './RackItem.mjs';
import {MIDI} from '../util/midi.mjs';
import {MidiNode} from './MidiNode.mjs';
import {MIDIItem} from '../sequencer/items/MIDIItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Arpeggiator extends RackItem {
  
  #remap;
  
  #messageGens = new Map();
  
  noteLength = 5;//new Length(12, Length.units.midi);
  stepLength = 6;//new Length(12, Length.units.midi);
  
  pattern = [0, 4, 7, 12, 16, 19, 23, 24];
  
  constructor() {
    super({
      inputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI In'
        }
      }],
      outputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI Out'
        }
      }
      ],
      enabled: true,
      name: 'Arpeggiator'
    });
    
    this.getNamedInput('MIDI In').node.addEventListener('midi-message', (evt) => {
      if (this.enabled) {
        if (evt.message.command === MIDI.Note_On) {
          this.#messageGens.set(evt.message.note, this.messageGen(evt.message));
          
        }
        if (evt.message.command === MIDI.Note_Off && this.#messageGens.has(evt.message.note)) {
          
          const messages = this.#messageGens.get(evt.message.note).next({stop: true}).value;
          
          for (const message of messages.values()) {
            const newEvent = new MIDI.Event(message);
            this.getNamedOutput('MIDI Out').node.send(newEvent);
          }
          
          this.#messageGens.delete(evt.message.note);
        }
      } else {
        this.getNamedOutput('MIDI Out').node.send(new MIDI.Event(evt.message));
      }
    });
    
    GlobalScheduler.addEventListener('item', (item) => {
      
      if (!this.playing) {
        return;
      }
      
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
        
        for (const gen of this.#messageGens.values()) {
          
          const {value: messages} = gen.next();
          
          for (const message of messages.values()) {
            const newEvent = new MIDI.Event(message);
            this.getNamedOutput('MIDI Out').node.send(newEvent);
          }
        }
      }
    });
  }
  
  get playing() {
    return this.#messageGens.size > 0;
  }
  
  *messageGen(message) {
    let currentStep = null;
    let clock = 0;
    
    while (true) {
      
      const messages = new Set();
      
      if (clock % this.stepLength === this.noteLength && currentStep !== null) {
        messages.add(new MIDI.Message({
          ...message,
          ...{
            status: undefined,
            data: undefined,
            command: MIDI.Note_Off,
            note: message.note + this.pattern[currentStep]
          }
        }));
      }
      
      if (clock % this.stepLength === 0) {
        
        if (currentStep === null) {
          currentStep = 0;
        } else {
          currentStep++;
          if (currentStep >= this.pattern.length) {
            currentStep = 0;
          }
        }
        
        messages.add(new MIDI.Message({
          ...message,
          ...{
            status: undefined,
            data: undefined,
            note: message.note + this.pattern[currentStep]
          }
        }));
        
      }
      
      let control = yield messages;
      
      if (control?.stop) {
        messages.clear();
        messages.add(new MIDI.Message({
          ...message,
          ...{
            status: undefined,
            data: undefined,
            command: MIDI.Note_Off,
            note: message.note + this.pattern[currentStep]
          }
        }));
        return messages;
      }
      
      clock++;
    }
  }
}