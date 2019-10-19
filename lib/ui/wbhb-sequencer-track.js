import {Length} from '../util/length.js';
import {SequencerItem} from '../sequencer/items/SequencerItem.js';

const html = `
<div class="underlay">
</div>
<div class="content">
</div>
<div class="controls">
  <div class="left-grad">
  </div>
  <div class="cell">
    <div id="name"></div>
  </div>
</div>
<div class="overlay" >
</div>
`;

const css = `
:host {
  position: relative;
  width: 100%;
}

.underlay, .overlay, .content, .controls {
  display: grid;
  grid-template-columns: repeat(11, 10vmin);
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

.content .cell {
  position: relative;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  transition: opacity 0.3s;
}

.content .cell[fading] {
  opacity: 0;
}

.content .cell .info{
  height: 8vmin;
  width: 8vmin;
  position: absolute;
  border-radius: 4vmin;
  background-color: var(--wbhb-color-black);
  border: solid 2px var(--wbhb-color-yellow);
  transition: transform 0.3s;
}

.content .cell[partial] .info {
  transform: translateX(10vmin) scale(0.5);
  border-width: 4px;
}

.content .cell[fading] .info {
  transform: scale(0.5);
}

.content .cell .length {
  width: 100%;
  height: 2.5vmin;
  border-radius: 1.25vmin;
  background-color: var(--wbhb-color-black);
  border: solid 2px var(--wbhb-color-yellow);
}

.underlay .cell {
  border-color: var(--wbhb-color-grey);
}

.overlay .cell.target {
  background-color: var(--wbhb-color-yellow-trans);
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

export class WBHBSequencerTrack extends HTMLElement {
  
  #connected = false;
  
  #boundListeners = {};
  #mutationObserver;
  
  #items = [];
  
  #defaultRows = 1;
  #defaultColumns = 8;
  
  #controlsWidth = 2;
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
  }
  
  _bindListeners() {
    this.#boundListeners.domchange = this._domchange.bind(this);
    this.#boundListeners.dragenter = this._dragenter.bind(this);
    this.#boundListeners.dragover = this._dragover.bind(this);
    this.#boundListeners.dragleave = this._dragleave.bind(this);
    this.#boundListeners.drop = this._drop.bind(this);
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
      
      this.setAttribute('filter', this.filter);
      
      this.rows = this.rows || this.#defaultRows;
      this.columns = this.columns || this.#defaultColumns;
      
    }
  }
  
  static get observedAttributes() {
    return ['rows', 'columns', 'name'];
  }
  
  setupListeners() {
    this.addEventListener('dragenter', this.#boundListeners.dragenter);
    this.addEventListener('dragover', this.#boundListeners.dragover);
    this.addEventListener('dragleave', this.#boundListeners.dragleave);
    this.addEventListener('drop', this.#boundListeners.drop);
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    let overlay = root.querySelector('.overlay');
    let underlay = root.querySelector('.underlay');
    
    for (let col = 0; col < this.columns; col++) {
      underlay.appendChild(this._renderUnderlayCell(col));
      
      for (let row = 0; row < this.rows; row++) {
        overlay.appendChild(this._renderOverlayCell(row, col));
      }
    }
    
    return root;
  }
  
  _renderOverlayCell(row, col) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.attributeStyleMap.set('grid-row-start', row + 1);
    cell.attributeStyleMap.set('grid-row-end', row + 2);
    cell.attributeStyleMap.set('grid-column-start', col + 1 + this.#controlsWidth);
    cell.attributeStyleMap.set('grid-column-end', col + 2 + this.#controlsWidth);
    cell.setAttribute('row', row);
    cell.setAttribute('column', col);
    
    return cell;
  }
  
  _renderUnderlayCell(col) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.attributeStyleMap.set('grid-row-start', 1);
    cell.attributeStyleMap.set('grid-row-end', this.rows + 1);
    cell.attributeStyleMap.set('grid-column-start', col + 1 + this.#controlsWidth);
    cell.attributeStyleMap.set('grid-column-end', col + 2 + this.#controlsWidth);
    cell.setAttribute('column', col);
    
    return cell;
  }
  
  _renderContentItem(col, width) {
    
    let startCol = Math.max(col + 1 + this.#controlsWidth - this.offset, this.#controlsWidth);
    let endCol = Math.min(col + width + 1 + this.#controlsWidth - this.offset, 1 + this.#controlsWidth + this.columns);
    
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.attributeStyleMap.set('grid-column-start', startCol);
    cell.attributeStyleMap.set('grid-column-end', endCol);
    cell.setAttribute('column', col);
    
    if (startCol == this.#controlsWidth) {
      cell.setAttribute('partial', '');
    }
    
    if (endCol == this.#controlsWidth + 1) {
      cell.setAttribute('fading', '');
    }
    
    const length = document.createElement('div');
    length.classList.add('length');
    
    const info = document.createElement('div');
    info.classList.add('info');
    
    cell.appendChild(length);
    cell.appendChild(info);
    
    return cell;
  }
  
  _domchange(mutationList) {
    for(var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        console.log(mutation);
      }
    }
  }
  
  _dragenter(e) {
    if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    } else {
      return false;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.classList.add('active');
  }
  
  _dragover(e) {
    if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    } else {
      return false;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.querySelectorAll('.target').forEach((el) => {
      el.classList.remove('target');
    });
    
    let gridHeight = overlay.computedStyleMap().get('grid-auto-rows').to('px').value;
    let col = Math.floor(e.offsetX / gridHeight) - this.#controlsWidth;
    let row = Math.floor(e.offsetY / gridHeight);
    
    overlay.querySelector(`.cell[row="${row}"][column="${col}"]`).classList.add('target');
  }
  
  _dragleave(e) {
    if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    } else {
      return false;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.classList.remove('active');
  }
  
  _drop(e) {
    if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    } else {
      return false;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.classList.remove('active');
    
    let gridHeight = overlay.computedStyleMap().get('grid-auto-rows').to('px').value;
    let col = Math.floor(e.offsetX / gridHeight) - this.#controlsWidth;
    let row = Math.floor(e.offsetY / gridHeight);
    
    overlay.querySelector(`.cell[row="${row}"][column="${col}"]`).classList.remove('target');
    
    const data = e.dataTransfer.getData(SequencerItem.mediaType);
    
    let item = SequencerItem.create(data);
    
    item.timings.offset = new Length(col, Length.units.beat);
    
    this.dispatchEvent(item);
  }
  
  set items(newValue) {
    
    this.#items = newValue;
    
    let content = this.shadowRoot.querySelector('.content');
    
    content.childNodes.forEach((el) => {content.removeChild(el)});
    
    let el = content.lastElementChild;
    while (el){
      content.removeChild(el);
      el = content.lastElementChild;
    }
    
    this.#items.slice()
      .sort((a, b) => {
        let offset = a.timings.offset.to(Length.units.beat).value - b.timings.offset.to(Length.units.beat).value;
        if (offset) {
          return offset;
        }
        return b.timings.length.to(Length.units.beat).value - a.timings.length.to(Length.units.beat).value;
      })
      .forEach((item) => {
        const offset = item.timings.offset.to(Length.units.beat).value;
        const length = item.timings.length.to(Length.units.beat).value;
        
        const el = this._renderContentItem(offset, length);
        
        content.appendChild(el);
      });
    
    let height = content.offsetHeight;
    let gridHeight = content.computedStyleMap().get('grid-auto-rows').to('px').value;
    this.rows = Math.round(height/gridHeight);
  }
  
  get items() {
    return this.#items;
  }
  
  set name(newValue) {
    this.setAttribute("name", newValue);
  }
  
  get name() {
    return this.getAttribute("name") || "";
  }
  
  set offset(newValue) {
    this.setAttribute("offset", newValue);
  }
  
  get offset() {
    return Number.parseInt(this.getAttribute("offset"), 10) || 0;
  }
  
  set rows(newValue) {
    this.setAttribute("rows", newValue);
  }
  
  get rows() {
    return Number.parseInt(this.getAttribute("rows"), 10) || 0;
  }
  
  set columns(newValue) {
    this.setAttribute("columns", newValue);
  }
  
  get columns() {
    return Number.parseInt(this.getAttribute("columns"), 10) || 0;
  }
  
  set filter(newValue) {
    this.setAttribute('filter', newValue);
  }
  
  get filter() {
    return this.getAttribute('filter');
  }
  
  _updateRows(newValue, oldValue) {
    
    newValue = Number.parseInt(newValue, 10) || 0;
    oldValue = Number.parseInt(oldValue, 10) || 0;
    const difference = newValue - oldValue;
    
    if (difference === 0) {
      // nothing needs changing
      return;
    }
    
    // adjust existing rows
    const underlay = this.shadowRoot.querySelector('.underlay');
    const overlay = this.shadowRoot.querySelector('.overlay');
    const controls = this.shadowRoot.querySelector('.controls');
    
    underlay.querySelectorAll('.cell')
      .forEach((el) => {
        el.attributeStyleMap.set('grid-row-end', newValue + 1)
      });
    
    controls.querySelectorAll('.left-grad')
      .forEach((el) => {
        el.attributeStyleMap.set('grid-row-end', newValue + 1)
      });
    
    // add new rows
    for (let row = oldValue; row < newValue; row++) {
      for (let col = 0; col < this.columns; col++) {
        overlay.appendChild(this._renderOverlayCell(row, col));
      }
    }
    
    if (difference < 0) {
      // remove excess rows
        
      Array.from(overlay.querySelectorAll('.cell'))
        .filter((el) => {
          return el.getAttribute('row') >= newValue;
        })
        .forEach((el) => {
          overlay.removeChild(el);
        });
    }
  }
  
  _updateColumns(newValue, oldValue) {
    
    newValue = Number.parseInt(newValue, 10) || 0;
    oldValue = Number.parseInt(oldValue, 10) || -1;
    const difference = newValue - oldValue;
    
    if (difference === 0) {
      // nothing needs changing
      return;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    const underlay = this.shadowRoot.querySelector('.underlay');
    
    // add new columns
    for (let col = oldValue; col < newValue + 1; col++) {
      for (let row = 0; row < this.rows; row++) {
        overlay.appendChild(this._renderOverlayCell(row, col));
      }
      underlay.appendChild(this._renderUnderlayCell(col));
    }
    
    if (difference < 0) {
      // remove excess rows
        
      Array.from(overlay.querySelectorAll('.cell'))
        .filter((el) => {
          return el.getAttribute('column') >= newValue;
        })
        .forEach((el) => {
          overlay.removeChild(el);
        });
        
      Array.from(underlay.querySelectorAll('.cell'))
        .filter((el) => {
          return el.getAttribute('column') >= newValue;
        })
        .forEach((el) => {
          underlay.removeChild(el);
        });
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "rows":
        this._updateRows(newValue, oldValue);
        break;
      case "columns":
        this._updateColumns(newValue, oldValue);
        break;
      case "name":
        this.shadowRoot.querySelector("#name").innerText = newValue;
        break;
    }
  }
  
}

window.customElements.define('wbhb-sequencer-track', WBHBSequencerTrack);