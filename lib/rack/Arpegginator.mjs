import {RackItem} from './RackItem.mjs';
import {MIDI} from '../util/midi.mjs';
import {MIDIRemap} from '../util/midiRemap.mjs';
import {MidiNode} from './MidiNode.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

const octaverRemap = [
  {
    "tests": [
      {
        "inputParam": "method",
        "testMode": "=",
        "testValue": MIDI.Channel_Voice
      }
    ],
    "map": {
      "mapMode": "-",
      "mapValue": 12,
      "outputParam": "note"
    }
  }
];

export class Arpeggiator extends RackItem {
  
  #remap;
  
  #rootNote;
  #currentStep = 0;
  
  #pattern = [0, 4, 7, 12, 16, 19, 24];
  
  constructor() {
    super({
      inputs: [{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'MIDI In'
        }
      },{
        node: new MidiNode(),
        config: {
          type: 'MIDI',
          name: 'Clock In'
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
    
    this.#remap = new MIDIRemap(octaverRemap);
    
    this.getNamedInput('MIDI In').node.addEventListener('midi-message', (evt) => {
      if (this.enabled) {
        const transformedMessage = this.#remap.remap(evt.message);
        this.getNamedOutput('MIDI Out').node.send(new MIDI.Event(transformedMessage));
        const doubleTransformedMessage = this.#remap.remap(transformedMessage);
        this.getNamedOutput('MIDI Out').node.send(new MIDI.Event(doubleTransformedMessage));
      }
      
      this.getNamedOutput('MIDI Out').node.send(new MIDI.Event(evt.message));
    });
  }
}