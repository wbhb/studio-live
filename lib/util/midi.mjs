const A4 = 440;
import {MIDIRemap} from './midiRemap.mjs';

export class MIDI extends EventTarget {
  
  static Note_Off = Symbol("Note Off");
  static Note_On = Symbol("Note On");
  static Polyphonic_Key_Pressure = Symbol("Polyphonic Key Pressure");
  static Control_Change = Symbol("Control Change");
  static Program_Change = Symbol("Program Change");
  static Channel_Pressure = Symbol("Channel Pressure");
  static Pitch_Bend_Change = Symbol("Pitch Bend Change");
  
  static Channel_Voice = Symbol("Channel Voice");
  static Channel_Mode = Symbol("Channel Mode");
  static System_Common = Symbol("System Common");
  static System_Real_Time = Symbol("System Real Time");
  
  static All_Sound_Off = Symbol("All Sound Off");
  static Reset_All_Controllers = Symbol("Reset All Controllers");
  static Local_Control_Off = Symbol("Local Control Off");
  static Local_Control_On = Symbol("Local Control On");
  static All_Notes_Off = Symbol("All Notes Off");
  static Omni_Mode_Off = Symbol("Omni Mode Off");
  static Omni_Mode_On = Symbol("Omni Mode On");
  static Mono_Mode_On = Symbol("Mono Mode On");
  static Poly_Mode_On = Symbol("Poly Mode On");
  
  static Timing_Clock = Symbol("Timing Clock");
  static Start = Symbol("Start");
  static Continue = Symbol("Continue");
  static Stop = Symbol("Stop");
  static Active_Sensing = Symbol("Active Sensing");
  static Reset = Symbol("Reset");
  
  static CLOCKS_PER_BEAT = 24;
  
  remap = null;
  
  constructor(options) {
    super();
    // navigator.permissions.request(
    //   ["midi"]
    // );
    
    if (options?.remap) {
      this.remap = new MIDIRemap(options?.remap);
    }
    
    navigator.requestMIDIAccess({sysex: options?.sysex})
    .then((access) => {
      
      let inputs = Array.from(access.inputs.values());
      
      if (options?.inputs?.filter) {
        
        const filter = options?.inputs?.filter;
        
        inputs = inputs.filter((input) => {
          let pass = false;
          
          if (filter.name) {
            if (input.name == filter.name) {
              pass = true;
            } else {
              return false;
            }
          }
          
          if (filter.manufacturer) {
            if (input.manufaturer == filter.manufaturer) {
              pass = true;
            } else {
              return false;
            }
          }
          
          return pass;
        });
      }
        
      for (let input of inputs) {
        
        input.addEventListener('midimessage', (e) => {
          
          const event = new MIDI.Event(this.parseMessage(e.data));
          
          if (this.remap) {
            event.message = this.remap.remap(event.message);
          }
          
          this.dispatchEvent(event);
        });
      }
    });
  }
  
  static getNoteFrequency(note) {
    return Math.pow(2, (note - 69) / 12) * A4;
  }
  
  parseMessage(message) {
    let output = {
      status: message[0],
      data: message.slice(1),
      method: MIDI.getMethod(message[0])
    };
    
    if (output.method === MIDI.Channel_Voice) {
      output.command = MIDI_COMMANDS.get(output.status >> 4);
      output.channel = output.status & 0x0f;
    } else {
      output.command = MIDI_COMMANDS.get(output.status);
    }
    
    if (output.method !== MIDI.System_Real_Time) {
      output = {...MIDI_PARSERS.get(output.command)(output.data), ...output};
    }
    
    if (output.method === MIDI.System_Real_Time) {
      output.command = MIDI_COMMANDS.get(output.status);
    }
    
    return new MIDI.Message(output);
  }
  
  /* 
   * getMethod will not return "Channel Mode" - this is to be handled in the "Control Change" parser. "Channel Voice" will be returned instead
   */
  static getMethod(status) {
    if (status >> 4 !== 0b1111) {
      return MIDI.Channel_Voice;
    } else {
      if (status & 0b00001000 === 0b00001000) {
        return MIDI.System_Real_Time;
      } else {
        return MIDI.System_Common
      }
    }
  }
  
  static Event = class MIDIEvent extends Event {
    constructor(message, opts) {
      super('midi-message', opts);
      
      this.message = new MIDI.Message(message);
    };
  }
  
  static Message = class Message {
    
    constructor(plain, opts) {
      
      class ReplaceSymbol {
        [Symbol.replace](string) {
          return `s/Symbol\(()\)/${this.value}/g`;
        }
      }
      
      for (let prop in plain) {
        try {
          if (typeof plain[prop] === "string" && plain[prop].startsWith('Symbol(')) {
            this[prop] = MIDI[plain[prop].replace(/Symbol\(([\w\s]+)\)/, '$1').replace(' ', '_')];
          } else {
            this[prop] = plain[prop];
          }
        } catch (e) {
          
        }
      }
    }
    
    static get mediaType() {
      return `application/x.wbhb.studio.midi.message`;
    }

    toJSON(key) {
      
      let plain = {};
      
      for (let prop in this) {
        if (typeof this[prop] === 'symbol') {
          plain[prop] = this[prop].toString();
        } else {
          plain[prop] = this[prop];
        }
      }
      
      return plain;
    }
    
    toString() {
      if (this.command === MIDI.Note_On) {
        return `${this.note} On`;
      }
      if (this.command === MIDI.Note_Off) {
        return `${this.note} Off`;
      }
    }
  }
}

const MIDI_COMMANDS = new Map([
  [0b1000, MIDI.Note_Off],
  [0b1001, MIDI.Note_On],
  [0b1010, MIDI.Polyphonic_Key_Pressure],
  [0b1011, MIDI.Control_Change],
  [0b1100, MIDI.Program_Change],
  [0b1101, MIDI.Channel_Pressure],
  [0b1110, MIDI.Pitch_Bend_Change],
  [0b1111, MIDI.System_Mode],
  [0b11111000, MIDI.Timing_Clock],
  [0b11111001, undefined],
  [0b11111010, MIDI.Start],
  [0b11111011, MIDI.Continue],
  [0b11111100, MIDI.Stop],
  [0b11111101, undefined],
  [0b11111110, MIDI.Active_Sensing],
  [0b11111111, MIDI.Reset]
]);

const MIDI_PARSERS = new Map([
  [MIDI.Note_Off, (data) => {
    return {
      "note": data[0],
      "velocity": data[1]
    };
  }],
  [MIDI.Note_On, (data) => {
    return {
      "note": data[0],
      "velocity": data[1]
    };
  }],
  [MIDI.Polyphonic_Key_Pressure, (data) => {
    return {
      "note": data[0],
      "pressure": data[1]
    };
  }],
  [MIDI.Control_Change, (data) => {
    
    const controllerNumber = data[0];
    
    if (controllerNumber >= 120) {
      return {
        'method': MIDI.Channel_Mode,
        ...MIDI_PARSERS.get(MIDI.Channel_Mode)(data)
      };
    }
    
    return {
      "controllerNumber": controllerNumber,
      "value": data[1]
    };
  }],
  [MIDI.Channel_Mode, (data) => {
    
    let command, value;
    switch (data[0]) {
      case 120:
        command = MIDI.All_Sound_Off;
        break;
      case 121:
        command = MIDI.Reset_All_Controllers;
        value = data[1];
        if (value !== 0) {
          console.warn(`Unexpected value for MIDI.Reset_All_Controllers`);
        }
        break;
      case 122:
        value = data[1];
        switch (value) {
          case 0:
            command = MIDI.Local_Control_Off;
            break;
          case 127:
            command = MIDI.Local_Control_On;
            break;
          default:
            throw new Error('Invalid value for Local Control');
        }
        break;
      case 123:
        command = MIDI.All_Notes_Off;
        break;
      case 124:
        command = MIDI.Omni_Mode_Off;
        break;
      case 125:
        command = MIDI.Omni_Mode_On;
        break;
      case 126:
        command = MIDI.Mono_Mode_On;
        value = data[1]; 
        break;
      case 127:
        command = MIDI.Poly_Mode_On;
        break;
    }
    
    return {
      "command": command,
      "value": value
    }
  }],
  [MIDI.Program_Change, (data) => {
    return {
      "programNumber": data[0]
    }
  }],
  [MIDI.Channel_Pressure, (data) => {
    return {
      "pressure": data[0] 
    }
  }],
  [MIDI.Pitch_Bend_Change, (data) => {
    
    let value = data[1] << 7 | data[0];
    value -= 0x2000;
    
    return {
      "value": value
    }
  }]
]);