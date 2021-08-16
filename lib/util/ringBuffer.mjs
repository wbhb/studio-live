class _OverfillError extends Error {
  constructor(options) {
    super(`RingBuffer would be overfilled by requested write:
  requested: ${options.requestLength}
  available: ${options.emptyLength}
  filled: ${options.filledLength}`);
  }
}

class _InsufficientDataError extends Error {
  constructor() {
    super('RingBuffer does not have enough data for requested read');
  }
}

export class RingBuffer {
  
  static OverfillError = _OverfillError;
  
  static InsufficientDataError = _InsufficientDataError;
  
  #type;
  #length = 4096;
  #buffer = null;
  #head = 0;
  #tail = 0;
  #strict = false; // setting to true will overwrite read values with 0;
  
  constructor(options) {
    
    this.#type = options?.type ?? options?.buffer?.constructor;
    
    if (options?.buffer) {
      this.#length = options?.buffer.length;
      
      this.#buffer = options.buffer;
    } else {
      this.#length = options?.length ?? this.length;
    
      this.#buffer = new this.#type(this.length);
    }
    
    this.#strict = options?.strict;
  }
  
  get length() {
    return this.#length;
  }
  
  get buffer() {
    return this.#buffer;
  }
  
  get filledLength() {
    if (this.#head <= this.#tail) {
      return this.#tail - this.#head;
    } else {
      return this.length - (this.#head - this.#tail);
    }
  }
  
  get emptyLength() {
    return this.length - this.filledLength;
  }
  
  get head() {
    return this.#head;
  }
  
  get tail() {
    return this.#tail;
  }
  
  reset() {
    this.#head = 0;
    this.#tail = 0;
  }
  
  fakeReset() {
    this.#head = 0;
  }
  
  fakeWrite(len) {
    this.#tail = (this.#tail + len) % this.length;
  }
  
  write(buf) {
    
    const len = buf.length;
    
    if (len > this.emptyLength) {
      throw new RingBuffer.OverfillError({
        requestLength: len,
        emptyLength:this.emptyLength,
        filledLength: this.filledLength
      });
    }
    
    const start = this.#tail;
    
    this.#tail = (this.#tail + len) % this.length;
    
    if (this.#head <= this.#tail) {
      this.#buffer.set(buf, start);
    }
    
    if (this.#head > this.#tail) {
      const len1 = this.length - this.head;
      const len2 = len - len1;
      
      this.#buffer.set(buf.slice(0, len1), this.#head + len1);
      this.#buffer.set(buf.slice(len2), 0);
    }
  }
  
  read(len) {
    
    if (this.filledLength < len) {
      console.error("RingBuffer ran dry");
      // throw new RingBuffer.InsufficientDataError();
      return;
    }
    
    const buf = new this.#type(len);
    
    if (this.#head < this.#tail) {
      buf.set(this.#buffer.slice(this.#head, this.#head + len));
    }
    
    if (this.#head > this.#tail) {
      const len1 = this.length - this.head;
      const len2 = len - len1;
      
      buf.set(this.#buffer.slice(this.#head, this.#head + len1));
      if (len2) {
        buf.set(this.#buffer.slice(0, len2), len1);
      }
    }
    
    // if (this.#strict) {
    //   // zero out read data
    //   if (this.#head < this.#tail) {
    //     this.#buffer.fill(0, this.#head, len);
    //   }
      
    //   if (this.#head > this.#tail) {
    //     this.#buffer.fill(0, this.#head);
    //     this.#buffer.fill(0, 0, this.#tail);
    //   }
    // }
    
    this.#head = (this.#head + len) % this.length;
    
    return buf;
  }
}