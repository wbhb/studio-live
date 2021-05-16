export class RackItem extends EventTarget {
  
  #inputs = new Map();
  #outputs = new Map();
  
  #enabled = true;
  
  constructor(options) {
    super();
    
    this.enabled = options?.enabled ?? this.#enabled;
    
    this.name = options?.name ?? "";
    
    options?.inputs?.forEach(({node, config}) => {
      this.addInput(node, config);
    });
    
    options?.outputs?.forEach(({node, config}) => {
      this.addOutput(node, config);
    });
    
  }
  
  set enabled(val) {
    this.#enabled = Boolean(val);
  }
  
  get enabled() {
    return this.#enabled;
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.disabled = false;
  }
  
  addInput(node, config) {
    this.#inputs.set(node, {...config, direction: 'input'});
  }
  
  addOutput(node, config) {
    this.#outputs.set(node, {...config, direction: 'output'});
  }
  
  get isSource() {
    return this.#inputs.size == 0 && this.#outputs.size > 0;
  }
  
  get isDestination() {
    return this.#inputs.size > 0 && this.#outputs.size == 0;
  }
  
  get isTransform() {
    return this.#inputs.size > 0 && this.#outputs.size > 0;
  }
  
  get inputs() {
    return this.#inputs;
  }
  
  getNamedInput(name) {
    
    let input;
    
    this.inputs.forEach((config, node) => {
      if (config.name == name) {
        input = {node, config};
      }
    });
    
    return input;
  }
  
  get outputs() {
    return this.#outputs;
  }
  
  getNamedOutput(name) {
    
    let output;
    
    this.outputs.forEach((config, node) => {
      if (config.name == name) {
        output = {node, config};
      }
    });
    
    return output;
  }
}