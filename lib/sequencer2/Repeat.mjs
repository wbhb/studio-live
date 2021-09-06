export class Repeat {
  
  #repeats = 1;
  sequencers = new Map();
  
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
  
  *createMessageGen(message) {
    
    let repeatCount = 0;
    let doneCount = 0;
    
    for (const seq of this.sequencers.keys()) {
      this.sequencers.set(seq, seq.createMessageGen());
    }
    
    while (true) {
      
      const messages = new Set();
      
      for (const gen of this.sequencers.values()) {
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
      
      if (doneCount == this.sequencers.size) {
        repeatCount++;
      
        if (repeatCount >= this.repeats) {
          return messages;
        }
        
        doneCount = 0;
        
        for (const seq of this.sequencers.keys()) {
          this.sequencers.set(seq, seq.createMessageGen());
        }
        
      }
      
      yield messages;
    }
  }
}
