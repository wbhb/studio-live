const html = `
<div class="name">
</div>
`;

const css = `
:host {
  position: relative;
  border-radius: 2.5vmin;
  border: solid 2px var(--wbhb-color-yellow);
  background-color: var(--wbhb-color-black);
  width: 5vmin;
  height: 5vmin;
  margin-bottom: 1vmin;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name {
  font-size: 1vmin;
  text-align: center;
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

export class WBHBRackIO extends HTMLElement {
  
  #connected = false;
  
  #boundListeners = {};
  
  #node;
  #config;
  
  constructor(node, config) {
    super();
    
    this.#node = node;
    this.#config = config;
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this._bindListeners();
    
    this.setAttribute('draggable', '');
    
    if (this.config?.name) {
      this.setAttribute('name', this.config.name);
    }
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
  
  get node() {
    return this.#node;
  }
  
  get config() {
    return this.#config;
  }
  
  setupListeners() {
    this.addEventListener('dragenter', this.#boundListeners.dragenter);
    this.addEventListener('dragover', this.#boundListeners.dragover);
    this.addEventListener('dragleave', this.#boundListeners.dragleave);
    this.addEventListener('drop', this.#boundListeners.drop);
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    root.querySelector('.name').textContent = this.config?.name;
    
    return root;
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

window.customElements.define('wbhb-rack-io', WBHBRackIO);