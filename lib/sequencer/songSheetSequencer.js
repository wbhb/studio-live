import {Sequencer} from "./sequencer.js";
import {GLOBAL as GlobalScheduler} from '../scheduler/scheduler.js';

export class SongSheetSequencer extends Sequencer {
  
  constructor(config) {
    super(config);
    
    this._currentBar = 0;
    this._currentBeat = 1;
    
    this._items = [];
  }
  
  _setupEventListeners() {
    super._setupEventListeners();
    GlobalScheduler.addEventListener("song", this._startSong.bind(this));
  }
  
  set song(newValue) {
    this.items = this._parseSong(newValue);
  }
  
  set items(newValue) {
    this._items = this._parseTimings(newValue);
    const evt = new CustomEvent("itemsUpdated", {detail: {item: {
      items: this._items
    }}});
    GlobalScheduler.dispatchEvent(evt);
  }
  
  get items() {
    return this._items;
  }
  
  _nextBar() {
    
    this._items.forEach((item) => {
      // const maxBeat = this._currentBeat + GlobalScheduler.timeSignature.upper + 1;
      //if (item.beat >= this._currentBeat && item.beat < maxBeat) {
      if (item.bar == this._currentBar) {
        const evt = new window.CustomEvent('scheduleItem', {
          detail: {
            item
          }
        });
        GlobalScheduler.dispatchEvent(evt);
      }
    });
    
    this._currentBar++;
    this._currentBeat = 1;
  }
  
  async _startSong(e) {
    
    let stop = new CustomEvent("command", { detail: { item: {
          type: "command",
          command: "stop",
          immediate: true
        }
      }
    });
    GlobalScheduler.dispatchEvent(stop);
    
    this.items = await this._parseSong(e.detail.item.song);
    
    let start = new CustomEvent("start");
    GlobalScheduler.dispatchEvent(start);
  }
  
  _start() {
    console.log(`start`);
    this._currentBeat = 1;
    this._currentBar = 0;
    this._nextBar();
  }
  
  _stop() {
    this._currentBeat = 1;
    this._currentBar = 0;
  }
  
  async _cleanItem(item, parentId) {
    let _item = Object.assign({}, item);
    let id = await this._createId(_item);
    if (parentId) {
      id = `${parentId}.${id}`;
    }
    _item.id = id;
    return _item;
  }
  
  async _parseSong(song, parentId) {
    let items = [];
    
    for (let i = 0; i < song.items.length; i++) {
      let item = song.items[i];
      if (item.type === "section") {
        item.id = await this._createId(item, parentId);
        let sectionItems = await this._parseSong(song.sections[item.section.name], item.id);
        const repeats = item.section.repeat || 1;
        for (let j = 0; j < repeats; j++) {
          sectionItems.forEach((sectionItem) => {
            items.push(this._cleanItem(sectionItem, item.id));
          });
        }
      }
      items.push(this._cleanItem(item));
      
    }
    
    return Promise.all(items);
  }
  
  _parseTimings(items) {
    
    let currentBar = 1;
    let currentBeatsInBar = GlobalScheduler.timeSignature.upper;
    let currentBeat = 1;
    
    items.forEach((item) => {
      // console.log(item.id);
      if (item.type == "command" && item.command == "timeSignature") {
        currentBeatsInBar = item.timeSignature.upper;
      }
      item.bar = currentBar + (item.barOffset || 0);
      item.beat = currentBeat + (item.beatOffset || 0);
      if (item.length) {
        for (let unit in item.length) {
          switch (unit) {
            case "bar":
              currentBar += item.length["bar"] + (item.barOffset || 0);
              break;
            case "beat":
              currentBeat += item.length["beat"] + (item.beatOffset || 0);
              if (currentBeat > currentBeatsInBar) {
                currentBar++;
                currentBeat = 1;
              }
              break;
            default:
              console.warn("unknown unit");
          }
        }
      }
    });
    
    return items;
  }
  
  async _createId(item) {
    if (item.id) {
      return item.id;
    }
    let encodedItem = new TextEncoder().encode(JSON.stringify(item));
    let digest = await crypto.subtle.digest('SHA-256', encodedItem);
    
    const byteArray = new Uint8Array(digest);

    const hexCodes = [...byteArray.slice(-4)].map((value) => {
      const hexCode = value.toString(16);
      const paddedHexCode = hexCode.padStart(2, '0');
      return paddedHexCode;
    });

    return hexCodes.join('');
    
  }
}

const sampleSong = {
  "items": [
    {
      "type": "command",
      "bar": 0,
      "command": "timeSignature",
      "timeSignature": {
        "upper": 6,
        "lower": 8
      }
    }, {
      "type": "command",
      "bar": 0,
      "command": "tempo",
      "tempo": {
        "bpm": 120
      }
    }, {
      "type": "prompt",
      "bar": 1,
      "beat": 1,
      "prompt": {
        "name": "Intro"
      },
      "count": true
    }, {
      "type": "prompt",
      "bar": 5,
      "beat": 1,
      "prompt": {
        "name": "Intro"
      },
      "count": true
    }, {
      "type": "prompt",
      "bar": 9,
      "beat": 1,
      "prompt": {
        "name": "Chorus"
      },
      "count": true
    }, {
      "type": "prompt",
      "bar": 13,
      "beat": 1,
      "prompt": {
        "name": "Ending"
      },
      "count": true
    }, {
      "type": "command",
      "bar": 14,
      "beat": 1,
      "command": "stop"
    }
  ]
};