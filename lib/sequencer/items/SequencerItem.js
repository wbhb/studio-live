import {Length} from '../../util/length.js';

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
  constructor(message) {
    super(`still generating: ${message}`);
  }
}

export class SequencerItem extends Event {
  
  #uid; // null indicates value is being calculated
  parent;
  
  #timings = {};
  #immediate = false;
  
  constructor(plain) {
    
    super('item', {composed: true});
    
    let template, timings;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
    
      this.#uid = template.uid;
      
      if (template.timings.length) {
        template.timings.length = new Length(template.timings.length.value, template.timings.length.unit);
      }
      if (template.timings.offset) {
        template.timings.offset = new Length(template.timings.offset.value, template.timings.offset.unit);
      }
      
      this.timings = template.timings;
      
      this.immediate = template.immediate;
    }
  }
  
  get type() {
    return this.constructor.name;
  }
  
  get uid() {
    if (!this.#uid) {
      this.uid = null;
      SequencerItem.createUid(this).then((uid) => {this.#uid = uid});
      throw new UidStillGenerating();
    } else {
      SequencerItem.createUid(this).then((uid) => {if (this.#uid != uid) {console.warn(`uid has changed`);}});
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
    if (this.#timings.hasOwnProperty('start')) {
      console.warn(`Overwriting resolved timings`); 
    }
    if (newValue.hasOwnProperty('start')) {
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
    SequencerItem.createUid(this).then((uid) => {this.#uid = uid});
  }
  
  get immediate() {
    return this.#immediate;
  }
  
  toJSON(key) {
    let plain = super.toJSON(key);
    Object.keys(this).forEach((prop) => {
      switch (prop) {
        case 'resolved':
        case 'parent':
          plain[prop] = undefined;
          break;
        default:
          // non-special cases handled by super
          // plain[prop] = this[prop];
      }
    });
    return plain;
  }
  
  get resolved() {
    return this.timings.hasOwnProperty('start');
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
}