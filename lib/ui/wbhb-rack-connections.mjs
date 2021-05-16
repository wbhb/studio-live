const css = `
:host {
  position: absolute;
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

export class WBHBRackConnections extends HTMLCanvasElement {
  
  #connected = false;
  
  #boundListeners = {};
  
  #context;
  
  #connections = new Map();
  
  constructor(node, config) {
    super();
    
    this._bindListeners();
  }
  
  _bindListeners() {
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
      
      this.setupListeners();
      
      this.#context = this.getContext('2d');
      
      const bounds = this.getBoundingClientRect();
      
      this.width = bounds.width;
      this.height = bounds.height;
      
      this.drawConnections(bounds);
      
    }
  }
  
  // static get observedAttributes() {
  //   return ['width', 'height'];
  // }
  
  setupListeners() {
  }
  
  get connections() {
    return this.#connections;
  }
  
  drawConnections(cachedBounds) {
    const bounds = cachedBounds ?? this.getBoundingClientRect();
    
    if (bounds.width != this.width) {
      this.width = bounds.width;
    }
    
    if (bounds.height != this.height) {
      this.height = bounds.height;
    }
    
    this.#context.clearRect(0, 0, this.width, this.height);
    this.#context.strokeStyle = '#53565A';
    this.#context.lineWidth = '3';
    
    this.connections.forEach((src, dst) => {
      const srcBounds = src.getBoundingClientRect();
      const dstBounds = dst.getBoundingClientRect();
      
      const srcX = srcBounds.x - bounds.x + (srcBounds.width / 2);
      const srcY = srcBounds.y - bounds.y + (srcBounds.height / 2);
      
      const dstX = dstBounds.x - bounds.x + (dstBounds.width / 2);
      const dstY = dstBounds.y - bounds.y + (dstBounds.height / 2);
      
      const cpX = srcX + (dstX - srcX) / 2;
      
      this.#context.beginPath();
      this.#context.moveTo(srcX, srcY);
      this.#context.bezierCurveTo(cpX, srcY, cpX, dstY, dstX, dstY);
      this.#context.stroke();
    });
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

window.customElements.define('wbhb-rack-connections', WBHBRackConnections, {extends: 'canvas'});