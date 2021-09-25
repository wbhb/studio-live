import {MIDI} from '../util/midi.mjs';
import {Sequencer} from './Sequencer.mjs';

export class BeatwiseSequencer extends Sequencer {
  
  #emptyBeat = new Beat();
  
  #lastBeat = 0;
  
  get(i) {
    if (typeof i === 'number') {
      if (this.has(i)) {
        return super.get(i);
      } else {
        return this.#emptyBeat;
      }
    }
    return super.get(i);
  }
  
  set(key, value) {
    
    if (typeof key !== 'number') {
      throw new TypeError('Sequencer index must be a number');
    }
    
    if (value instanceof Beat) {
      this.#lastBeat = Math.max(this.#lastBeat, key);
      return super.set(key, value);
    }
    
    throw new TypeError('Sequencer only holds Beats and Sequencer');
  }
  
  *createMessageGen(message, options) {
    
    const substituteOpaque = options?.substituteOpaque ?? false;

    let clock = 0;
    
    let messageGens = new Set();
    
    while (true) {
      
      const currentBeat = this.get(clock);
      
      const messages = new Set();
      
      messageGens.forEach((gen) => {
        const {value: genMessages, done} = gen.next();
        genMessages.forEach((message) => {
          messages.add(message);
        });
        if (done) {
          messageGens.delete(gen);
        }
      });
      
      
      currentBeat.forEach((beat) => {
        if (beat instanceof Beat) {
          beat.forEach(messages.add);
        }
        if (beat instanceof Sequencer) {
          if (substituteOpaque && beat.opaque) {
            const substituteBeat = new SubstituteBeat(beat.length, beat.toString());
            messages.add(substituteBeat);
          } else {
            const gen = beat.createMessageGen(message);
            messageGens.add(gen);
            const beats = gen.next().value;
            beats.forEach((iBeat) => {
              messages.add(iBeat);
            });
          }
        }
      });
      
      clock++;
      
      if (clock > this.lastBeat && messageGens.size == 0) {
        return messages;
      }
      
      yield messages;
    }
  }
}

export class Beat extends Set {
  
  #_length = 0;
  
  get length() {
    return this.#_length;
  }
  
  get #length() {
    return this.#_length;
  }
  
  set #length(newVal) {
    this.#_length = Math.max(this.length, newVal);
  }
  
  add(message) {
    if (message instanceof MIDI.Message) {
      this.#length = 1;
      return super.add(message);
    }
    
    if (message instanceof Sequencer) {
      this.#length = message.length;
      return super.add(message);
    }
    
    throw new TypeError('Beat can only include MIDI messages and Sequencers');
  }
}

export class SubstituteBeat extends Beat {

  #length;

  constructor(length, name) {
    super();

    this.length = length;

    this.name = name;
  }

  set length(newValue) {
    this.#length = newValue;
  }

  get length() {
    return this.#length;
  }

  toString() {
    return this.name ?? 'Section';
  }
}