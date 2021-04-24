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

export class PlaybackNode extends AudioWorkletNode {
  
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, 'playback-processor');
    
    this.port.onmessage = (e) => {
      if (e?.data?.command === 'stop') {
        this.dispatchEvent(new Event('ended'));
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
  
  #playbackNode = null;
  
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
    
    this.#recordNode.addEventListener('swap', (data) => {
      console.log('swapR');
      if (!this.#writer) {
        return;
      }
      
      const writeBuf = new Float32Array(new ArrayBuffer(this.#buffer.byteLength / 2));
      let buf;
      
      if (data.high) {
        buf = this.#buffer.slice(this.#buffer.byteLength / 2);
      } else {
        buf = this.#buffer.slice(0, this.#buffer.byteLength / 2);
      }
      
      writeBuf.set(buf);
      
      this.#writer.write({
        type: 'write',
        data: writeBuf
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
    this.playbackNode.start();
  }
  
  stop() {
    this.#recordNode.stop();
    this.playbackNode.stop();
    // this.playbackNode.disconnect();
    // this.#playbackNode = null;
    // this.#writer.ready().then(this.#writer.close);
    this.#writer?.close();
  }
  
  get playbackNode() {
    if (!this.#playbackNode) {
      this.#playbackNode = new PlaybackNode(GlobalScheduler.audioContext, {
        sharedArrayBuffer: this.#buffer
      });
    }
    
    return this.#playbackNode;
  }
}

GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/recorder-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});

GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/playback-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});