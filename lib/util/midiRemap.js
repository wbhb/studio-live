import {MIDI} from './midi.js';

export class MIDIRemap {
  
  maps;
  
  constructor(maps) {
    this.maps = new Set(maps.map((plain) => {return new MIDIRemap.ValueMapping(plain)}));
  }
  
  remap(message) {
    let rMessage = Object.assign(new MIDI.Message(), message);
    
    this.maps.forEach((el) => {
      el.run(rMessage)
    });
    
    return rMessage;
  }
  
  static ValueMapping = class ValueMapping {
    tests;
    maps;
    
    constructor(options) {
      this.tests = options.tests || [];
      if (options.test) {
        this.tests.push(options.test);
      }
      
      this.tests = this.tests.map(test => new MIDIRemap.ValueMapping.Test(test));
      
      this.maps = options.maps || [];
      if (options.map) {
        this.maps.push(options.map);
      }
      
      this.maps = this.maps.map(map => new MIDIRemap.ValueMapping.OutputMap(map));
    }
    
    run(message) {
      
      if (this.tests.every(t => t.run(message?.[t.inputParam]))) {
        this.maps.forEach(m => {
          message[m.outputParam] = m.run(message[m.outputParam])
        });
      }
    }
    
    static Test = class Test {
      inputParam;
      testMode;
      testValue;
      
      constructor(options) {
        this.inputParam = options.inputParam;
        this.testMode = options.testMode;
        this.testValue = options.testValue;
      }
      
      run(param) {
        return MIDIRemap.ValueMapping.Test.Modes.get(this.testMode)?.(param, this.testValue) || false;
      }
      
      static Modes = new Map([
        [
          '=', (a, b) => {return a == b;}
        ],
        [
          '!=', (a, b) => {return a != b;}
        ],
        [
          '<', (a, b) => {return a < b;}
        ],
        [
          '<=', (a, b) => {return a <= b;}
        ],
        [
          '>', (a, b) => {return a > b;}
        ],
        [
          '>=', (a, b) => {return a >= b;}
        ],
        [
          '*', (a, b) => {return true;}
        ]
      ]);
    }
    
    static OutputMap = class OutputMap {
      outputParam;
      mapMode;
      mapValue;
      
      constructor(options) {
        this.outputParam = options.outputParam;
        this.mapMode = options.mapMode;
        this.mapValue = options.mapValue;
      }
      
      run(param) {
        return MIDIRemap.ValueMapping.OutputMap.Modes.get(this.mapMode)?.(param, this.mapValue) || param;
      }
      
      static Modes = new Map([
        [
          '=', (a, b) => {return b;}
        ],
        [
          '+', (a, b) => {return a + b;}
        ],
        [
          '-', (a, b) => {return a - b;}
        ],
        [
          'f', (a, b) => {return b(a);}
        ]
      ]);
    }
  }
}