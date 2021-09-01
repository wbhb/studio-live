import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RingBuffer} from '../util/ringBuffer.mjs';

export class PlaybackNode extends AudioWorkletNode {
  
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, 'playback-processor');
    
    this.channelCountMode = 'explicit';
    this.channelInterpretation = 'speakers';
    
    this.port.onmessage = (e) => {
      if (e?.data?.command === 'stop') {
        this.dispatchEvent(new Event('ended'));
      } else if (e?.data?.command === 'swap') {
        const evt = new Event('swap');
        evt.data = e.data;
        this.dispatchEvent(evt);
      }
    };
    
    if (options?.sharedArrayBuffer) {
      this.port.postMessage({
        command: 'sab',
        sharedArrayBuffer: options?.sharedArrayBuffer
      });
    }
  }
  
  start(time) {
    
    const startTime = time || GlobalScheduler.audioContext.currentTime;
    
    this.port.postMessage({
      command: 'start',
      time: startTime
    });
  }
  
  stop(time) {
    
    const stopTime = time || GlobalScheduler.audioContext.currentTime;
    
    this.port.postMessage({
      command: 'stop',
      time: stopTime
    });
  }
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/playback-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});