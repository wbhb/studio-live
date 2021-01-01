import {Sequencer} from "./sequencer.js";
import {SampleCache} from "../util/sampleCache.js";

export class SampleSequencer extends Sequencer {
  
  constructor(scheduler, config) {
    
    super(scheduler, config);
    
    this._init();
  }
  
  async _init() {
    this.config.samples.forEach(SampleSequencer._cacheSample.bind(this));
  }
  
  static async _cacheSample(url) {
    return SampleCache.add(url);
  }
  
  async _createSampleNode(sampleUrl, options) {
    return SampleCache.createSampleNode(sampleUrl, options);
  }

}
