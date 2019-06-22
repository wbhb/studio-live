export class TimeSignature {
  #upper = 4;
  #lower = 4;
  
  constructor(upper, lower) {
    this.upper = upper;
    this.lower = lower;
  }
  
  set upper(newValue) {
    if (newValue instanceof Number) {
      this.#upper = newValue;
    } else {
      throw TypeError('upper is not a Number');
    }
  }
  
  get upper() {
    return this.#upper;
  }
  
  set lower(newValue) {
    if (newValue instanceof Number) {
      this.#lower = newValue;
    } else {
      throw TypeError('lower is not a Number');
    }
  }
  
  get lower() {
    return this.#lower;
  }
}