export class NotSupportedError extends SyntaxError {
  constructor(message, ...params) {
    super(`NotSupported: ${message}`, ...params);
  }
}

export class Length {
  #unit;
  #value;
  
  static units =  {
    bar: Symbol('bar'),
    beat: Symbol('beat'),
    second: Symbol('second')
  };
  
  constructor(value, unit) {
    this.unit = unit;
    this.value = value;
  }
  
  set unit(newValue) {
    if (Object.values(Length.units).includes(newValue)) {
      this.#unit = newValue;
    } else if (Object.keys(Length.units).includes(newValue)) {
      this.#unit = Length.units[newValue];
    } else {
      throw new SyntaxError(`unit "${unit}" not supported`);
    }
  }
  
  get unit() {
    return this.#unit;
  }
  
  set value(newValue) {
    if (newValue instanceof Number || typeof newValue === 'number') {
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
      return this.add(operand.to(this.unit, options), options);
    } else {
      return new Length(this.value + operand.value, this.unit);
    }
  }
  
  to(unit, options) {
    
    if (!Object.values(Length.units).includes(unit)) {
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
              if (options.tempo) {
                return new Length(this.value * options.tempo.beatTime, Length.units.second);
              } else {
                throw new NotSupportedError('seconds not supported during unit without tempo option');
              }
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
              if (options.tempo) {
                return new Length(this.value * options.tempo.barTime, Length.units.second);
              } else {
                throw new NotSupportedError('seconds not supported during unit without tempo option');
              }
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
  
  toJSON(key) {
    return this.toPlain();
  }
  
  toPlain() {
    return {
      value: this.value,
      unit: Object.keys(Length.units).find((unit) => {return Length.units[unit] === this.unit})
    };
  }
}