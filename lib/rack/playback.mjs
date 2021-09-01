import {RackItem} from './RackItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {PlaybackNode} from '../audio/playback-node.mjs';
import {RingBuffer} from '../util/ringBuffer.mjs';

export class Playback extends RackItem {
  
  #buffer;
  #ringBuffer;
  
  playbackNode = null;
  
  #handle;
  #reader;
  #streamHandler;
  
  constructor() {
    super({
      enabled: false,
      name: 'Playback'
    });
    
    if (GlobalScheduler.audioContext) {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 3 * 2 * Float32Array.BYTES_PER_ELEMENT || 1000000);
      this.#ringBuffer = new RingBuffer({
          buffer: new Float32Array(this.#buffer)
        });
    }
    
    GlobalScheduler.addEventListener('AudioContextChanged', () => {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 3 * 2 * Float32Array.BYTES_PER_ELEMENT || 1000000);
    }, {once: true});
    
    this.playbackNode = new PlaybackNode(GlobalScheduler.audioContext, {
      sharedArrayBuffer: this.#buffer
    });
    
    this.addOutput(this.playbackNode, {
      type: 'Audio',
      name: 'Main Out'
    });
    
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
    
    if (!this.enabled) {
      return;
    }
    
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
