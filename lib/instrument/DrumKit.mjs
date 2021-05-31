import {SampleInstrument, Voice} from './SampleInstrument.mjs';
import {Scheduler} from '../scheduler/scheduler.mjs';

const urlRoot = document.location.href.substring(0, document.location.href.lastIndexOf('/'));

export class DrumKit extends SampleInstrument {
  
  constructor(config) {
    super({mode: SampleInstrument.MODES.Trigger, ...config});
  }
  
  get drums() {
    return DrumKit.drums.filter((el) => {
      for (let voice in this.voices) {
        if (el.note === parseInt(voice, 10)) {
          return true;
        }
      }
    });
  }
  
  static getNoteNumber(name) {
    return DrumKit.drums.find((el) => {
      return el.name === name;
    })?.note;
  }
  
  static create(plain) {
    const init = typeof plain === 'string' ? JSON.parse(plain) : plain;
    
    const voices = {};
    
    init.samples.forEach((drum) => {
      voices[DrumKit.getNoteNumber(drum.name)] = new Voice(new URL(`${urlRoot}/static/audio/drums/${init.shortName}/${drum.file}`));
    });
    
    return new DrumKit({init, voices});
  }
  
  static drums = [
    {
      note: 28,
      name: "Slap",
      GM2: true
    },
    {
      note: 29,
      name: "Scratch Push",
      GM2: true
    },
    {
      note: 30,
      name: "Scratch Pull",
      GM2: true
    },
    {
      note: 31,
      name: "Sticks",
      GM2: true
    },
    {
      note: 32,
      name: "Square Click",
      GM2: true
    },
    {
      note: 33,
      name: "Metronome Click",
      GM2: true
    },
    {
      note: 34,
      name: "Metronome Bell",
      GM2: true
    },
    {
      note: 35,
      name: "Bass Drum 2",
      GM2: false
    },
    {
      note: 36,
      name: "Bass Drum 1",
      GM2: false
    },
    {
      note: 37,
      name: "Side Stick",
      GM2: false
    },
    {
      note: 38,
      name: "Snare Drum 1",
      GM2: false
    },
    {
      note: 39,
      name: "Hand Clap",
      GM2: false
    },
    {
      note: 40,
      name: "Snare Drum 2",
      GM2: false
    },
    {
      note: 41,
      name: "Low Tom 2",
      GM2: false
    },
    {
      note: 42,
      name: "Closed Hi-hat",
      GM2: false
    },
    {
      note: 43,
      name: "Low Tom 1",
      GM2: false
    },
    {
      note: 44,
      name: "Pedal Hi-hat",
      GM2: false
    },
    {
      note: 45,
      name: "Mid Tom 2",
      GM2: false
    },
    {
      note: 46,
      name: "Open Hi-hat",
      GM2: false
    },
    {
      note: 47,
      name: "Mid Tom 1",
      GM2: false
    },
    {
      note: 48,
      name: "High Tom 2",
      GM2: false
    },
    {
      note: 49,
      name: "Crash Cymbal 1",
      GM2: false
    },
    {
      note: 50,
      name: "High Tom 1",
      GM2: false
    },
    {
      note: 51,
      name: "Ride Cymbal 1",
      GM2: false
    },
    {
      note: 52,
      name: "Chinese Cymbal",
      GM2: false
    },
    {
      note: 53,
      name: "Ride Bell",
      GM2: false
    },
    {
      note: 54,
      name: "Tambourine",
      GM2: false
    },
    {
      note: 55,
      name: "Splash Cymbal",
      GM2: false
    },
    {
      note: 56,
      name: "Cowbell",
      GM2: false
    },
    {
      note: 57,
      name: "Crash Cymbal 2",
      GM2: false
    },
    {
      note: 58,
      name: "Vibra Slap",
      GM2: false
    },
    {
      note: 59,
      name: "Ride Cymbal 2",
      GM2: false
    },
    {
      note: 60,
      name: "High Bongo",
      GM2: false
    },
    {
      note: 61,
      name: "Low Bongo",
      GM2: false
    },
    {
      note: 62,
      name: "Mute High Conga",
      GM2: false
    },
    {
      note: 63,
      name: "Open High Conga",
      GM2: false
    },
    {
      note: 64,
      name: "Low Conga",
      GM2: false
    },
    {
      note: 65,
      name: "High Timbale",
      GM2: false
    },
    {
      note: 66,
      name: "Low Timbale",
      GM2: false
    },
    {
      note: 67,
      name: "High Agogo",
      GM2: false
    },
    {
      note: 68,
      name: "Low Agogo",
      GM2: false
    },
    {
      note: 69,
      name: "Cabasa",
      GM2: false
    },
    {
      note: 70,
      name: "Maracas",
      GM2: false
    },
    {
      note: 71,
      name: "Short Whistle",
      GM2: false
    },
    {
      note: 72,
      name: "Long Whistle",
      GM2: false
    },
    {
      note: 73,
      name: "Short Guiro",
      GM2: false
    },
    {
      note: 74,
      name: "Long Guiro",
      GM2: false
    },
    {
      note: 75,
      name: "Claves",
      GM2: false
    },
    {
      note: 76,
      name: "High Wood Block",
      GM2: false
    },
    {
      note: 77,
      name: "Low Wood Block",
      GM2: false
    },
    {
      note: 78,
      name: "Mute Cuica",
      GM2: false
    },
    {
      note: 79,
      name: "Open Cuica",
      GM2: false
    },
    {
      note: 80,
      name: "Mute Triangle",
      GM2: false
    },
    {
      note: 81,
      name: "Open Triangle",
      GM2: false
    },
    {
      note: 82,
      name: "Shaker",
      GM2: true
    },
    {
      note: 83,
      name: "Jingle Bell",
      GM2: true
    },
    {
      note: 84,
      name: "Belltree",
      GM2: true
    },
    {
      note: 85,
      name: "Castanets",
      GM2: true
    },
    {
      note: 86,
      name: "Mute Surdo",
      GM2: true
    },
    {
      note: 87,
      name: "Open Surdo",
      GM2: true
    }
  ];
}