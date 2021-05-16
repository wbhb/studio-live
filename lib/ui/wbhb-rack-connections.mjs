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
  
  connect(srcElName, srcNodeName, dstElName, dstNodeName) {
    
    console.info(srcElName, srcNodeName, dstElName, dstNodeName);
    
    const srcEl = document.querySelector(`wbhb-rack-item[name="${srcElName}"]`);
    const dstEl = document.querySelector(`wbhb-rack-item[name="${dstElName}"]`);
    
    const src = srcEl.getIO(srcNodeName);
    const dst = dstEl.getIO(dstNodeName);
    
    src.node.connect(dst.node);
    this.connections.set(dst, src);
    
    this.drawConnection(src, dst);
  }
  
  drawConnection(src, dst, cachedBounds) {
    
    if (!this.#connected) {
      return;
    }
    
    const bounds = cachedBounds ?? this.getBoundingClientRect();
    
    // if (bounds.width != this.width) {
    //   this.width = bounds.width;
    // }
    
    // if (bounds.height != this.height) {
    //   this.height = bounds.height;
    // }
    
    const srcBounds = src.getBoundingClientRect();
    const dstBounds = dst.getBoundingClientRect();
    
    const srcX = srcBounds.x - bounds.x + (srcBounds.width / 2);
    const srcY = srcBounds.y - bounds.y + (srcBounds.height / 2);
    
    const dstX = dstBounds.x - bounds.x + (dstBounds.width / 2);
    const dstY = dstBounds.y - bounds.y + (dstBounds.height / 2);
    
    const cpX = srcX + (dstX - srcX) / 2;
    
    console.info(`this: ${this}
  srcXY:\t${srcX}, ${srcY}
  dstXY:\t${dstX}, ${dstY}
  cpX:\t${cpX}`);
    
    this.#context.strokeStyle = '#53565A';
    this.#context.lineWidth = '3';
    
    this.#context.beginPath();
    this.#context.moveTo(srcX, srcY);
    this.#context.bezierCurveTo(cpX, srcY, cpX, dstY, dstX, dstY);
    this.#context.stroke();
  }
  
  drawConnections(cachedBounds) {
    
    if (!this.#connected) {
      return;
    }
    
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
      this.drawConnection(src, dst, bounds);
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