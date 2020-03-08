
const html = `
<div class="toolbar">
  <div class="toolbar-button"
    data-event="show-palette">
    <span class="icon material-icons">color_lens</span>
    <span class="label">Pallete</span>
  </div>
  <div class="toolbar-button"
    data-event="play">
    <span class="icon material-icons">play_arrow</span>
    <span class="label">Play</span>
  </div>
  <div class="toolbar-button disabled"
    data-event="pause">
    <span class="icon material-icons">pause</span>
    <span class="label">Pause</span>
  </div>
  <div class="toolbar-button"
    data-event="stop">
    <span class="icon material-icons">stop</span>
    <span class="label">Stop</span>
  </div>
  <div class="toolbar-button"
    data-event="scroll-left">
    <span class="icon material-icons">arrow_left</span>
    <span class="label">Left</span>
  </div>
  <div class="toolbar-button"
    data-event="zoom-out">
    <span class="icon material-icons">zoom_out</span>
    <span class="label">Zoom Out</span>
  </div>
  <div class="toolbar-button"
    data-event="zoom-in">
    <i class="icon material-icons">zoom_in</i>
    <span class="label">Zoom In</span>
  </div>
  <div class="toolbar-button"
    data-event="scroll-right">
    <span class="icon material-icons">arrow_right</span>
    <span class="label">Right</span>
  </div>
</div>
`;

const css = `
:host {
  position: relative;
  width: 100%;
}

@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://example.com/MaterialIcons-Regular.eot); /* For IE6-8 */
  src: local('Material Icons'),
    local('MaterialIcons-Regular'),
    url(https://example.com/MaterialIcons-Regular.woff2) format('woff2'),
    url(https://example.com/MaterialIcons-Regular.woff) format('woff'),
    url(https://example.com/MaterialIcons-Regular.ttf) format('truetype');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(10, 10vmin);
  grid-auto-rows: 10vmin;
  transition: transform 0.1s ease-in-out;
  grid-auto-flow: dense;
}

.schedule-item {
  margin: 1vmin;
  padding: 4vmin;
  border: solid 2px var(--wbhb-color-yellow);
  border-radius: 2.5vmin;
  display: flex;
  justify-content: left;
  align-items: center;
  background-color: var(--wbhb-color-black);
}

.toolbar-button {
  
  margin: 1vmin;
  
  border-radius: 2.5vmin;
  border: solid 2px var(--wbhb-color-black);
  
  background-color: var(--wbhb-color-yellow-trans);
  border-color: var(--wbhb-color-yellow);
  
  padding: 1.5vmin;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.toolbar-button .icon {
  font-size: 5vmin;
}

.toolbar-button .label {
  display: none;
}

.toolbar-button.disabled {
  color: var(--wbhb-color-grey);
  border-color: var(--wbhb-color-grey);
  background-color: var(--wbhb-color-grey-trans);
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

export class WBHBSequencerControlEvent extends Event {
  
  constructor(name) {
    
    super(`control-${name}`, {composed: true});
    
  }
}

export class WBHBSequencerControl extends HTMLElement {
  
  #playing = true;
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
  }
  
  connectedCallback() {
    this.setupListeners();
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    return root;
  }
  
  setupListeners() {
    let buttons = this.shadowRoot.querySelectorAll('.toolbar-button');
    
    for (let button of buttons) {
      
      button.addEventListener('click', (e) => {
        
        if (button.classList.contains('disabled')) {
          e.preventDefault();
          return;
        } else {
          let evt = new WBHBSequencerControlEvent(button.dataset.event);
          this.dispatchEvent(evt);
        }
      })
    }
  }
  
  get playing() {
    return this.#playing;
  }
  
  set playing(newValue) {
    this.#playing = newValue;
    
    if (this.playing) {
      this.shadowRoot.querySelector(".toolbar-button[data-event='play']").classList.add('disabled');
      this.shadowRoot.querySelector(".toolbar-button[data-event='pause']").classList.remove('disabled');
      this.shadowRoot.querySelector(".toolbar-button[data-event='stop']").classList.remove('disabled');
    } else {
      this.shadowRoot.querySelector(".toolbar-button[data-event='play']").classList.remove('disabled');
      this.shadowRoot.querySelector(".toolbar-button[data-event='pause']").classList.add('disabled');
      this.shadowRoot.querySelector(".toolbar-button[data-event='stop']").classList.add('disabled');
    }
  }
  
}

window.customElements.define('wbhb-sequencer-control', WBHBSequencerControl);