import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RackItem} from '../rack/RackItem.mjs';

export class MainOut extends RackItem {
  
  #boundListeners = {};
  
  constructor(config) {
    super({...config, ...{
      enabled: true,
      name: 'Main Out'
    }});
    
    const audioIn = new GainNode(GlobalScheduler.audioContext, {gain: 1});
    
    this.addInput(
      audioIn,
      {
        type: 'Audio',
        name: 'Audio In'
      }
    );
    
    audioIn.connect(GlobalScheduler.audioContext.destination);
    
  }
}