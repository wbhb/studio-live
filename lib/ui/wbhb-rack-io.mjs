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

:host(.target), :host(.dragging) {
  color: var(--wbhb-color-black);
  background-color: var(--wbhb-color-grey);
}

:host(.drop) {
  color: var(--wbhb-color-black);
  background-color: var(--wbhb-color-yellow);
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
    
    this.#bindListeners();
    
    this.setAttribute('draggable', 'true');
    
    if (this.config?.name) {
      this.setAttribute('name', this.config.name);
    }
  }
  
  #bindListeners() {
    this.#boundListeners.dragstart = this.#dragstart.bind(this);
    this.#boundListeners.dragenter = this.#dragenter.bind(this);
    this.#boundListeners.dragover = this.#dragover.bind(this);
    this.#boundListeners.dragleave = this.#dragleave.bind(this);
    this.#boundListeners.dragend = this.#dragend.bind(this);
    this.#boundListeners.drop = this.#drop.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.#setupListeners();
      
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
  
  #setupListeners() {
    this.addEventListener('dragstart', this.#boundListeners.dragstart);
    this.addEventListener('dragenter', this.#boundListeners.dragenter);
    this.addEventListener('dragover', this.#boundListeners.dragover);
    this.addEventListener('dragleave', this.#boundListeners.dragleave);
    this.addEventListener('dragend', this.#boundListeners.dragend);
    this.addEventListener('drop', this.#boundListeners.drop);
  }
  
  render() {
    let root = templateEl.content.cloneNode(true);
    
    root.querySelector('.name').textContent = this.config?.name;
    
    return root;
  }
  
  #dragstart(e) {
    if (e instanceof DragEvent) {
      
      // e.preventDefault();
      
      const parentName = this.getRootNode().host.name;
      
      let data = JSON.stringify({
        parentName: parentName,
        config: this.config
      });
      // e.dataTransfer.setData(this.item.mediaType, data);
      e.dataTransfer.setData("application/json", data);
      e.dataTransfer.effectAllowed = 'link';
      
      this.classList.add('dragging');
    }
  }
  
  #dragenter(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    // } else {
    //   return false;
    // }
    
    this.classList.add('target');
  }
  
  #dragover(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    // } else {
    //   return false;
    // }
    
    e.dataTransfer.dropEffect = "link"
    
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
  
  #dragleave(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    // } else {
    //   return false;
    // }
    
    // const overlay = this.shadowRoot.querySelector('.overlay');
    
    // overlay.classList.remove('active');
    this.classList.remove('target');
  }
  
  #dragend(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    // } else {
    //   return false;
    // }
    
    // const overlay = this.shadowRoot.querySelector('.overlay');
    
    // overlay.classList.remove('active');
    this.classList.remove('dragging');
    
    if (e.dataTransfer.dropEffect == 'link') {
      this.classList.add('drop');
      
      setTimeout(() => {this.classList.remove('drop');}, 500);
    }
  }
  
  #drop(e) {
    // if (e.dataTransfer.types.includes(SequencerItem.mediaType)) {
      e.preventDefault();
    // } else {
    //   return false;
    // }
    
    this.classList.remove('target');
    this.classList.add('drop');
    
    setTimeout(() => {this.classList.remove('drop');}, 500);
    
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (data.direction === this.config.direction) {
      console.error("Cannot conenct same directions");
    }
    
    const parentName = this.getRootNode().host.name;
    const nodeName = this.config.name;
    
    if (this.config.direction == 'input') {
      document.querySelector('#rack #connections').connect(data.parentName, data.config.name, parentName, nodeName);
    }
    
    if (this.config.direction == 'output') {
      document.querySelector('#rack #connections').connect(parentName, nodeName, data.parentName, data.config.name);
    }
    
    
    
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