const SHARP = '\u266F';
const FLAT = '\u266D';
const PREFERRED = 'preferred';

export class Chord extends EventTarget {
  
  #displayMode = PREFERRED;
  #key = 10; //default to G
  #semitone;
  #quality = "";
  #slash;
  
  constructor(interval) {
    super();
    this.#semitone = Chord.intervalToSemitone(interval);
  }
  
  setDisplayMode(newValue) {
    this.displaymode = displayMode;
    return this;
  }
  
  set displayMode(newValue) {
    this.#displayMode = newValue;
  }
  
  get displayMode() {
    return this.#displayMode;
  }
  
  setKey(note) {
    const semitone = Chord.noteToSemitone(note);
    this.key = semitone;
    return this;
  }
  
  set key(semitone) {
    if (typeof semitone !== 'number') {
      throw new Error(`Semitone "${semitone}" is not a number`);
    }
    this.#key = semitone;
  }
  
  get key() {
    return this.#key;
  }
  
  setQuality(quality) {
    this.quality = quality;
    return this;
  }
  
  set quality(newValue) {
    if (!symbols.has(newValue)) {
      console.warn(`Quality "${newValue}" not understood`);
    }
    this.#quality = newValue;
  }
  
  get quality() {
    return this.#quality;
  }
  
  setSlash(interval) {
    const semitone = Chord.intervalToSemitone(interval);
    this.slash = semitone;
    return this;
  }
  
  set slash(semitone) {
    if (typeof semitone !== 'number') {
      throw new Error(`Semitone "${semitone}" is not a number`);
    }
    this.#slash = semitone;
  }
  
  get slash() {
    return this.#slash;
  }
  
  toString() {
    let root = Chord.semitoneToNote(this.#semitone, this.key, this.displayMode);
    let quality = this.quality;
    let slash = this.slash;
    if (slash !== undefined) {
      slash = `/${Chord.semitoneToNote(slash, this.key, this.displayMode)}`;
    }
    return `${root}${quality||''}${slash||''}`;
  }
  
  static intervalToSemitone(name) {
    for (let type of intervals.values()) {
      const semitone = type.get(name);
      if (semitone !== undefined) {
        return semitone;
      }
    }
    throw new Error(`Interval "${name}" not understood`);
  }
  
  static noteToSemitone(root) {
    let offset = notes.get(SHARP).indexOf(root);
    if (offset === -1) {
      offset = notes.get(FLAT).indexOf(root);
    }
    if (offset === -1) {
      throw new Error(`Note "${root}" doesn't exist`);
    }
    return offset;
  }
  
  static semitoneToNote(semitone, key, displayMode) {
    if (typeof semitone !== 'number') {
      throw new Error(`Semitone "${semitone}" is not a number`);
    }
    let rootIndex = key;
    let index = (semitone + rootIndex) % 12;
    return notes.get(displayMode)[index];
  }
  
  static get SHARP() {
    return SHARP;
  };
  
  static get FLAT() {
    return FLAT;
  };
  
  static get PREFERRED() {
    return PREFERRED;
  };
}

const intervals = new Map([
  ["byName", new Map([
    [`Root`, 0],
    [`Second`, 2],
    [`Third`, 4],
    [`Forth`, 5],
    [`Fifth`, 7],
    [`Sixth`, 9],
    [`Seventh`, 11],
    [`Octave`, 12]
  ])],
  ["byRomanNumeral", new Map([
    [`I`, 0],
    [`II`, 2],
    [`III`, 4],
    [`IV`, 5],
    [`V`, 7],
    [`VI`, 9],
    [`VII`, 11],
    [`VIII`, 12]
  ])],
  ["byNumeral", new Map([
    [`1`, 0],
    [`2`, 2],
    [`3`, 4],
    [`4`, 5],
    [`5`, 7],
    [`6`, 9],
    [`7`, 1],
    [`8`, 12]
  ])],
  ["byNumber", new Map([
    [1, 0],
    [2, 2],
    [3, 4],
    [4, 5],
    [5, 7],
    [6, 9],
    [7, 11],
    [8, 12]
  ])]
]);

const semitones = new Map([
  [1, 0],
  [2, 2],
  [3, 4],
  [4, 5],
  [5, 7],
  [6, 9],
  [7, 11],
  [8, 12]
]);

const notes = new Map([
  [SHARP, [`A`, `A${SHARP}`, `B`, `C`, `C${SHARP}`, `D`, `D${SHARP}`, `E`, `F`, `F${SHARP}`, `G`, `G${SHARP}`]],
  [FLAT, [`A`, `B${FLAT}`, `B`, `C`, `D${FLAT}`, `D`, `E${FLAT}`, `E`, `F`, `G${FLAT}`, `G`, `A${FLAT}`]],
  [PREFERRED, [`A`, `B${FLAT}`, `B`, `C`, `C${SHARP}`, `D`, `E${FLAT}`, `E`, `F`, `F${SHARP}`, `G`, `G${SHARP}`]]
]);

const symbols = new Map([
  ["", {
    name: "major",
    includesSemitones: [4, 7]
  }],
  ["m", {
    name: "minor",
    includesSemitones: [3, 7]
  }],
  ["aug", {
    name: "augmented",
    includesSemitones: [4, 8]
  }],
  ["dim", {
    name: "diminished triad",
    includesSemitones: [3, 6]
  }],
  ["dim7", {
    name: "diminished seventh",
    includesSemitones: [3, 6, 9]
  }],
  ["sus2", {
    name: "suspended second",
    includesSemitones: [2, 7]
  }],
  ["sus4", {
    name: "suspended second",
    includesSemitones: [5, 7]
  }],
  ["2", {
    name: "add second",
    includesSemitones: [2, 4, 7]
  }],
  ["4", {
    name: "add forth",
    includesSemitones: [4, 5, 7]
  }],
  ["5", {
    name: "power",
    includesSemitones: [4]
  }],
]);