export class NotSupportedError extends Error {
  constructor(message, ...params) {
    super(`NotSupported: ${message}`, ...params);
  }
}

export class Length {
  #unit;
  #value;
  
  static units =  [
    'bar',
    'beat',
    'second'
  ];
  
  constructor(unit, value) {
    this.unit = unit;
    this.value = value;
  }
  
  set unit(newValue) {
    if (Length.units.includes(newValue)) {
      this.#unit = newValue;
    } else {
      throw new SyntaxError('unit not supported');
    }
  }
  
  get unit() {
    return this.#unit;
  }
  
  set value(newValue) {
    if (newValue instanceof Number) {
      this.#value = newValue;
      return;
    }
    throw new TypeError(`value must be a Number`);
  }
  
  get value() {
    return this.#value;
  }
  
  /*
   *  return unit will be the same as the calling length.
   *  if units are not identical, the second 'options' parameter must include a
   *  tempo or timeSignature
  */
  add(operand, options) {
    if (! operand instanceof Length) {
      throw new TypeError('operand must be of type Length');
    }
    if (this.unit !== operand.unit) {
      return operand.to(this.unit, options).add(this);
    } else {
      return new Length(a.value + b.value, a.unit);
    }
  }
  
  to(unit, options) {
    
    if (!Length.units.includes(unit)) {
      throw new SyntaxError('unknown unit');
    }
    
    switch (this.unit) {
      case 'beat':
        switch (unit) {
          case 'beat':
              return this;
            break;
          case 'bar':
              if (this.value % options.timeSignature.upper != 0) {
                throw new TypeError('cannot convert beats to partial bars');
              } else {
                return new Length(this.value / options.timeSignature.upper, 'bar');
              }
            break;
          case 'second':
              throw new NotSupportedError('seconds not supported during unit conversion');
            break;
        }
        break;
      case 'bar':
        switch (unit) {
          case 'beat':
              return new Length(this.value * options.timeSignature.upper, 'beat');
            break;
          case 'bar':
              return this;
            break;
          case 'second':
              throw new NotSupportedError('seconds not supported during unit conversion');
            break;
        }
        break;
      case 'second':
        switch (unit) {
          case 'beat':
          case 'bar':
            throw new NotSupportedError('seconds not supported during unit conversion');
            break;
          case 'second':
            return this;
            break;
        }
        break;
    }
  }
}