import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RingBuffer} from '../util/ringBuffer.mjs';

export class RecorderNode extends AudioWorkletNode {
  
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, 'recorder-processor');
    
    this.port.addEventListener('message', (e) => {
      if (e?.data?.command === 'stop') {
        this.dispatchEvent(new Event('ended'));
      } else if (e?.data?.command === 'swap') {
        const evt = new Event('swap');
        evt.data = e.data;
        this.dispatchEvent(evt);
      }
    });
    
    if (options?.sharedArrayBuffer) {
      this.port.postMessage({
        command: 'sab',
        sharedArrayBuffer: options?.sharedArrayBuffer
      });
    }
    
    this.port.start();
  }
  
  start(time) {
    
    const startTime = time || GlobalScheduler.audioContext.currentTime;
    
    this.port.postMessage({
      command: 'start',
      time: startTime
    });
  }
  
  stop = (time) => {
    
    const stopTime = time || GlobalScheduler.audioContext.currentTime;
    
    
    let finalise = new Promise((resolve, reject) => {
      const listener = this.port.addEventListener('message', (e) => {
        switch (e.data.command) {
          case 'finalise':
            resolve({
              finaliseStart: e.data.finaliseStart,
              finaliseEnd: e.data.finaliseEnd
            });
            this.port.removeEventListener('message', listener);
        }
      });
      
      setTimeout(() => {
        reject(new Error('timed out'));
        this.port.removeEventListener('message', listener);
      }, 3000);
    });
    
    this.port.postMessage({
      command: 'stop',
      time: stopTime
    });
    
    return finalise;
  }
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/recorder-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});