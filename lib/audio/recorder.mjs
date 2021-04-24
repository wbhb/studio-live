import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RingBuffer} from '../util/ringBuffer.mjs';

// class ChunkList extends Array {
  
//   #newChunks = new EventTarget();
//   #head = 0;
  
//   push(chunk) {
//     super.push(chunk);
//     const evt = new Event('data');
//     this.#newChunks.dispatchEvent(evt);
//   }
  
//   async shift() {
    
//     await new Promise((resolve) => {
//       this.#newChunks.addEventListener('data', resolve, {once: true});
//     });
//     // return super.shift();
//     return this?.[this.#head++];
//   }
  
//   reset() {
//     this.#head = 0;
//   }
  
// }

export class RecorderNode extends AudioWorkletNode {
  
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, 'recorder-processor');
    
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

export class Recorder extends EventTarget {
  
  #deviceId = 'default';
  #channel = 0;
  
  #buffer;
  
  inputNode = null;
  monitorNode = null;
  analyserNode = null;
  
  #recordNode = null;
  
  handle;
  #writer;
  
  constructor() {
    super();
    
    if (GlobalScheduler.audioContext) {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 6 * Float32Array.BYTES_PER_ELEMENT || 1000000);
    }
    
    GlobalScheduler.addEventListener('AudioContextChanged', () => {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 6 * Float32Array.BYTES_PER_ELEMENT || 1000000);
    }, {once: true});
  }
  
  static get devices() {
    return navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      return devices.filter((dev) => {
        return dev.kind === 'audioinput';
      });
    });
  }
  
  set deviceId(id) {
    this.#deviceId = id;
  }
  
  get deviceId() {
    return this.#deviceId;
  }
  
  set channel(channel) {
    this.#channel = channel;
  }
  
  get channel() {
    return this.#channel;
  }
  
  async init() {
    this.inputNode = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: this.deviceId
        }
      }).then((stream) => {
          // return GlobalScheduler.audioContext.createMediaStreamTrackSource(stream.getAudioTracks()[0]);
          return GlobalScheduler.audioContext.createMediaStreamSource(stream);
      });
    
    const splitter = GlobalScheduler.audioContext.createChannelSplitter(this.inputNode.numberOfOutputs);
    
    this.inputNode.connect(splitter);
    
    this.analyserNode = GlobalScheduler.audioContext.createAnalyser();
    
    splitter.connect(this.analyserNode, 0, this.channel);
    
    this.monitorNode = GlobalScheduler.audioContext.createGain();
    
    this.analyserNode.connect(this.monitorNode);
    
    this.#recordNode = new RecorderNode(GlobalScheduler.audioContext, {
      sharedArrayBuffer: this.#buffer
    });
    
    this.analyserNode.connect(this.#recordNode);
    
    this.#recordNode.addEventListener('swap', (e) => {
      // console.log('swapR');
      if (!this.#writer) {
        return;
      }
      
      const writeBuf = new DataView(new ArrayBuffer(this.#buffer.byteLength / 2));
      let buf;
      
      if (e.data.high) {
        buf = new DataView(this.#buffer.slice(this.#buffer.byteLength / 2));
      } else {
        buf = new DataView(this.#buffer.slice(0, this.#buffer.byteLength / 2));
      }
      
      // writeBuf.set(new Uint8Array(buf.buffer));
      
      for (let i = 0; i < buf.byteLength; i++) {
        writeBuf.setUint8(i, buf.getUint8(i));
      }
      
      console.log(writeBuf);
      
      this.#writer.write({
        type: 'write',
        data: writeBuf.buffer
      });
    });
    
  }
  
  start() {
    
    if (!this.#recordNode || !this.#recordNode instanceof AudioNode) {
      throw new Error('call init before recording');
    }
    
    this.handle?.createWritable().then((writable) => {
      this.#writer = writable;
    });
    
    this.#recordNode.start();
  }
  
  stop() {
    this.#recordNode.stop();
    // this.#writer.ready().then(this.#writer.close);
    this.#writer?.close();
  }
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/recorder-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});