import {WBHB_STUDIO, RACK} from './namespace.mjs';
import {Scheduler, CONTROL_CODES as SCHEDULER_CONTROL_CODES} from '../lib/scheduler/scheduler.mjs';
import {ItemDB} from '../lib/sequencer/items/ItemDB.mjs';
import {ControlItem} from '../lib/sequencer/items/ControlItem.mjs';
import {PromptItem} from '../lib/sequencer/items/PromptItem.mjs';
import {CachedAudioItem} from '../lib/sequencer/items/CachedAudioItem.mjs';
import {ChordItem} from '../lib/sequencer/items/ChordItem.mjs';
import {MIDIItem} from '../lib/sequencer/items/MIDIItem.mjs';
import {TimeSignature} from '../lib/util/timeSignature.mjs';
import {Chord} from '../lib/util/chords.mjs';
import {MIDI} from '../lib/util/midi.mjs';
import {DrumKit} from '../lib/instrument/DrumKit.mjs';
import {WBHBButton} from '../lib/ui/wbhb-button.mjs';

(async () => {
  const kit = await globalThis[WBHB_STUDIO][RACK].get('Drum Kit: CO');

  const kitEl = new WBHBButton();
  kitEl.type = "Drum Kit";
  kitEl.name = kit.name;

  kit.drums.forEach(async (drum) => {
    const drumEl = new WBHBButton();
    drumEl.type = "Hit";
    drumEl.name = drum.name;
    drumEl.setAttribute('draggable','true');
    
    const itemId = await ItemDB.set(new MIDIItem({
      message: {
        note: DrumKit.getNoteNumber(drum.name),
        channel: 9,
        method: MIDI.Channel_Voice,
        command: MIDI.Note_On,
        velocity: 127
      }
    }));
    
    drumEl.itemId = itemId;
    
    kitEl.appendChild(drumEl);
  });

  document.querySelector('wbhb-button[name="Drums"]').appendChild(kitEl);
})();

document.querySelector('wbhb-button[name="Start"]').addEventListener('click', () => {
  
  if (Scheduler.GLOBAL.audioContext.state === 'suspended') {
    Scheduler.GLOBAL.audioContext.resume();
  }
  
  Scheduler.GLOBAL.start();
});

document.querySelector('wbhb-button[name="Stop"]').addEventListener('click', () => {
  let stop = new ControlItem({timings: {immediate: true}, controlCode: SCHEDULER_CONTROL_CODES.STOP});
  Scheduler.GLOBAL.scheduleItem(stop);
});

(async () => {
  const rec = await globalThis[WBHB_STUDIO][RACK].get('Recorder');

  document.querySelector('wbhb-button[name="Start"]').addEventListener('click', () => {
    rec.start();
  });

  document.querySelector('wbhb-button[name="Stop"]').addEventListener('click', () => {
    rec.stop();
  });

  document.querySelector('wbhb-button[name="Save"]').addEventListener('click', async () => {
    
    rec.handle = await showSaveFilePicker({
      types: [{
        description: 'Audio',
        accept: {'audio/x-wbhb-basic': ['.wbhbabasic']},
      }],
      excludeAcceptAllOption: true,
      multiple: false
    });
  });
})();

(async () => {
  const pb = await globalThis[WBHB_STUDIO][RACK].get('Playback');
  
  document.querySelector('wbhb-button[name="Start"]').addEventListener('click', () => {
    pb.start();
  });

  document.querySelector('wbhb-button[name="Stop"]').addEventListener('click', () => {
    pb.stop();
  });

  document.querySelector('wbhb-button[name="Load"]').addEventListener('click', async () => {
    
    [pb.handle] = await showOpenFilePicker({
      types: [{
        description: 'Audio',
        accept: {'audio/x-wbhb-basic': ['.wbhbabasic']},
      }],
      excludeAcceptAllOption: true,
      multiple: false
    });
  });
})();

document.querySelector('wbhb-adjust-tempo').tempo.addEventListener('change', (e) => {
  let item = new ControlItem({timings: {immediate: true}, controlCode: SCHEDULER_CONTROL_CODES.TEMPO});
  item.payload = document.querySelector('wbhb-adjust-tempo').tempo;
  Scheduler.GLOBAL.scheduleItem(item);
});

document.querySelectorAll('wbhb-button[type="Time"]').forEach((node) => {
  const parts = node.getAttribute('name').split('/');
  const upper = Number.parseInt(parts[0], 10);
  const lower = Number.parseInt(parts[1], 10);
  if (upper && lower) {
    node.addEventListener('click', () => {
      let item = new ControlItem({timings: {immediate: true}, controlCode: SCHEDULER_CONTROL_CODES.TIME_SIGNATURE});
      item.payload = new TimeSignature(upper, lower);
      Scheduler.GLOBAL.dispatchEvent(item);
    });
  }
});

document.querySelectorAll('wbhb-button[name="Chords"] wbhb-button:not([type="More"]):not([type="Modifier"])').forEach((node) => {
  const name = node.getAttribute('name');
  const type = node.getAttribute('type');
  
  let item = new ChordItem({timings: {length: {unit: 'beat', value: 1}}});
  let chord = new Chord(name);
  chord = chord.setQuality(type);
  item.chord = chord;
  node.item = item;
  
  node.addEventListener('click', () => {
    let item = new ChordItem({...node.item, ...{timings: {immediate: true}}});
    Scheduler.GLOBAL.dispatchEvent(item);
  });
});

// document.querySelectorAll('wbhb-button[type="Prompt"]').forEach((node) => {
//   const name = node.getAttribute('name');
//   const type = node.getAttribute('type');
  
//   let item = new PromptItem({timings: {length: {unit: 'beat', value: 1}}});
//   node.item = item;
  
//   node.addEventListener('click', () => {
//     let item = new PromptItem({...node.item, ...{timings: {immediate: true}}});
//     Scheduler.GLOBAL.dispatchEvent(item);
//   });
// });