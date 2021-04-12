import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';


class ChunkList extends Array {
  
  #newChunks = new EventTarget();
  
  push(chunk) {
    super.push(chunk);
    const evt = new Event('data');
    this.#newChunks.dispatchEvent(evt);
  }
  
  async shift() {
    
    await new Promise((resolve) => {;
      this.#newChunks.addEventListener('data', resolve, {once: true})
    });
    
    return super.shift();
  }
  
}

const chunks = new ChunkList();

export class RecorderNode extends AudioWorkletNode {
  
  constructor(context, options) {
    
    super(context || GlobalScheduler.audioContext, 'recorder-processor');
    
    this.port.onmessage = (e) => {
      if (e.data.command === 'stop') {
        this.dispatchEvent(new Event('ended'));
      }
    };
    
    if (options?.stream) {
      this.port.postMessage({
        command: 'stream',
        stream: options?.stream
      }, [options?.stream]);
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
      if (e.data.command === 'stop') {
        this.dispatchEvent(new Event('ended'));
      }
    };
    
    if (options?.stream) {
      this.port.postMessage({
        command: 'stream',
        stream: options?.stream
      }, [options?.stream]);
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
  
  inputNode = null;
  monitorNode = null;
  analyserNode = null;
  
  #recordNode = null;
  
  #playbackNode = null;
  
  constructor() {
    super();
  }
  
  static get devices() {
    return navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      return devices.filter((dev) => {
        return dev.kind === 'audioinput';
      })
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
      stream: new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        }
      })
    });
    
    this.analyserNode.connect(this.#recordNode);
    
  }
  
  start() {
    
    if (!this.#recordNode || !this.#recordNode instanceof AudioNode) {
      throw new Error('call init before recording');
    }
    
    this.#recordNode.start();
    this.playbackNode.start();
  }
  
  stop() {
    this.#recordNode.stop();
    this.playbackNode.stop();
    // this.playbackNode.disconnect();
    // this.#playbackNode = null;
  }
  
  get playbackNode() {
    if (!this.#playbackNode) {
      this.#playbackNode = new PlaybackNode(GlobalScheduler.audioContext, {
        stream: new ReadableStream({
          pull(controller) {
            // console.log(`READ Chunks Length: ${chunks.length}`);
            
            return chunks.shift().then((chunk) => {
              if (chunk) {
                controller.enqueue(chunk);
              }
            });
          }
        }, {
          highWaterMark: 10
        })
      });
    }
    
    return this.#playbackNode;
  }
}

GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/recorder-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});

GlobalScheduler.audioContext.audioWorklet.addModule('lib/audio/playback-processor.mjs', {credentials: 'include'})
  .catch((e) => {console.error(e, e.stack)});