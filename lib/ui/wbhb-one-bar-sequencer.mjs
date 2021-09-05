import {OneBarSequencer} from '../rack/OneBarSequencer.mjs';

const html = `

`;

const css = `
:host {
  margin: 0;
  padding: 0;
  width: 90vw;
  display: flex;
  flex-direction: column;
}

.track {
  display: flex;
  flex-direction: row;
}

.dot {
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 3px;
  border: solid 2px var(--wbhb-color-grey);
  background-color: var(--wbhb-color-black);
}

.dot.on {
  border-color: var(--wbhb-color-yellow);
  background-color: var(--wbhb-color-yellow);
}

.dot.off {
  border-color: var(--wbhb-color-grey);
  background-color: var(--wbhb-color-grey);
}

:host(.quarter) .track .dot,
:host(.eigth) .track .dot,
:host(.sixteenth) .track .dot {
  display: none;
}

:host(.quarter) .track .dot:nth-child(24n+1) {
  display: block;
}

:host(.eigth) .track .dot:nth-child(12n+1) {
  display: block;
}

:host(.sixteenth) .track .dot:nth-child(6n+1) {
  display: block;
}

`;

const template = `
${html}
<style>
  ${css}
</style>
`;

const templateEl = document.createElement('template');
templateEl.innerHTML = template;

export class WBHBOneBarSequencer extends HTMLElement {
  
  #connected = false;
  
  #sequencer;
  
  #boundListeners = {};
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
  }
  
  _bindListeners() {
    this.#boundListeners.clicked = this.#clicked.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.#setupListeners();
    }
  }
  
  #setupListeners() {
    this.addEventListener('click', this.#boundListeners.clicked);
  }
  
  render() {
    return templateEl.content.cloneNode(true);
  }
  
  set sequencer(sequencer) {
    
    let delTrackEl;
    
    while (delTrackEl = this.shadowRoot.querySelector('.track')) {
      this.shadowRoot.removeChild(delTrackEl);
    }
    
    this.#sequencer = sequencer;
    
    for (const [note, track] of this.sequencer.tracks) {
      const trackEl = document.createElement('div');
      trackEl.classList.add('track');
      trackEl.setAttribute('wbhb-note', note);
      
      track.forEach((dot, i) => {
        const dotEl = document.createElement('div');
        dotEl.classList.add('dot');
        switch (dot) {
          case OneBarSequencer.states.on:
            dotEl.classList.add('on');
            break;
          case OneBarSequencer.states.off:
            dotEl.classList.add('off');
            break;
        }
        dotEl.setAttribute('wbhb-index', i);
        trackEl.appendChild(dotEl);
      });
      
      this.shadowRoot.appendChild(trackEl);
    }
  }
  
  get sequencer() {
    return this.#sequencer;
  }
  
  #clicked(evt) {
    const dotEl = evt.composedPath().find((el) => {
      return el.classList?.contains('dot');
    });
    
    const trackEl = evt.composedPath().find((el) => {
      return el.classList?.contains('track');
    });
    
    if (!dotEl || !trackEl) {
      return;
    }
    
    const note = parseInt(trackEl.getAttribute('wbhb-note'), 10);
    const index = parseInt(dotEl.getAttribute('wbhb-index'), 10);
    
    if (dotEl.classList.contains('on')) {
      dotEl.classList.replace('on', 'off');
      this.sequencer.tracks.get(note)[index] = OneBarSequencer.states.off;
    } else if (dotEl.classList.contains('off')) {
      dotEl.classList.remove('off');
      this.sequencer.tracks.get(note)[index] = OneBarSequencer.states.blank;
    } else {
      dotEl.classList.add('on');
      this.sequencer.tracks.get(note)[index] = OneBarSequencer.states.on;
    }
  }
}

window.customElements.define('wbhb-one-bar-sequencer', WBHBOneBarSequencer);