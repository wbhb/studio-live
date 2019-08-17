import {SequencerItem} from './SequencerItem.js';

export class PromptItem extends SequencerItem {
  
  #count;
  #prompts;
  
  constructor(plain) {
    super(plain);
    
    let template;
    
    if (plain instanceof String) {
      template = JSON.parse(plain);
    } else if (plain instanceof Object) {
      template = plain;
    }
    
    if (template) {
      this.count = template.count;
      this.prompts = template.prompts || [];
    }
  }
  
  set count(newValue) {
    this.#count = new Boolean(newValue);
  }
  
  get count() {
    return this.#count;
  }
  
  set prompts(newValue) {
    this.#prompts = newValue;
  }
  
  get prompts() {
    return this.#prompts;
  }
  
  add(prompt) {
    this.prompts.push(prompt);
  }
  
}