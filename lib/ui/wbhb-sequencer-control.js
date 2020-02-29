
const html = `
<div class="toolbar">
  <div class="toolbar-button">
    <span class="material-icons">arrow_left</span>
    <span class="label">Left</span>
  </div>
  <div class="toolbar-button">
    <i class="material-icons">zoom_in</i>
    <span class="label">Zoom In</span>
  </div>
  <div class="toolbar-button">
    <span class="material-icons">zoom_out</span>
    <span class="label">Zoom Out</span>
  </div>
  <div class="toolbar-button">
    <span class="material-icons">arrow_right</span>
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

.underlay, .overlay, .content, .controls {
  display: grid;
  grid-template-columns: repeat(15, 10vmin);
  grid-auto-rows: 10vmin;
  transition: transform 0.1s ease-in-out;
  grid-auto-flow: dense;
}

.underlay, .overlay, .controls {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.overlay {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.overlay.active {
  visibility: visible;
  opacity: 1;
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

.min-size {
  grid-area: 1 / 1 / 2 / 2;
}

.cell {
  margin: 1vmin;
}

.overlay .cell, .underlay .cell, .controls .cell {
  border-radius: 2.5vmin;
  border: solid 2px var(--wbhb-color-black);
}

.overlay .cell {
  background-color: var(--wbhb-color-grey-trans);
  border-color: var(--wbhb-color-yellow);
}

.controls .cell {
  background-color: var(--wbhb-color-yellow-trans);
  border-color: var(--wbhb-color-yellow);
  
  grid-area: 1 / 1 / 2 / 3;
  
  padding: 1.5vmin;
}

.controls .left-grad {
  background: linear-gradient(to right, var(--wbhb-color-black) 19vmin, #00000000 21vmin);
  
  grid-area: 1 / 1 / -1 / 4;
}

.underlay .cell {
  border-color: var(--wbhb-color-grey);
}

.overlay .cell.target {
  background-color: var(--wbhb-color-yellow-trans);
}

:host(.scrub-left) .content, :host(.scrub-left) .underlay {
  animation-name: scrubLeft;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

@keyframes scrubLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(4 * -10vmin));
  }
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

export class WBHBSequencerControl extends HTMLElement {
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    return root;
  }
  
}

window.customElements.define('wbhb-sequencer-control', WBHBSequencerControl);