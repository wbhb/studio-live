import {WBHBRackIO} from './wbhb-rack-io.mjs';

const html = `
<div class="inputs">
</div>
<div class="main">
  <div class="info">
    <h2 id="name"></h2>
  </div>
  <div class="controls">
    <div>
      <input type="checkbox" id="enabled" name="enabled" value="enabled" />
      <label for="enabled">Enabled</label>
    </div>
    <div>
      <input type="range" id="level" name="level" value="1.0" min="0" max="2" step="any" />
      <label for="level">Output Level</label>
    </div>
  </div>
</div>
<div class="outputs">
</div>
`;

const css = `
:host {
  position: relative;
  margin: 2.5vmin;
  border-radius: 5vmin;
  border: solid 2px var(--wbhb-color-yellow);
  display: flex;
}

.inputs, .main, .outputs {
  display: flex;
  flex-direction: column;
}

.inputs, .outputs {
  width: 5vmin;
  margin-left: -2.5vmin;
  margin-right: -2.5vmin;
}

.main {
  width: 100%;
  padding: 5vmin;
  padding-top: 0;
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

export class WBHBRackItem extends HTMLElement {
  
  #connected = false;
  
  #boundListeners = {};
  
  #rackItem = undefined;
  
  constructor(rackItem) {
    super();
    
    this.#rackItem = rackItem;
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
    
    this.setAttribute('name', this.rackItem.name);
  }
  
  _bindListeners() {
    this.#boundListeners.dragenter = this._dragenter.bind(this);
    this.#boundListeners.dragover = this._dragover.bind(this);
    this.#boundListeners.dragleave = this._dragleave.bind(this);
    this.#boundListeners.drop = this._drop.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.setupListeners();
      
    }
  }
  
  // static get observedAttributes() {
  //   return ['rows', 'columns', 'name', 'offset'];
  // }
  
  get rackItem() {
    return this.#rackItem;
  }
  
  get name() {
    return this.getAttribute('name');
  }
  
  setupListeners() {
    this.addEventListener('dragenter', this.#boundListeners.dragenter);
    this.addEventListener('dragover', this.#boundListeners.dragover);
    this.addEventListener('dragleave', this.#boundListeners.dragleave);
    this.addEventListener('drop', this.#boundListeners.drop);
    
    this.shadowRoot.querySelector('#enabled').addEventListener('change', (e) => {
      this.rackItem.enabled = e.target.checked;
    });
    
    this.shadowRoot.querySelector('#level').addEventListener('change', (e) => {
      this.rackItem.getNamedOutput('Main Out').node.gain.value = parseFloat(e.target.value);
    });
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    root.querySelector('#name').textContent = this.rackItem.name;
    root.querySelector('#enabled').checked = this.rackItem.enabled;
    
    const inputContainer = root.querySelector('.inputs');
    
    this.rackItem.inputs.forEach((config, node) => {
      const el = new WBHBRackIO(node, config);
      inputContainer.appendChild(el);
    });
    
    const outputContainer = root.querySelector('.outputs');
    
    this.rackItem.outputs.forEach((config, node) => {
      const el = new WBHBRackIO(node, config);
      outputContainer.appendChild(el);
    });
    
    return root;
  }
  
  getIO(name) {
    return this.shadowRoot.querySelector(`wbhb-rack-io[name="${name}"]`);
  }
  
  _dragenter(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
    //   e.preventDefault();
    // } else {
    //   return false;
    // }
    
    // const overlay = this.shadowRoot.querySelector('.overlay');
    
    // overlay.classList.add('active');
  }
  
  _dragover(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
    //   e.preventDefault();
    // } else {
    //   return false;
    // }
    
    // const overlay = this.shadowRoot.querySelector('.overlay');
    
    // overlay.querySelectorAll('.target').forEach((el) => {
    //   el.classList.remove('target');
    // });
    
    // let gridHeight = overlay.computedStyleMap().get('grid-auto-rows').to('px').value;
    // let col = Math.floor(e.offsetX / gridHeight) - this.#controlsWidth;
    // let row = Math.floor(e.offsetY / gridHeight);
    
    // const targetEl = overlay.querySelector(`.cell[row="${row}"][column="${col}"]`);
    
    // if (targetEl) {
    //   targetEl.classList.add('target');
    // }
  }
  
  _dragleave(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
    //   e.preventDefault();
    // } else {
    //   return false;
    // }
    
    // const overlay = this.shadowRoot.querySelector('.overlay');
    
    // overlay.classList.remove('active');
  }
  
  _drop(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
    //   e.preventDefault();
    // } else {
    //   return false;
    // }
    
    // const overlay = this.shadowRoot.querySelector('.overlay');
    
    // overlay.classList.remove('active');
    
    // let gridHeight = overlay.computedStyleMap().get('grid-auto-rows').to('px').value;
    // let col = Math.floor(e.offsetX / gridHeight) - this.#controlsWidth;
    // let row = Math.floor(e.offsetY / gridHeight);
    
    // const targetEl = overlay.querySelector(`.cell[row="${row}"][column="${col}"]`);
    
    // if (targetEl) {
    //   targetEl.classList.remove('target');
    // }
    
    // const data = e.dataTransfer.getData(SequencerItem.mediaType);
    
    // let item = SequencerItem.create(data);
    
    // item.timings.offset = new Length(col + this.offset, Length.units.beat);
    
    // this.dispatchEvent(item);
  }
  
  // attributeChangedCallback(name, oldValue, newValue) {
  //   switch (name) {
  //     case "rows":
  //       this._updateRows(newValue, oldValue);
  //       break;
  //     case "columns":
  //       this._updateColumns(newValue, oldValue);
  //       break;
  //     case "name":
  //       this.shadowRoot.querySelector("#name").innerText = newValue;
  //       break;
  //     case "offset":
  //       this._updateOffset(newValue, oldValue);
  //       break;
  //   }
  // }
  
}

window.customElements.define('wbhb-rack-item', WBHBRackItem);