import {RackItem} from './RackItem.mjs';
import {MIDI} from '../util/midi.mjs';
import {DrumKit} from '../instrument/DrumKit.mjs';

const v25DefaultRemap = [
  {
    "tests": [
      {
        "inputParam": "channel",
        "testMode": "=",
        "testValue": 9
      },
      {
        "inputParam": "method",
        "testMode": "=",
        "testValue": MIDI.Channel_Voice
      },
      {
        "inputParam": "note",
        "testMode": "=",
        "testValue": 36
      }
    ],
    "map": {
      "mapMode": "=",
      "mapValue": DrumKit.getNoteNumber('Closed Hi-hat'),
      "outputParam": "note"
    }
  },
  {
    "tests": [
      {
        "inputParam": "channel",
        "testMode": "=",
        "testValue": 9
      },
      {
        "inputParam": "method",
        "testMode": "=",
        "testValue": MIDI.Channel_Voice
      },
      {
        "inputParam": "note",
        "testMode": "=",
        "testValue": 37
      }
    ],
    "map": {
      "mapMode": "=",
      "mapValue": DrumKit.getNoteNumber('Bass Drum 1'),
      "outputParam": "note"
    }
  },
  {
    "tests": [
      {
        "inputParam": "channel",
        "testMode": "=",
        "testValue": 9
      },
      {
        "inputParam": "method",
        "testMode": "=",
        "testValue": MIDI.Channel_Voice
      },
      {
        "inputParam": "note",
        "testMode": "=",
        "testValue": 38
      }
    ],
    "map": {
      "mapMode": "=",
      "mapValue": DrumKit.getNoteNumber('Snare Drum 1'),
      "outputParam": "note"
    }
  },
  {
    "tests": [
      {
        "inputParam": "channel",
        "testMode": "=",
        "testValue": 9
      },
      {
        "inputParam": "method",
        "testMode": "=",
        "testValue": MIDI.Channel_Voice
      },
      {
        "inputParam": "note",
        "testMode": "=",
        "testValue": 39
      }
    ],
    "map": {
      "mapMode": "=",
      "mapValue": DrumKit.getNoteNumber('Low Tom 1'),
      "outputParam": "note"
    }
  }
];

export const Alesis_V25 = new RackItem({
  outputs: [{
    node: new MIDI({
      outputs: {
        filter: {
          name: "V25 MIDI 1"
        }
      },
      remap: v25DefaultRemap
    }),
    config: {
      type: 'MIDI',
      name: 'MIDI Out'
    }
  }
  ],
  enabled: true,
  name: 'Alesis V25'
});