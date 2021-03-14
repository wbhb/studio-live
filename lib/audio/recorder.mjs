import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class Recorder extends EventTarget {
  
  #deviceId = 'default';
  #channel = 0;
  
  inputNode = null;
  monitorNode = null;
  analyserNode = null;
  
  #recordNode = null;
  #recorder = null;
  blob = null;
  
  playbackNode = null;
  
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
    
    this.#recordNode = GlobalScheduler.audioContext.createMediaStreamDestination();
    
    this.analyserNode.connect(this.#recordNode);
    
  }
  
  start() {
    
    if (!this.#recordNode || !this.#recordNode instanceof AudioNode) {
      throw new Error('call init before recording');
    }
    
    this.#recorder = new MediaRecorder(this.#recordNode.stream, {
      mimeType: 'audio/webm'
    });
    this.#recorder.start();
    this.#recorder.ondataavailable = (e) => {
      this.blob = e.data;
      this.dispatchEvent(new Event('done'));
    };
  }
  
  stop() {
    this.#recorder.stop();
  }
}