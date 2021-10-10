import {WBHB_STUDIO, RACK} from './namespace.mjs';
import {MainOut} from '../lib/instrument/MainOut.mjs';
import {DrumKit} from '../lib/instrument/DrumKit.mjs';
import {Prompts} from '../lib/instrument/Prompts.mjs';
import {SynthInstrument as Synth} from '../lib/instrument/SynthInstrument.mjs';
import {Hammond} from '../lib/instrument/Hammond.mjs';
import {UserMedia} from '../lib/rack/UserMedia.mjs';
import {Recorder} from '../lib/rack/recorder.mjs';
import {Playback} from '../lib/rack/playback.mjs';
import {Alesis_V25} from '../lib/rack/Alesis_V25.mjs';
import {Octaver} from '../lib/rack/Octaver.mjs';
import {Arpeggiator} from '../lib/rack/Arpeggiator.mjs';
import {WBHBRackItem} from '../lib/ui/wbhb-rack-item.mjs';

const rack = globalThis[WBHB_STUDIO][RACK];

const rackItems= [];

const add = (item) => {
  rack.set(item.name, item);
  rackItems.push(item);
};

const kit = await fetch('static/audio/drums/CO/init.json')
  .then(response => response.json())
  .then(DrumKit.create)
  .then((kit) => {kit.midiChannel = 9; return kit})
  .catch('Error creating drumkit');

kit.name = 'Drum Kit: CO';
add(kit);

const metronome = await fetch('static/audio/drums/Metronome/init.json')
  .then(response => response.json())
  .then(DrumKit.create)
  .then((kit) => {kit.midiChannel = -1; return kit})
  .catch('Error creating metronome');

metronome.name = 'Metronome';
add(metronome);

const prompts = await fetch('static/audio/prompts/MT.com/en-us/init.json')
  .then(response => response.json())
  .then(Prompts.create)
  .then((kit) => {kit.midiChannel = -2; return kit})
  .catch('Error creating prompts');
prompts.name = 'Prompts';
add(prompts);

const synth = new Synth();
synth.midiChannel = 0;
add(synth);

const hammond = new Hammond();
hammond.midiChannel = 0;
add(hammond);

const um = new UserMedia();
add(um);
const rec = new Recorder();
add(rec);
const pb = new Playback();
add(pb);

const octaver = new Octaver();
add(octaver);
const arpeg = new Arpeggiator();
add(arpeg);

const mainOut = new MainOut();
add(mainOut);

add(Alesis_V25);

rackItems.forEach((item) => {
  const el = new WBHBRackItem(item);
  if (item.isSource) {
  document.querySelector('#rack #sources').appendChild(el)
  }
  if (item.isTransform) {
  document.querySelector('#rack #transforms').appendChild(el)
  }
  if (item.isDestination) {
  document.querySelector('#rack #destinations').appendChild(el)
  }
});

const canvasEl = document.querySelector('#rack #connections');

canvasEl.connect('Alesis V25', 'MIDI Out', 'Octaver', 'MIDI In');
canvasEl.connect('Alesis V25', 'MIDI Out', 'Arpeggiator', 'MIDI In');
canvasEl.connect('Alesis V25', 'MIDI Out', 'Hammond Organ', 'MIDI In');
canvasEl.connect('Alesis V25', 'MIDI Out', 'Drum Kit: CO', "MIDI In");

canvasEl.connect('Octaver', 'MIDI Out', 'Simple Synth', 'MIDI In');
canvasEl.connect('Arpeggiator', 'MIDI Out', 'Simple Synth', 'MIDI In');

canvasEl.connect('Simple Synth', 'Main Out', 'Main Out', 'Audio In');
canvasEl.connect('Hammond Organ', 'Main Out', 'Main Out', 'Audio In');
canvasEl.connect('Drum Kit: CO', 'Main Out', 'Main Out', 'Audio In');
canvasEl.connect('Metronome', 'Main Out', 'Main Out', 'Audio In');
canvasEl.connect('Prompts', 'Main Out', 'Main Out', 'Audio In');
canvasEl.connect('Playback', 'Main Out', 'Main Out', 'Audio In');

canvasEl.connect('User Media', 'Main Out', 'Recorder', 'Audio In');

canvasEl.connect('Alesis V25', 'Encoder 1', 'Hammond Organ', 'Drawbar 16');
canvasEl.connect('Alesis V25', 'Encoder 2', 'Hammond Organ', 'Drawbar 5 1/3');
canvasEl.connect('Alesis V25', 'Encoder 3', 'Hammond Organ', 'Drawbar 2 2/3');
canvasEl.connect('Alesis V25', 'Encoder 4', 'Hammond Organ', 'Drawbar 2');

canvasEl.connect('Alesis V25', 'Encoder 1', 'Simple Synth', "Attack");
canvasEl.connect('Alesis V25', 'Encoder 2', 'Simple Synth', "Decay");
canvasEl.connect('Alesis V25', 'Encoder 3', 'Simple Synth', "Sustain");
canvasEl.connect('Alesis V25', 'Encoder 4', 'Simple Synth', "Release");
canvasEl.connect('Alesis V25', 'Pitch Wheel', 'Simple Synth', "Detune");

canvasEl.drawConnections();