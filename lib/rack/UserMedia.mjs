import {RackItem} from './RackItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';

export class UserMedia extends RackItem {
  
  #deviceId = 'default';
  #channel = 0;
  
  #inputNode = null;
  #splitter = null;
  #analyserNode = null;
  
  monitorNode = null;
  outputNode = null;
  
  constructor() {
    super({
      enabled: false,
      name: 'User Media'
    });
    
    this.#analyserNode = new AnalyserNode(GlobalScheduler.audioContext);
    
    this.monitorNode = new GainNode(GlobalScheduler.audioContext);
    this.outputNode = new GainNode(GlobalScheduler.audioContext);
    
    this.#analyserNode.connect(this.monitorNode);
    this.#analyserNode.connect(this.outputNode);
    
    this.addOutput(this.outputNode, {
      type: 'Audio',
      name: 'Main Out'
    });
    
    this.addOutput(this.monitorNode, {
      type: 'Audio',
      name: 'Monitor Out'
    });
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
  
  async open() {
    this.#inputNode = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: this.deviceId
        }
      }).then((stream) => {
          // return GlobalScheduler.audioContext.createMediaStreamTrackSource(stream.getAudioTracks()[0]);
          return new MediaStreamAudioSourceNode(GlobalScheduler.audioContext, {mediaStream: stream});
      });
    
    this.#splitter = new ChannelSplitterNode(GlobalScheduler.audioContext, {numberOfOutputs: this.#inputNode.numberOfOutputs});
    
    this.#inputNode.connect(this.#splitter);
    
    this.#splitter.connect(this.#analyserNode, 0, this.channel);
  }
  
  async close() {
    this.#splitter.connect(this.#analyserNode);
    this.#inputNode.disconnect(this.#splitter);
    this.#inputNode = null;
  }
  
  set enabled(val) {
    if (val) {
      this.open().then(()=> {
        super.enabled = val;
      });
    } else {
      super.enabled = val;
    }
  }
  
  get enabled() {
    return super.enabled;
  }
}