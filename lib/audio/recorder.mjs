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
      if (!this.#writer) {
        return;
      }
      
      
      let buf;
      
      if (e.data.high) {
        buf = this.#buffer.slice(this.#buffer.byteLength / 2);
      } else {
        buf = this.#buffer.slice(0, this.#buffer.byteLength / 2);
      }
      
      this.write(buf);
    });
  }
  
  write(buf) {
    
    if (!this.#writer) {
      return;
    }
    
    const dBuf = new DataView(buf);
    const writeBuf = new DataView(new ArrayBuffer(dBuf.byteLength));
    
    for (let i = 0; i < dBuf.byteLength; i++) {
      writeBuf.setUint8(i, dBuf.getUint8(i));
    }
    
    this.#writer.write({
      type: 'write',
      data: writeBuf.buffer
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
  
  async stop() {
    let {finaliseStart, finaliseEnd} = await this.#recordNode.stop();
    
    if (finaliseStart || finaliseEnd) {
      this.write(this.#buffer.slice(finaliseStart, finaliseEnd));
    }
    
    this.#writer?.close();
  }
}

await GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/recorder-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});