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

export class Playback extends EventTarget {
  
  #buffer;
  #ringBuffer;
  
  analyserNode;
  playbackNode = null;
  
  #handle;
  #reader;
  #streamHandler;
  
  constructor() {
    super();
    
    if (GlobalScheduler.audioContext) {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 3 * 2 * Float32Array.BYTES_PER_ELEMENT || 1000000);
      this.#ringBuffer = new RingBuffer({
          buffer: new Float32Array(this.#buffer)
        });
    }
    
    GlobalScheduler.addEventListener('AudioContextChanged', () => {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 3 * 2 * Float32Array.BYTES_PER_ELEMENT || 1000000);
    }, {once: true});
  }
  
  init() {
    
    this.playbackNode = new PlaybackNode(GlobalScheduler.audioContext, {
      sharedArrayBuffer: this.#buffer
    });
    
    this.analyserNode = new AnalyserNode(GlobalScheduler.audioContext);
    
    this.playbackNode.connect(this.analyserNode);
    
    this.playbackNode.addEventListener('swap', (e) => {
      if (e.data.high) {
        
        this.fillRingBuffer('high');
      } else if (e.data.low) {
        
        this.fillRingBuffer('low');
      } else {
        console.error(`swap buffer not specified`);
      }
    });
    
  }
  
  set handle(handle) {
    
    this.#handle = handle;
    
    this.#handle.getFile().then((file) => {
      this.#reader = file.stream().getReader();
      
      this.#streamHandler = this.streamHandler(this.#ringBuffer.length / 2);
      
      this.fillRingBuffer('low').then(() => {
        this.fillRingBuffer('high');
      });
    });
  }
  
  get handle() {
    return this.#handle;
  }
  
  async fillRingBuffer(swap) {
    
    let start;
    
    if (swap == 'low') {
      start = 0;
    } else {
      start = this.#ringBuffer.length / 2;
    }
    
    if (!this.#reader) {
      this.#ringBuffer.write(new Float32Array(this.#ringBuffer.length / 2), start);
      return;
    }
    
    let {value: buf, done} = await this.#streamHandler.next();
    
    if (buf) {
      
      this.#ringBuffer.write(buf, start);
      if (buf.length < (this.#ringBuffer.length / 2)) {
        this.#ringBuffer.write(new Float32Array((this.#ringBuffer.length / 2) - buf.length), start + buf.length);
      }
    } else {
      this.#ringBuffer.write(new Float32Array(this.#ringBuffer.length / 2), start);
    }
    
    if (done) {
      this.#reader.releaseLock();
      this.#reader = null;
    }
  }
  
  async * streamHandler(size) {
    
    let remainder = null;
    
    let buf, done;
    
    while ({value: buf, done} = await this.#reader.read()) {
      if (!done) {
        
        let dBuf = new DataView(buf.buffer);
        
        let fBuf = new Float32Array(new ArrayBuffer(dBuf.byteLength));
        
        const readBuf = new DataView(fBuf.buffer);
        
        for (let i = 0; i < buf.byteLength; i += Float32Array.BYTES_PER_ELEMENT) {
          readBuf.setFloat32(i, dBuf.getFloat32(i));
        }
        
        let start = 0;
        let end = size;
        
        if (remainder && remainder.length > 0) {
          const outBuf = new Float32Array(Math.min(size, remainder.length + fBuf.length));
          outBuf.set(remainder);
          
          end = outBuf.length - remainder.length;
          
          if (outBuf.length == size) {
            outBuf.set(fBuf.slice(0, end), remainder.length);
            start = end;
            end += size;
            remainder = null;
            
            yield outBuf;
          } else {
            
            outBuf.set(fBuf, remainder.length);
            remainder = outBuf;
          }
          
        }
        
        if (!remainder) {
          while (end <= fBuf.length) {
            yield fBuf.slice(start, end);
            start += size;
            end += size;
            remainder = null;
          }
          
          if (start < fBuf.length) {
            end = fBuf.length;
            remainder = fBuf.slice(start, end);
          }
        }
        
      } else {
        
        if (remainder && remainder.length > 0) {
          yield remainder;
        }
        return;
      }
    }
  }
  
  start() {
    
    if (!this.playbackNode || !this.playbackNode instanceof AudioNode) {
      throw new Error('call init before playing back');
    }
    
    this.playbackNode.start();
  }
  
  stop() {
    this.playbackNode.stop();
    this.#reader?.releaseLock();
    this.#reader = null;
  }
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/playback-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});