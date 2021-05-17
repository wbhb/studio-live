const html = `
<div class="name">
</div>
<div class="disconnect hidden">
  <span class="icon material-icons">close</span>
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
  font-size: 2vmin;
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

.name {
  font-size: 1vmin;
  text-align: center;
}

.disconnect {
  color: var(--wbhb-color-white);
  background-color: var(--wbhb-color-black);
  border: solid 2px var(--wbhb-color-yellow);
  border-radius: 50%;
  width: 2vmin;
  height: 2vmin;
  position: absolute;
  bottom: -0.5vmin;
  right: -0.5vmin;
  
  display: none;
  
  justify-content: center;
  align-items: center;
}

:host(:hover) .disconnect:not(.hidden) {
  display: flex;
}

.hidden {
  display: none;
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
    this.#boundListeners.disconnect = this.disconnect.bind(this);
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
  
  get mediaType() {
    return `application/x.wbhb.studio.rackio.${this.config.type.toLowerCase()}`;
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
      
      e.dataTransfer.setData(this.mediaType, data);
      e.dataTransfer.effectAllowed = 'link';
      
      this.classList.add('dragging');
    }
  }
  
  #dragenter(e) {
    if (e.dataTransfer.types.includes(this.mediaType)) {
      e.preventDefault();
    } else {
      return false;
    }
    
    this.classList.add('target');
  }
  
  #dragover(e) {
    if (e.dataTransfer.types.includes(this.mediaType)) {
      e.preventDefault();
    } else {
      return false;
    }
    
    e.dataTransfer.dropEffect = "link";
  }
  
  #dragleave(e) {
    if (e.dataTransfer.types.includes(this.mediaType)) {
      // e.preventDefault();
    } else {
      return false;
    }
    
    this.classList.remove('target');
  }
  
  #dragend(e) {
    
    e.preventDefault();
    
    this.classList.remove('dragging');
    
    if (e.dataTransfer.dropEffect == 'link') {
      this.classList.add('drop');
      const disconnectEl = this.shadowRoot.querySelector('.disconnect');
      disconnectEl.classList.remove('hidden');
      
      disconnectEl.addEventListener('click', this.#boundListeners.disconnect);
      
      setTimeout(() => {this.classList.remove('drop');}, 500);
    }
  }
  
  #drop(e) {
    if (!e.dataTransfer.types.includes(this.mediaType)) {
      return;
    }
    
    const data = JSON.parse(e.dataTransfer.getData(this.mediaType));
    
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
    
    this.classList.remove('target');
    this.classList.add('drop');
    
    const disconnectEl = this.shadowRoot.querySelector('.disconnect');
    disconnectEl.classList.remove('hidden');
    disconnectEl.addEventListener('click', this.#boundListeners.disconnect);
    
    setTimeout(() => {this.classList.remove('drop');}, 500);
  }
  
  disconnect() {
    console.log('need to add disconnect method');
    const disconnectEl = this.shadowRoot.querySelector('.disconnect');
    disconnectEl.classList.add('hidden');
    disconnectEl.removeEventListener('click', this.#boundListeners.disconnect);
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