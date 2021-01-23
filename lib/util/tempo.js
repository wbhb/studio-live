import {TimeSignature} from './timeSignature.js';

const SecondsInMinute = 60.0;
const TapTimeout = 5000; // in milliSeconds

export class Tempo extends EventTarget {
    
    #beatTime;
    #timeSignature;
    #tapTimeout = null;
    #isTapping = false;
    
    constructor(options) {
        super();
        
        const config = options || {};
        
        if (config.timeSignature) {
            this.timeSignature = config.timeSignature;
        } else {
          this.timeSignature = new TimeSignature(4, 4);
        }
        
        if (config.BPM && config.beatTime) {
            throw new SyntaxError("Tempo cannot be created with 'BPM' and beatTime");
        }
        
        if (config.BPM) {
            this.BPM = config.BPM;
        }
        
        if (config.beatTime) {
            this.beatTime = config.beatTime;
        }
    }
    
    set BPM(newValue) {
        
        if (newValue <= 0) {
          throw new RangeError('BPM cannot be 0 or negative');
        }
      
        this.beatTime = SecondsInMinute / newValue;
    }
    
    get BPM() {
        let bpm = (1 / this.#beatTime) * SecondsInMinute;
        return Math.round(bpm * 100) / 100;
    }
    
    set beatTime(newValue) {
        
        if (newValue <= 0) {
          throw new RangeError('beat time cannot be 0 or negative');
        }
        
        this.#beatTime = newValue;
        const tempoChange = new CustomEvent('change', {detail: this.beatTime});
        this.dispatchEvent(tempoChange);
    }
    
    get beatTime() {
        return this.#beatTime;
    }
    
    get barTime() {
        return this.#beatTime * this.timeSignature.upper;
    }
    
    set timeSignature(newValue) {
      if (newValue instanceof TimeSignature) {
        this.#timeSignature = newValue;
      } else {
        throw new TypeError('timeSignature must be of type TimeSignature');
      }
    }
    
    get timeSignature() {
      return this.#timeSignature;
    }
    
    get isTapping() {
      return performance.getEntriesByName('tap', 'mark').length > 0;
    }
    
    tap() {
      
      const startTapTimeout = () => {
        this.#tapTimeout = setTimeout(() => {
          performance.clearMarks('tap');
        }, TapTimeout);
      };
      
      clearTimeout(this.#tapTimeout);
      
      performance.mark('tap');
      
      let deltas = [];
      
      const taps = performance.getEntriesByName('tap', 'mark');
      
      for (let i = 1; i < taps.length; i++) {
        deltas[i-1] = taps[i].startTime - taps[i-1].startTime;
      }
      
      if (deltas.length < 1) {
        startTapTimeout();
        return;
      }
      
      // average and standardDeviation based on https://gist.github.com/derickbailey/b7c6615ecf1fe9ad60a8#gistcomment-2721691
      
      const average = (data) => {return data.reduce((sum, value) => {return sum + value}, 0) / data.length};
      
      let avgTime = average(deltas);
      
      if (deltas.length > 2) {
      
        const standardDeviation = (values) => {return Math.sqrt(average(values.map((value) => {return (value - average(values)) ** 2})))};
        
        let stdDev = standardDeviation(deltas);
        
        deltas = deltas.filter((delta) => {
          return delta > avgTime - 2 * stdDev && delta < avgTime + 2 * stdDev;
        });
        
        if (deltas.length < 1) {
          startTapTimeout();
          return;
        }
        
        avgTime = average(deltas);
      }
      
      this.beatTime = avgTime / 1000;
      
      startTapTimeout();
   };
}