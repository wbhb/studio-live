import {RackItem} from './RackItem.mjs';
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.mjs';
import {RecorderNode} from '../audio/recorder-node.mjs';

export class Recorder extends RackItem {
  
  #buffer;
  
  #recordNode = null;
  
  handle;
  #writer;
  
  constructor() {
    super({
      enabled: false,
      name: 'Recorder'
    });
    
    if (GlobalScheduler.audioContext) {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 6 * Float32Array.BYTES_PER_ELEMENT || 1000000);
    }
    
    GlobalScheduler.addEventListener('AudioContextChanged', () => {
      this.#buffer = new SharedArrayBuffer(GlobalScheduler.audioContext.sampleRate * 6 * Float32Array.BYTES_PER_ELEMENT || 1000000);
    }, {once: true});
    
    this.#recordNode = new RecorderNode(GlobalScheduler.audioContext, {
      sharedArrayBuffer: this.#buffer
    });
    
    this.addInput(this.#recordNode, {
      type: 'Audio',
      name: 'Audio In'
    });
    
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
    
    if (!this.enabled) {
      return;
    }
    
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
