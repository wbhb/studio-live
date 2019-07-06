export class NotSupportedError extends SyntaxError {
  constructor(message, ...params) {
    super(`NotSupported: ${message}`, ...params);
  }
}

export class Length {
  #unit;
  #value;
  
  static units =  {
    bar: Synbol('bar'),
    beat: Symbol('beat'),
    second: Symbol('second')
  };
  
  constructor(unit, value) {
    this.unit = unit;
    this.value = value;
  }
  
  set unit(newValue) {
    if (Length.units.hasOwnProperty(newValue)) {
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
      case Length.units.beat:
        switch (unit) {
          case Length.units.beat:
              return this;
            break;
          case Length.units.bar:
              if (this.value % options.timeSignature.upper != 0) {
                throw new TypeError('cannot convert beats to partial bars');
              } else {
                return new Length(this.value / options.timeSignature.upper, Length.units.bar);
              }
            break;
          case Length.units.second:
              throw new NotSupportedError('seconds not supported during unit conversion');
            break;
        }
        break;
      case Length.units.bar:
        switch (unit) {
          case Length.units.beat:
              return new Length(this.value * options.timeSignature.upper, Length.units.beat);
            break;
          case Length.units.bar:
              return this;
            break;
          case Length.units.second:
              throw new NotSupportedError('seconds not supported during unit conversion');
            break;
        }
        break;
      case Length.units.second:
        switch (unit) {
          case Length.units.beat:
          case Length.units.bar:
            throw new NotSupportedError('seconds not supported during unit conversion');
            break;
          case Length.units.second:
            return this;
            break;
        }
        break;
    }
  }
}