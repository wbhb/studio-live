import {SampleInstrument, Voice} from './SampleInstrument.mjs';
import {Scheduler} from '../scheduler/scheduler.mjs';

const urlRoot = document.location.href.substring(0, document.location.href.lastIndexOf('/'));

export class Prompts extends SampleInstrument {
  
  constructor(config) {
    super({mode: SampleInstrument.MODES.Trigger, ...config});
  }
  
  get prompts() {
    Prompts.prompts.filter((el) => {
      for (let voice in this.voices) {
        if (el.note === voice) {
          return true;
        }
      }
    });
  }
  
  static getNoteNumber(name) {
    return Prompts.prompts.find((el) => {
      return el.name === name;
    })?.note;
  }
  
  static create(plain) {
    const init = typeof plain === 'string' ? JSON.parse(plain) : plain;
    
    const voices = {};
    
    init.samples.forEach((prompt) => {
      voices[Prompts.getNoteNumber(prompt.name)] = new Voice(new URL(`${urlRoot}/static/audio/prompts/${init.shortName}/${init.locale}/${prompt.file}`));
    });
    
    return new Prompts({init, voices});
  }
  
  static prompts = [
    {
      note: 1,
      name: "1",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 2,
      name: "2",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 3,
      name: "3",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 4,
      name: "4",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 5,
      name: "5",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 6,
      name: "6",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 7,
      name: "7",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 8,
      name: "8",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 9,
      name: "9",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 10,
      name: "10",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 11,
      name: "11",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 12,
      name: "12",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 13,
      name: "13",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 14,
      name: "14",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 15,
      name: "15",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 16,
      name: "16",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 17,
      name: "17",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 18,
      name: "18",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 19,
      name: "19",
      keywords: [
        "count",
        "number"
      ]
    },
    {
      note: 20,
      name: "Verse",
      keywords: [
        "section",
        "verse"
      ]
    },
    {
      note: 21,
      name: "Verse 1",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 22,
      name: "Verse 2",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 23,
      name: "Verse 3",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 24,
      name: "Verse 4",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 25,
      name: "Verse 5",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 26,
      name: "Verse 6",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 27,
      name: "Verse 7",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 28,
      name: "Verse 8",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 29,
      name: "Verse 9",
      keywords: [
        "section",
        "verse",
        "number"
      ]
    },
    {
      note: 30,
      name: "Chorus",
      keywords: [
        "section",
        "chorus"
      ]
    },
    {
      note: 31,
      name: "Chorus 1",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 32,
      name: "Chorus 2",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 33,
      name: "Chorus 3",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 34,
      name: "Chorus 4",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 35,
      name: "Chorus 5",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 36,
      name: "Chorus 6",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 37,
      name: "Chorus 7",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 38,
      name: "Chorus 8",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 39,
      name: "Chorus 9",
      keywords: [
        "section",
        "chorus",
        "number"
      ]
    },
    {
      note: 40,
      name: "Bridge",
      keywords: [
        "section",
        "bridge"
      ]
    },
    {
      note: 41,
      name: "Bridge 1",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 42,
      name: "Bridge 2",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 43,
      name: "Bridge 3",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 44,
      name: "Bridge 4",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 45,
      name: "Bridge 5",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 46,
      name: "Bridge 6",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 47,
      name: "Bridge 7",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 48,
      name: "Bridge 8",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 49,
      name: "Bridge 9",
      keywords: [
        "section",
        "bridge",
        "number"
      ]
    },
    {
      note: 50,
      name: "Pre Chorus",
      keywords: [
        "section",
        "pre chorus"
      ]
    },
    {
      note: 51,
      name: "Pre Chorus 1",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 52,
      name: "Pre Chorus 2",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 53,
      name: "Pre Chorus 3",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 54,
      name: "Pre Chorus 4",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 55,
      name: "Pre Chorus 5",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 56,
      name: "Pre Chorus 6",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 57,
      name: "Pre Chorus 7",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 58,
      name: "Pre Chorus 8",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 59,
      name: "Pre Chorus 9",
      keywords: [
        "section",
        "pre chorus",
        "number"
      ]
    },
    {
      note: 60,
      name: "Breakdown",
      keywords: [
        "section"
      ]
    },
    {
      note: 61,
      name: "Ending",
      keywords: [
        "section"
      ]
    },
    {
      note: 62,
      name: "Exhortation",
      keywords: [
        "section"
      ]
    },
    {
      note: 63,
      name: "Instrumental",
      keywords: [
        "section"
      ]
    },
    {
      note: 64,
      name: "Interlude",
      keywords: [
        "section"
      ]
    },
    {
      note: 65,
      name: "Intro",
      keywords: [
        "section"
      ]
    },
    {
      note: 66,
      name: "Outro",
      keywords: [
        "section"
      ]
    },
    {
      note: 67,
      name: "Post Chorus",
      keywords: [
        "section"
      ]
    },
    {
      note: 68,
      name: "Rap",
      keywords: [
        "section"
      ]
    },
    {
      note: 69,
      name: "Refrain",
      keywords: [
        "section"
      ]
    },
    {
      note: 70,
      name: "Solo",
      keywords: [
        "section"
      ]
    },
    {
      note: 71,
      name: "Tag",
      keywords: [
        "section"
      ]
    },
    {
      note: 72,
      name: "Turnaround",
      keywords: [
        "section"
      ]
    },
    {
      note: 73,
      name: "Vamp",
      keywords: [
        "section"
      ]
    },
    {
      note: 80,
      name: "All In",
      keywords: [
        "instruction",
        "in"
      ]
    },
    {
      note: 81,
      name: "Drums In",
      keywords: [
        "instruction",
        "in",
        "instrument"
      ]
    },
    {
      note: 91,
      name: "Bass",
      keywords: [
        "instruction",
        "instrument"
      ]
    },
    {
      note: 92,
      name: "Drums",
      keywords: [
        "instruction",
        "instrument"
      ]
    },
    {
      note: 93,
      name: "Keys",
      keywords: [
        "instruction",
        "instrument"
      ]
    },
    {
      note: 100,
      name: "Key Change",
      keywords: [
        "instruction",
        "key change"
      ]
    },
    {
      note: 101,
      name: "Key Change Up",
      keywords: [
        "instruction",
        "key change"
      ]
    },
    {
      note: 102,
      name: "Key Change Down",
      keywords: [
        "instruction",
        "key change"
      ]
    },
    {
      note: 111,
      name: "Acapella",
      keywords: [
        "instruction"
      ]
    },
    {
      note: 112,
      name: "Ad Lib",
      keywords: [
        "instruction"
      ]
    },
    {
      note: 113,
      name: "Big Ending",
      keywords: [
        "instruction",
        "dynamics"
      ]
    },
    {
      note: 114,
      name: "Break",
      keywords: [
        "instruction"
      ]
    },
    {
      note: 115,
      name: "Build",
      keywords: [
        "instruction",
        "dynamics"
      ]
    },
    {
      note: 116,
      name: "Hits",
      keywords: [
        "instruction"
      ]
    },
    {
      note: 117,
      name: "Hold",
      keywords: [
        "instruction"
      ]
    },
    {
      note: 118,
      name: "Last Time",
      keywords: [
        "instruction"
      ]
    },
    {
      note: 119,
      name: "Slowly Build",
      keywords: [
        "instruction",
        "dynamics"
      ]
    },
    {
      note: 120,
      name: "Softly",
      keywords: [
        "instruction",
        "dynamics"
      ]
    },
    {
      note: 121,
      name: "Swell",
      keywords: [
        "instruction",
        "dynamics"
      ]
    },
    {
      note: 122,
      name: "Worship Freely",
      keywords: [
        "instruction"
      ]
    },
  ];
}