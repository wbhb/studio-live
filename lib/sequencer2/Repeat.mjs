import {Sequencer} from './Sequencer.mjs';

export class Repeat extends Sequencer {
  
  #repeats = 1;
  
  set repeats(newVal) {
    
    let val = newVal;
    
    if (typeof val === 'string') {
      val = parseInt(val, 10);
    }
    
    if (val === 0) {
      val = Number.POSITIVE_INFINITY;
    }
    
    this.#repeats = val;
  }
  
  get repeats() {
    return this.#repeats;
  }
  
  get length() {
    return this.repeats;
  }
  
  add(sequencer) {
    super.set(sequencer, undefined);
  }
  
  *createMessageGen(message) {
    
    let repeatCount = 0;
    let doneCount = 0;
    
    for (const seq of this.keys()) {
      this.set(seq, seq.createMessageGen());
    }
    
    while (true) {
      
      const messages = new Set();
      
      for (const gen of this.values()) {
        const {value: genMessages, done} = gen.next();
      
        if (messages) {
          for (const message of genMessages.values()) {
            messages.add(message);
          }
        }
        
        if (done) {
          doneCount++;
        }
      }
      
      if (doneCount == this.size) {
        repeatCount++;
      
        if (repeatCount >= this.repeats) {
          return messages;
        }
        
        doneCount = 0;
        
        for (const seq of this.keys()) {
          this.set(seq, seq.createMessageGen());
        }
        
      }
      
      yield messages;
    }
  }
}
