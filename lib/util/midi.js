const A4 = 440;

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
  static System_Real_Time = Symbol("System Real-Time");
  
  constructor() {
    super();
    // navigator.permissions.request(
    //   ["midi"]
    // );
    
    navigator.requestMIDIAccess({sysex: false})
    .then((access) => {
  
      const inputs = access.inputs.values();
      const outputs = access.outputs.values();
      
      for (let input of inputs) {
        console.log(input.name, input.manufacturer, input.state);
        input.addEventListener('midimessage', (e) => {
          // console.info(input.name, input.manufacturer, input.state);
          
          const message = this.parseMessage(e.data);
          
          this.dispatchEvent(message);
        });
      }
      
      for (let output of outputs) {console.info(output)}
  
      access.addEventListener('statechange', (e) => {
        console.log(e.port.name, e.port.manufacturer, e.port.state);
      });
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
  
  static Message = class Message extends Event {
    
    constructor(plain, opts) {
      
      super('midi-message', opts);
      
      for (let prop in plain) {
        try {
          this[prop] = plain[prop];
        } catch (e) {
          
        }
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
  [0b1111, MIDI.System_Mode]
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
        ...MIDI_PARSERS.get(MIDI.Channel_Mode)
      };
    }
    
    return {
      "controllerNumber": controllerNumber,
      "value": data[1]
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