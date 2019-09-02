const html = `
<div class="overlay">
  <div class="cell" style="grid-row-start: 01; grid-row-end: 02; grid-column-start: 01; grid-column-end: 02"></div>
  <div class="cell" style="grid-row-start: 02; grid-row-end: 03; grid-column-start: 01; grid-column-end: 02"></div>
  <div class="cell" style="grid-row-start: 03; grid-row-end: 04; grid-column-start: 01; grid-column-end: 02"></div>
  <div class="cell" style="grid-row-start: 04; grid-row-end: 05; grid-column-start: 01; grid-column-end: 02"></div>
  
  <div class="cell" style="grid-row-start: 01; grid-row-end: 02; grid-column-start: 02; grid-column-end: 03"></div>
  <div class="cell" style="grid-row-start: 02; grid-row-end: 03; grid-column-start: 02; grid-column-end: 03"></div>
  <div class="cell" style="grid-row-start: 03; grid-row-end: 04; grid-column-start: 02; grid-column-end: 03"></div>
  <div class="cell" style="grid-row-start: 04; grid-row-end: 05; grid-column-start: 02; grid-column-end: 03"></div>
  
  <div class="cell" style="grid-row-start: 01; grid-row-end: 02; grid-column-start: 03; grid-column-end: 04"></div>
  <div class="cell" style="grid-row-start: 02; grid-row-end: 03; grid-column-start: 03; grid-column-end: 04"></div>
  <div class="cell" style="grid-row-start: 03; grid-row-end: 04; grid-column-start: 03; grid-column-end: 04"></div>
  <div class="cell" style="grid-row-start: 04; grid-row-end: 05; grid-column-start: 03; grid-column-end: 04"></div>
  
  <div class="cell" style="grid-row-start: 01; grid-row-end: 02; grid-column-start: 04; grid-column-end: 05"></div>
  <div class="cell" style="grid-row-start: 02; grid-row-end: 03; grid-column-start: 04; grid-column-end: 05"></div>
  <div class="cell" style="grid-row-start: 03; grid-row-end: 04; grid-column-start: 04; grid-column-end: 05"></div>
  <div class="cell" style="grid-row-start: 04; grid-row-end: 05; grid-column-start: 04; grid-column-end: 05"></div>
  
  <div class="cell" style="grid-row-start: 01; grid-row-end: 02; grid-column-start: 05; grid-column-end: 06"></div>
  <div class="cell" style="grid-row-start: 02; grid-row-end: 03; grid-column-start: 05; grid-column-end: 06"></div>
  <div class="cell" style="grid-row-start: 03; grid-row-end: 04; grid-column-start: 05; grid-column-end: 06"></div>
  <div class="cell" style="grid-row-start: 04; grid-row-end: 05; grid-column-start: 05; grid-column-end: 06"></div>
</div>
`;

const css = `
:host {
  width: 0;
  height: 0;
  position: absolute;
  top: calc(var(--grid-size) * calc(3/8));
  left: calc(var(--grid-size) * calc(3/8));
}

.schedule-wrapper {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-auto-rows: 12.5vmin;
}

.schedule-wrapper, .schedule-wrapper > .overlay {
  /*width: 100vw;*/
  position: relative;
  display: grid;
  grid-template-columns: repeat(100, 25vmin);
  grid-auto-rows: 10vmin;
  transition: transform 0.1s ease-in-out;
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

/*.schedule-item.command {*/
/*  grid-row-start: 1;*/
/*  grid-row-end: 2;*/
/*}*/

.schedule-item.section {
  grid-row-start: 2;
  grid-row-end: 3;
}

.schedule-item.prompt {
  grid-row-start: 3;
  grid-row-end: 4;
}

.schedule-item.chord {
  grid-row-start: 4;
  grid-row-end: 5;
}

:host(.overlay) {
  position: absolute;
  z-index: 2;
  opacity: 0.5;
  transition: opacity 0.5s ease-in-out;
}

.schedule-wrapper > .overlay.hidden {
  z-index: -1;
  opacity: 0;
}

:host(.overlay .cell) {
  margin: 1vmin;
  background-color: var(--wbhb-color-grey);
  border-radius: 2.5vmin;
  border: solid 2px var(--wbhb-color-grey);
}

.schedule-wrapper > .overlay > .cell.target {
  border-color: var(--wbhb-color-yellow);
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

export class WBHBSequencer extends HTMLElement {
  
  #connected = false;
  
  #boundListeners = {};
  #mutationObserver;
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
  }
  
  _bindListeners() {
    this.#boundListeners.domchange = this._domchange.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.querySelectorAll('wbhb-sequencer-track').forEach((el) => {
        console.log(el);
      });
      
      this.#mutationObserver = new MutationObserver(this.#boundListeners.domchange);
      
      this.setupListeners();
      
      this.#mutationObserver.observe(this, {
        childList: true
      });
    }
  }
  
  setupListeners() {
  }
  
  render() {
    return templateEl.content.cloneNode(true);
  }
  
  _domchange(mutationList) {
    for(var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        console.log(mutation);
      }
    }
  }
  
}

window.customElements.define('wbhb-sequencer', WBHBSequencer);