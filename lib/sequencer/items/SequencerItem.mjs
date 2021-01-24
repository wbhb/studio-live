import {Length, ChangeEvent as LengthChangeEvent} from '../../util/length.mjs';

export class SequencerItemError extends Error {
  constructor(message) {
    super(`SequencerItem: ${message}`);
  }
}

export class UidError extends SequencerItemError {
  constructor(message) {
    super(`uid: ${message}`);
  }
}

export class UidNotGenerated extends UidError {
  constructor(message) {
    super(`not generated: ${message}`);
  }
}

export class UidStillGenerating extends UidError {
  constructor(message, uidPromise) {
    super(`still generating: ${message}`);
    this.uidPromise = uidPromise;
  }
}

export class LengthTypeError extends TypeError {
  constructor(message) {
    super(`length of incorrect type: ${message}`);
  }
}

export class TimingsTypeError extends TypeError {
  constructor(message) {
    super(`timings of incorrect type: ${message}`);
  }
}

export class Timings extends EventTarget {
  
  #start;
  #length;
  #offset;
  
  constructor(length, offset) {
    super();
    
    this.length = length;
    this.offset = offset;
    
  }
  
  get start() {
    return this.#start;
  }
  
  set start(newValue) {
    
    if (!newValue instanceof Length) {
      throw new LengthTypeError(newValue.constructor);
    }
    
    try {
      this.start.removeEventListener('change-unit');
      this.start.removeEventListener('change-value');
    } catch(e) {}
    
    this.#start = newValue;
    
    if (!newValue) {
      return;
    }
    
    const handle = () => {
      let evt = new LengthChangeEvent('start');
      this.dispatchEvent(evt);
    }
    
    this.start.addEventListener('change-unit', handle);
    this.start.addEventListener('change-value', handle);
    handle();
  }
  
  get length() {
    return this.#length;
  }
  
  set length(newValue) {
    
    if (!newValue instanceof Length) {
      throw new LengthTypeError(newValue.constructor);
    }
    
    try {
      this.length.removeEventListener('change-unit');
      this.length.removeEventListener('change-value');
    } catch(e) {}
    
    this.#length = newValue;
    
    if (!newValue) {
      return;
    }
    
    const handle = () => {
      let evt = new LengthChangeEvent('length');
      this.dispatchEvent(evt);
    }
    
    this.length.addEventListener('change-unit', handle);
    this.length.addEventListener('change-value', handle);
    handle();
  }
  
  get offset() {
    return this.#offset;
  }
  
  set offset(newValue) {
    
    if (!newValue instanceof Length) {
      throw new LengthTypeError(newValue.constructor);
    }
    
    try {
      this.offset.removeEventListener('change-unit');
      this.offset.removeEventListener('change-value');
    } catch(e) {}
    
    this.#offset = newValue;
    
    if (!newValue) {
      return;
    }
    
    const handle = () => {
      let evt = new LengthChangeEvent('offset');
      this.dispatchEvent(evt);
    }
    
    this.offset.addEventListener('change-unit', handle);
    this.offset.addEventListener('change-value', handle);
    handle();
  }
  
  get resolved() {
    return this.start != null && this.start != undefined;
  }
  
  toJSON(key) {
    let plain = {};
    
    if (this.start) {
      plain.start = this.start.toJSON();
    }
    
    if (this.length) {
      plain.length = this.length.toJSON();
    }
    
    if (this.offset) {
      plain.offset = this.offset.toJSON();
    }
    
    return plain;
  }
}

export class SequencerItem extends Event {
  
  #uid; // null indicates value is being calculated
  parent;
  
  #timings;
  #immediate = false;
  
  static #registry = new Map();
  
  static register(constructor) {
    SequencerItem.registry.set(constructor.name, constructor);
  }
  
  static get registry() {
    return this.#registry;
  }
  
  static create(plain) {
    let template;
    
    if (typeof plain === 'string' || plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    let constructor = this.registry.get(template.type);
    
    return new constructor(template);
  }
  
  constructor(plain) {
    
    super('item', {composed: true});
    
    let template;
    this.#timings = new Timings();
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
    
      this.#uid = template.uid;
      
      if (template.timings.length) {
        this.timings.length = new Length(template.timings.length.value, template.timings.length.unit);
      }
      if (template.timings.offset) {
        this.timings.offset = new Length(template.timings.offset.value, template.timings.offset.unit);
      }
      
      this.timings.immediate = template.timings.immediate;
      
      this.immediate = template.immediate;
    }
  }
  
  get type() {
    return this.constructor.name;
  }
  
  get mediaType() {
    return this.constructor.mediaType;
  }
  
  static get mediaType() {
    return `application/x.wbhb.studio.${this.constructor.type}`;
  }
  
  get uid() {
    if (!this.#uid) {
      this.#uid = null;
      const uid = SequencerItem.createUid(this).then((uid) => {return this.#uid = uid});
      throw new UidStillGenerating("", uid);
    } else {
      SequencerItem.createUid(this).then((uid) => {if (this.#uid != uid) {console.warn(`uid has changed from ${uid} to ${this.#uid}`);}});
    }
    return this.#uid;
  }
  
  get id() {
    
    if (this.parent) {
      return `${this.parent.id}-${this.uid}`;
    } else {
      return this.uid;
    }
  }
  
  set timings(newValue) {
    
    if (!newValue instanceof Timings) {
      throw new TimingsTypeError(newValue.constructor);
    }
    
    if (this.timings.resolved) {
      console.warn(`Overwriting resolved timings`); 
    }
    if (newValue.resolved) {
      console.warn(`New timings are resolved`) 
    }
    this.#timings = newValue;
    this.#uid = undefined;
  }
  
  get timings() {
    return this.#timings;
  }
  
  set immediate(newValue) {
    this.#immediate = new Boolean(newValue);
    this.#uid = undefined;
    // SequencerItem.createUid(this).then((uid) => {this.#uid = uid});
  }
  
  get immediate() {
    return this.#immediate;
  }
  
  toJSON(key) {
    let plain = {};
    
    plain.immediate = undefined;
    plain.resolved = undefined;
    plain.parent = undefined;
    
    plain.timings = this.timings.toJSON();
    
    plain.timings.start = undefined;
    
    plain.type = this.type;
          
    return plain;
  }
  
  get resolved() {
    return this.timings.resolved;
  }
  
  resolve(start, options) {
    if (start instanceof Length) {
      if (this.timings.offset) {
        this.timings.start = start.add(this.timings.offset, options);
      } else {
        this.timings.start = start;
      }
    } else {
      throw new TypeError('start must be of type Length');
    }
  }
  
  static async createUid(item) {
    let encodedItem = new TextEncoder().encode(JSON.stringify(item));
    let digest = await crypto.subtle.digest('SHA-256', encodedItem);
    
    const byteArray = new Uint8Array(digest);

    const hexCodes = [...byteArray.slice(-4)].map((value) => {
      const hexCode = value.toString(16);
      const paddedHexCode = hexCode.padStart(2, '0');
      return paddedHexCode;
    });

    return hexCodes.join('');
  }
  
  static clone(item) {
    return SequencerItem.create(item.toJSON());
  }
}

SequencerItem.register(SequencerItem);
