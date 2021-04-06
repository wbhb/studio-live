class _OverfillError extends Error {
  constructor() {
    super('RingBuffer would be overfilled by requested write');
  }
};

class _InsufficientDataError extends Error {
  constructor() {
    super('RingBuffer does not have enough data for requested read');
  }
};

export class RingBuffer {
  
  static OverfillError = _OverfillError;
  
  static InsufficientDataError = _InsufficientDataError;
  
  #type;
  #length = 4096;
  #buffer = null;
  #head = 0;
  #tail = 0;
  #strict = false; // setting to true will overwrite read values with 0;
  
  constructor(type, length, options) {
    
    this.#type = type;
    
    this.#length = length ?? this.length;
    
    this.#buffer = new this.#type(this.length);
    
    this.#strict = options?.strict;
  }
  
  get length() {
    return this.#length;
  }
  
  get filledLength() {
    if (this.#head >= this.#tail) {
      return this.#head - this.#tail;
    } else {
      return this.length - (this.#head - this.#tail);
    }
  }
  
  get emptyLength() {
    return this.length - this.filledLength;
  }
  
  write(buf) {
    
  //   console.info(`RingBuffer Write:
  // Length: ${this.length}
  // Head: ${this.#head}
  // Tail: ${this.#tail}`);
    
    
    const len = buf.length;
    
    if (len > this.emptyLength) {
      throw new RingBuffer.OverfillError();
    }
    
    for (let i = 0; i < len; i++) {
      const index = (this.#tail + i) % this.length;
      this.#buffer[index] = buf[i];
    }
    
    this.#tail = (this.#tail + len) % this.length
    
  }
  
  read(len) {
    
  //   console.info(`RingBuffer Read ${len}:
  // Length: ${this.length}
  // Head: ${this.#head}
  // Tail: ${this.#tail}
  // Filled: ${this.filledLength}
  // Empty: ${this.emptyLength}`);
    
    if (this.filledLength < len) {
      // console.error("RingBuffer ran dry")
      // throw new RingBuffer.InsufficientDataError();
      return;
    }
    
    const buf = new this.#type(len);
    
    if (this.#head < this.#tail) {
      buf.set(this.#buffer.slice(this.#head, this.#tail));
    }
    
    if (this.#head > this.#tail) {
      buf.set(this.#buffer.slice(this.#head));
      buf.set(this.#buffer.slice(0, this.#tail), this.length - this.#head);
    }
    
    if (this.#strict) {
      // zero out read data
      if (this.#head < this.#tail) {
        this.#buffer.fill(0, this.#head, this.#tail);
      }
      
      if (this.#head > this.#tail) {
        this.#buffer.fill(0, this.#head);
        this.#buffer.fill(0, 0, this.#tail);
      }
    }
    
    this.#head = (this.#head + len) % this.length;
    
  }
}