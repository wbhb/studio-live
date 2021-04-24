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
      } else {
        this.dispatchEvent(new Event(e.data));
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
  
  // #deviceId = 'default';
  // #channel = 0;
  
  #buffer;
  #ringBuffer;
  
  // inputNode = null;
  // monitorNode = null;
  // analyserNode = null;
  
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
  
  // set deviceId(id) {
  //   this.#deviceId = id;
  // }
  
  // get deviceId() {
  //   return this.#deviceId;
  // }
  
  // set channel(channel) {
  //   this.#channel = channel;
  // }
  
  // get channel() {
  //   return this.#channel;
  // }
  
  init() {
    
    // const splitter = GlobalScheduler.audioContext.createChannelSplitter(this.inputNode.numberOfOutputs);
    
    // this.inputNode.connect(splitter);
    
    // this.analyserNode = GlobalScheduler.audioContext.createAnalyser();
    
    // splitter.connect(this.analyserNode, 0, this.channel);
    
    // this.monitorNode = GlobalScheduler.audioContext.createGain();
    
    // this.analyserNode.connect(this.monitorNode);
    
    this.playbackNode = new PlaybackNode(GlobalScheduler.audioContext, {
      sharedArrayBuffer: this.#buffer
    });
    
    // this.analyserNode.connect(this.#recordNode);
    
    this.playbackNode.addEventListener('swap', (data) => {
      console.log('swapR');
      if (!this.#reader) {
        return;
      }
      
      if (data.high) {
        this.fillRingBuffer('high');
      } else {
        this.fillRingBuffer('low');
      }
    });
    
  }
  
  set handle(handle) {
    
    this.#handle = handle;
    
    this.#handle.getFile().then((file) => {
      this.#reader = file.stream().getReader();
      
      this.#streamHandler = this.streamHandler(this.#ringBuffer.length / 2);
      
      this.fillRingBuffer('low');
    });
  }
  
  get handle() {
    return this.#handle;
  }
  
  async fillRingBuffer(swap) {
    
    let start = this.#ringBuffer.length / 2;
    // let end = this.#ringBuffer.length;
    
    if (swap == 'low') {
      start = 0;
      // end = this.#ringBuffer.length / 2;
    }
    
    let {value: buf, done} = await this.#streamHandler.next();
    
    if (buf) {
      console.log(buf);
      this.#ringBuffer.write(buf, start);
    }
    
    if (done) {
      this.#reader.releaseLock();
      this.#reader = null;
    }
    
    // while (this.#ringBuffer.tail < end) {
    //   let {value, done} = await this.#reader.read();
    //   if (!done) {
    //     this.#ringBuffer.write(new Float32Array(value));
    //   } else {
    //     return;
    //   }
    // }
  }
  
  async * streamHandler(size) {
    
    let remainder = new Float32Array(0);
    
    let buf, done;
    
    while ({value: buf, done} = await this.#reader.read()) {
      if (!done) {
        
        let dBuf = new DataView(buf.buffer);
        
        const readBuf = new DataView(new ArrayBuffer(dBuf.byteLength));
        
        for (let i = 0; i < buf.byteLength; i += Float32Array.BYTES_PER_ELEMENT) {
          readBuf.setFloat32(i, dBuf.getFloat32(i));
        }
        
        let fBuf = new Float32Array(readBuf.buffer);
        
        let start = 0;
        let end = size;
        
        if (remainder.length > 0) {
          const outBuf = new Float32Array(size);
          outBuf.set(remainder);
          
          end = outBuf.length - remainder.length;
          outBuf.set(fBuf.slice(start, end));
          
          start += size;
          end += size;
          // remainder = null;
          
          yield outBuf;
        }
        
        while (end < fBuf.length) {
          yield fBuf.slice(start, end);
          start += size;
          end += size;
        }
        
        remainder = fBuf.slice(start);
        
      } else {
        return;
      }
    }
  }
  
  start() {
    
    if (!this.playbackNode || !this.playbackNode instanceof AudioNode) {
      throw new Error('call init before playing back');
    }
    
    this.playbackNode.start();
    console.log(this.#ringBuffer);
  }
  
  stop() {
    this.playbackNode.stop();
    // this.playbackNode.disconnect();
    // this.#playbackNode = null;
    // this.#writer.ready().then(this.#writer.close);
    this.#reader?.releaseLock();
    this.#reader = null;
  }
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/playback-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});