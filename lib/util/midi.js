const A4 = 440;

export class MIDI extends EventTarget {
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
          
          const command = MIDI_COMMANDS.get(e.data[0] >> 4);
          const channel = e.data[0] & 0x0f;
          const data = e.data.slice(1);
          
          console.info(`Command: ${command}
          Channel: ${channel}
          Data: ${data}
          `);
          
          const evt = new Event('midi');
          
          evt.command = command;
          evt.channel = channel;
          evt.data = data;
          
          this.dispatchEvent(evt);
        });
      };
      for (let output of outputs) {console.info(output)};
  
      access.addEventListener('statechange', (e) => {
        console.log(e.port.name, e.port.manufacturer, e.port.state);
      });
    });
  }
  
  static getNoteFrequency(note) {
    return Math.pow(2, (note - 69) / 12) * A4;
  }
}

const MIDI_COMMANDS = new Map([
  [0b1000, "Note Off"],
  [0b1001, "Note On"],
  [0b1010, "Polyphonic Key Pressure"],
  [0b1011, "Control Change"],
  [0b1100, "Program Change"],
  [0b1101, "Channel Pressure"],
  [0b1110, "Pitch Bend Change"]
]);