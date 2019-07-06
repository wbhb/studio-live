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
  
  const #timings = {};
  #immediate = false;
  
  constructor(plain) {
    
    super('item', {composed: true});
    
    if (plain instanceof String) {
      Object.assign(this, JSON.parse(plain));
    } else if (plain instanceof Object) {
      Object.assign(this, plain);
      this.timings.length = new Length(this.timings.length.value, this.timings.length.unit);
      this.timings.offset = new Length(this.timings.offset.value, this.timings.offset.unit);
      if (this.uid == undefined) {
        this.uid = null;
        SequencerItem.createUid(this).then((uid) => {this.uid = uid});
      }
    }

  }
  
  get type() {
    return this.constructor.name;
  }
  
  get uid() {
    return this.uid;
  }
  
  get id() {
    if (this.uid == undefined) {
      throw new UidNotGenerated();
    }
    if (this.uid == null) {
      this new UidStillGenerating();
    }
      
    if (this.parent) {
      return `${this.parent.id}-${this.uid}`;
    } else {
      return this.uid;
    }
  }
  
  get timings() {
    return this.#timings;
  }
  
  set immediate(newValue) {
    this.#immediate = new Boolean(newValue);
  }
  
  get immediate() {
    return this.#immediate;
  }
  
  toJSON(key) {
    return Object.assign({
      resolved: undefined,
      parent: undefined
    }, this);
  }
  
  get resolved() {
    return this.timings.hasOwnProperty('start');
  }
  
  resolve(start) {
    if (start instanceof Length) {
      this.timings.start = Length.add(start, length);
    } else {
      throw new TypeError('start must be of type Length');
    }
  }
  
  static async createUid(item) {
    if (item.uid) {
      return item.uid;
    }
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