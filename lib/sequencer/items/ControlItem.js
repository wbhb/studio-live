import {SequencerItem} from './SequencerItem.js';

export class ControlCode {
  
  static #registry = new Map();
  
  #name;
  #payloadType;
  
  constructor(name, payloadType) {
    
    this.#name = name;
    this.#payloadType = payloadType;
  }
  
  get name() {
    return this.#name;
  }
  
  get payloadType() {
    return this.#payloadType
  }
  
  toString() {
    return this.name;
  }
  
  static create(name, payloadType) {
    
    const registrySymbol = Symbol(name);
    
    if (ControlCode.#registry.has(registrySymbol)) {
      throw new SyntaxError(`Control Code "${name}" already defined`);
    }
    
    ControlCode.#registry.set(registrySymbol, new ControlCode(name, payloadType));
    
    return registrySymbol;
  }
  
  static get(code) {
    return ControlCode.#registry.get(code);
  }
  
  static has(code) {
    return ControlCode.#registry.has(code);
  }
}

export class ControlItem extends SequencerItem {
  
  #controlCode;
  #payload;
  
  constructor(plain) {
    super(plain);
  }
  
  get controlCode() {
    return this.#controlCode;
  }
  
  set controlCode(newValue) {
    
    if (ControlCode.has(newValue)) {
      this.#controlCode = newValue;
    } else {
      throw new TypeError('control code does not exist');
    }
  }
  
  get payload() {
    return this.#payload;
  }
  
  set payload(newValue) {
    
    if (newValue instanceof ControlCode.get(this.controlCode).payloadType) {
      this.#payload = newValue;
    } else {
      throw new TypeError('payload for ${ControlCode.get(this.controlCode).name} must be a ${ControlCode.get(this.controlCode).payloadType}');
    }
  }
  
  toJSON(key) {
    return Object.assign({
      controlCode: ControlCode.get(this.controlCode).name
    }, super.toJSON());
  }
  
}