export class AsyncMap extends Map {

  #emitter = new EventTarget();

  async get(key) {
    if (this.has(key)) {
      return super.get(key);
    }

    if (typeof key !== 'string') {
      return undefined;
    }

    return new Promise((resolve) => {
      this.#emitter.addEventListener(key, (e) => {resolve(e.value)}, {once: true})
    });
  }

  set(key, value) {
    const exists = this.has(key);
    
    super.set(key, value);
    
    if (!exists) {
      if (typeof key === 'string') {
        const evt = new Event(key);
        evt.value = value;
        this.#emitter.dispatchEvent(evt);
      }
    }
  }
}