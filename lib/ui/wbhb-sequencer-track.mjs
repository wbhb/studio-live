import {Length} from '../util/length.mjs';
import {GLOBAL as GlobalScheduler, Scheduler} from '../scheduler/scheduler.mjs';
import {SequencerItem} from '../sequencer/items/SequencerItem.mjs';
import {SectionItem} from '../sequencer/items/SectionItem.mjs';
import {ItemDB} from '../sequencer/items/ItemDB.mjs';
import {WBHBSequencerItem} from './wbhb-sequencer-item.mjs';

const html = `
<div class="underlay">
</div>
<div class="content">
  <div class="min-size"></div>
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
  color: var(--wbhb-color-grey);
  padding: 1.25vmin;
  font-size: 1.25vmin;
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

:host(.scrub-right) .content, :host(.scrub-right) .underlay {
  animation-name: scrubRight;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: both;
}

@keyframes scrubRight {
  0% {
    transform: translateX(calc(4 * -10vmin));
  }
  100% {
    transform: translateX(0);
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

export class WBHBSequencerTrack extends HTMLElement {
  
  #connected = false;
  
  #boundListeners = {};
  #mutationObserver;
  
  #items = [];
  #flatItems = [];
  
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
      
      this.#mutationObserver = new MutationObserver(this.#boundListeners.domchange);
      
      this.setupListeners();
      
      this.#mutationObserver.observe(this, {
        childList: true
      });
      
      this.setAttribute('media-type', this.mediaType);
      
      this.rows = this.rows || this.#defaultRows;
      this.columns = this.columns || this.#defaultColumns;
      
    }
  }
  
  static get observedAttributes() {
    return ['rows', 'columns', 'name', 'offset'];
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
    
    for (let col = 0; col < this.columns + 8; col++) {
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
    
    cell.innerText = this.getCellText(col, this.offset);
    
    return cell;
  }
  
  getCellText(col, offset) {
    const barNum = Math.floor((col + offset) / GlobalScheduler.timeSignature.upper + 1);
    const beatNum = Math.floor((col + offset) % GlobalScheduler.timeSignature.upper + 1);
    
    return `${barNum}.${beatNum}`;
  }
  
  _renderContentItem(item, offset, options) {
    
    const cell = new WBHBSequencerItem(item);
    
    const rerender = (e) => {
      cell.item.timings.removeEventListener('change-length', rerender);
      cell.item.timings.removeEventListener('change-offset', rerender);
      cell.replaceWith(this._renderContentItem(cell.item, offset));
    };
    
    cell.item.timings.addEventListener('change-length', rerender);
    cell.item.timings.addEventListener('change-offset', rerender);
    
    return this._updateContentItem(cell, offset, options);
  }
  
  _renderContentItems(offset) {
    let content = this.shadowRoot.querySelector('.content');
    
    let el = content.querySelector('wbhb-sequencer-item');
    while (el){
      content.removeChild(el);
      el = content.querySelector('wbhb-sequencer-item');
    }
    
    this.#flatItems.forEach((item) => {
        
        const el = this._renderContentItem(item, offset);
        
        if (el) {
          content.appendChild(el);
          
          if (el.item instanceof SectionItem) {
            const item = el.item;
            if (item.repeats !== 1) {
              const length = item.timings.length?.to(Length.units.beat, {timeSignature: GlobalScheduler.timeSignature}).value;
              const maxRepeats = Math.ceil(this.columns / length);
              for (let i = 1; i < Math.min(item.repeats, maxRepeats); i++) {
                const el = this._renderContentItem(item, offset - length * i, {classList: ['repeat']});
          
                if (el) {
                  content.appendChild(el);
                }
              }
            }
          }
        }
      });
    
    let height = content.offsetHeight;
    let gridHeight = content.computedStyleMap().get('grid-auto-rows')?.to('px').value || 1;
    this.rows = Math.round(height/gridHeight);
  }
  
  _updateContentItem(cell, offset, options) {
    
    const col = cell.item.timings.offset.to(Length.units.beat, {timeSignature: GlobalScheduler.timeSignature}).value;
    const width = cell.item.timings.length.to(Length.units.beat, {timeSignature: GlobalScheduler.timeSignature}).value;
    
    let startCol = Math.max(col + 1 + this.#controlsWidth - offset, this.#controlsWidth);
    let endCol =  Math.max(
                    Math.min(
                      col + width + 1 + this.#controlsWidth - offset,
                      1 + this.#controlsWidth + this.columns
                    ),
                    startCol
                  );
    
    if (startCol === endCol) {
      return null;
    }
    
    cell.attributeStyleMap.set('grid-column-start', startCol);
    cell.attributeStyleMap.set('grid-column-end', endCol);
    cell.setAttribute('column', col);
    
    if (startCol <= this.#controlsWidth) {
      cell.setAttribute('partial', '');
    }
    
    if (endCol <= this.#controlsWidth + 1) {
      cell.setAttribute('fading', '');
    }
    
    options?.classList?.forEach((cl) => {cell.classList.add(cl)});
    
    return cell;
  }
  
  _updateContentItems(offset, options) {
    let content = this.shadowRoot.querySelector('.content');
    
    let cells = content.querySelectorAll('wbhb-sequencer-item');
    cells.forEach((cell) => {this._updateContentItem(cell, offset, options)});
  }
  
  _domchange(mutationList) {
    for(var mutation of mutationsList) {
      if (mutation.type == 'childList') {
        
      }
    }
  }
  
  _dragenter(e) {
    if (e.dataTransfer.types.includes(this.mediaType)) {
      e.preventDefault();
    } else {
      return;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.classList.add('active');
  }
  
  _dragover(e) {
    if (e.dataTransfer.types.includes(this.mediaType)) {
      e.preventDefault();
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.querySelectorAll('.target').forEach((el) => {
      el.classList.remove('target');
    });
    
    let gridHeight = overlay.computedStyleMap().get('grid-auto-rows').to('px').value;
    let col = Math.floor(e.offsetX / gridHeight) - this.#controlsWidth;
    let row = Math.floor(e.offsetY / gridHeight);
    
    const targetEl = overlay.querySelector(`.cell[row="${row}"][column="${col}"]`);
    
    if (targetEl) {
      targetEl.classList.add('target');
    }
  }
  
  _dragleave(e) {
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.classList.remove('active');
  }
  
  async _drop(e) {
    if (e.dataTransfer.types.includes(this.mediaType)) {
      e.preventDefault();
    } else {
      return;
    }
    
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    overlay.classList.remove('active');
    
    let gridHeight = overlay.computedStyleMap().get('grid-auto-rows').to('px').value;
    let col = Math.floor(e.offsetX / gridHeight) - this.#controlsWidth;
    let row = Math.floor(e.offsetY / gridHeight);
    
    const targetEl = overlay.querySelector(`.cell[row="${row}"][column="${col}"]`);
    
    if (targetEl) {
      targetEl.classList.remove('target');
    }
    
    let id = e.dataTransfer.getData(SequencerItem.mediaType);
    
    let item = ItemDB.get(id);
    
    item.timings.offset = new Length(col + this.offset, Length.units.beat);
    
    id = await ItemDB.set(item);
    
    this.dispatchEvent(item);
  }
  
  set items(newValue) {
    
    this.#items = newValue;
    
    this.#flatItems = this.items?.flat().map((id, index) => {
      let item = ItemDB.get(id);
      item.timings.offset.add(new Length(index, Length.units.bar), {timeSignature: GlobalScheduler.timeSignature});
      return item;
    }) || [];
    
    this._renderContentItems(this.offset);
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
  
  set mediaType(newValue) {
    this.setAttribute('media-type', newValue);
  }
  
  get mediaType() {
    return this.getAttribute('media-type');
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
        el.attributeStyleMap.set('grid-row-end', newValue + 1);
      });
    
    controls.querySelectorAll('.left-grad')
      .forEach((el) => {
        el.attributeStyleMap.set('grid-row-end', newValue + 1);
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
  
  _updateOffset(newValue, oldValue) {
    
    // const newInt = Number.parseInt(newValue, 10) || 0;
    // const oldInt = Number.parseInt(oldValue, 10) || 0;
    
    const barLength = new Length(1, Length.units.bar).to(Length.units.second, {tempo: Scheduler.GLOBAL.tempo, timeSignature: Scheduler.GLOBAL.timeSignature}).value;
    
    const newInt = Number.parseInt(newValue, 10) || 0;
    const oldInt = Number.parseInt(oldValue, 10) || 0;
    // ((newInt, oldValue) => {
    //   const oldInt = Number.parseInt(oldValue, 10);
    //   if (oldInt > 0) return oldInt;
    //   if (newInt === 0) return -4;
    //   return 0;
    // })(newInt, oldValue);
    
    
    const content = this.shadowRoot.querySelector('.content');
    const underlay = this.shadowRoot.querySelector('.underlay');
    
    this.classList.remove('scrub-left');
    this.classList.remove('scrub-right');
    
    
    content.attributeStyleMap.set('animation-duration', CSS.s(barLength));
    underlay.attributeStyleMap.set('animation-duration', CSS.s(barLength));
    
    if (newInt > oldInt) {
      this.classList.add('scrub-left');
      
      Array.from(underlay.querySelectorAll('.cell'))
        .forEach((el) => {
          const col = el.attributeStyleMap.get('grid-column-start') - 1 - this.#controlsWidth;
          el.innerText = this.getCellText(col, oldInt);
          this._updateContentItems(oldInt);
        });
      
    } else if (newInt < oldInt) {
      this.classList.add('scrub-right');
      
      Array.from(underlay.querySelectorAll('.cell'))
        .forEach((el) => {
          const col = el.attributeStyleMap.get('grid-column-start') - 1 - this.#controlsWidth;
          el.innerText = this.getCellText(col, newInt);
          this._updateContentItems(newInt);
        });
    }
    
    const endListener = (e) => {
      
      if (e.target !== content) {
        return;
      }
      
      if (newInt > oldInt) {
        this.classList.remove('scrub-left');
        
        Array.from(underlay.querySelectorAll('.cell'))
          .forEach((el) => {
            const col = el.attributeStyleMap.get('grid-column-start') - 1 - this.#controlsWidth;
            el.innerText = this.getCellText(col, newInt);
            this._updateContentItems(newInt);
          });
        
      } else if (newInt < oldInt) {
        this.classList.remove('scrub-right');
        
        Array.from(underlay.querySelectorAll('.cell'))
          .forEach((el) => {
            const col = el.attributeStyleMap.get('grid-column-start') - 1 - this.#controlsWidth;
            el.innerText = this.getCellText(col, newInt);
          });
      }
      
      content.removeEventListener('animationend', endListener);
    };
    
    const cancelListener = (e) => {
      
      if (e.target !== content) {
        return;
      }
      
      content.removeEventListener('animationcancel', cancelListener);
    };
    
    content.addEventListener('animationend', endListener);
    content.addEventListener('animationcancel', cancelListener);
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
      case "offset":
        this._updateOffset(newValue, oldValue);
        break;
    }
  }
  
}

window.customElements.define('wbhb-sequencer-track', WBHBSequencerTrack);