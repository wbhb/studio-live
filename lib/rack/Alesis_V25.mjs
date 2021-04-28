import {RackItem} from './RackItem.mjs';
import {MIDI} from '../util/midi.mjs';
import {DrumKit} from '../instrument/DrumKit.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

const v25DrumRemap = [
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

const controlChangeNodes = new Map([
  [
    'Encoder 1',
    GlobalScheduler.audioContext.createConstantSource()
  ],
  [
    'Encoder 2',
    GlobalScheduler.audioContext.createConstantSource()
  ],
  [
    'Encoder 3',
    GlobalScheduler.audioContext.createConstantSource()
  ],
  [
    'Encoder 4',
    GlobalScheduler.audioContext.createConstantSource()
  ],
  [
    'Pitch Wheel',
    GlobalScheduler.audioContext.createConstantSource()
  ],
  [
    'Mod Wheel',
    GlobalScheduler.audioContext.createConstantSource()
  ]
]);

controlChangeNodes.forEach((node) => {
  node.start();
});

const controlChangeRemap = [
  {
    "tests": [
      {
        "inputParam": "command",
        "testMode": "=",
        "testValue": MIDI.Control_Change
      },
      {
        "inputParam": "controllerNumber",
        "testMode": "=",
        "testValue": 20
      }
    ],
    "map": {
      "mapMode": "f",
      "mapValue": (val) => {
        controlChangeNodes.get('Encoder 1').offset.value = val != 0 ? val / 127.0 : 0;
      },
      "outputParam": "value"
    }
  },
  {
    "tests": [
      {
        "inputParam": "command",
        "testMode": "=",
        "testValue": MIDI.Control_Change
      },
      {
        "inputParam": "controllerNumber",
        "testMode": "=",
        "testValue": 21
      }
    ],
    "map": {
      "mapMode": "f",
      "mapValue": (val) => {
        controlChangeNodes.get('Encoder 2').offset.value = val / 127.0;
      },
      "outputParam": "value"
    }
  },
  {
    "tests": [
      {
        "inputParam": "command",
        "testMode": "=",
        "testValue": MIDI.Control_Change
      },
      {
        "inputParam": "controllerNumber",
        "testMode": "=",
        "testValue": 22
      }
    ],
    "map": {
      "mapMode": "f",
      "mapValue": (val) => {
        controlChangeNodes.get('Encoder 3').offset.value = val / 127.0;
      },
      "outputParam": "value"
    }
  },
  {
    "tests": [
      {
        "inputParam": "command",
        "testMode": "=",
        "testValue": MIDI.Control_Change
      },
      {
        "inputParam": "controllerNumber",
        "testMode": "=",
        "testValue": 23
      }
    ],
    "map": {
      "mapMode": "f",
      "mapValue": (val) => {
        controlChangeNodes.get('Encoder 4').offset.value = val / 127.0;
      },
      "outputParam": "value"
    }
  },
  {
    "tests": [
      {
        "inputParam": "command",
        "testMode": "=",
        "testValue": MIDI.Control_Change
      },
      {
        "inputParam": "controllerNumber",
        "testMode": "=",
        "testValue": 1
      }
    ],
    "map": {
      "mapMode": "f",
      "mapValue": (val) => {
        controlChangeNodes.get('Mod Wheel').offset.value = val / 127.0;
      },
      "outputParam": "value"
    }
  },
  {
    "tests": [
      {
        "inputParam": "command",
        "testMode": "=",
        "testValue": MIDI.Pitch_Bend_Change
      }
    ],
    "map": {
      "mapMode": "f",
      "mapValue": (val) => {
        controlChangeNodes.get('Pitch Wheel').offset.value = val / 40.0;
      },
      "outputParam": "value"
    }
  }
];

const midiContext = new MIDI({
  outputs: {
    filter: {
      name: "V25 MIDI 1"
    }
  },
  remap: [
    ...v25DrumRemap,
    ...controlChangeRemap
  ]
});

export const Alesis_V25 = new RackItem({
  outputs: [{
    node: midiContext,
    config: {
      type: 'MIDI',
      name: 'MIDI Out'
    }
  }, {
    node: controlChangeNodes.get('Encoder 1'),
    config: {
      type: 'AudioParam',
      name: 'Encoder 1'
    }
  }, {
    node: controlChangeNodes.get('Encoder 2'),
    config: {
      type: 'AudioParam',
      name: 'Encoder 2'
    }
  }, {
    node: controlChangeNodes.get('Encoder 3'),
    config: {
      type: 'AudioParam',
      name: 'Encoder 3'
    }
  }, {
    node: controlChangeNodes.get('Encoder 4'),
    config: {
      type: 'AudioParam',
      name: 'Encoder 4'
    }
  }, {
    node: controlChangeNodes.get('Mod Wheel'),
    config: {
      type: 'AudioParam',
      name: 'Mod Wheel'
    }
  }, {
    node: controlChangeNodes.get('Pitch Wheel'),
    config: {
      type: 'AudioParam',
      name: 'Pitch Wheel'
    }
  }
  ],
  enabled: true,
  name: 'Alesis V25'
});