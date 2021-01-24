import {WBHBTapTempo} from './wbhb-tap-tempo.mjs';
import {WBHBButton} from './wbhb-button.mjs';

const html = `
<div id='drag-widget' class='hidden' draggable='true'>
  <div id='dot'></div>
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

#drag-widget {
  contain: content;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: calc(var(--grid-size) / 4);
  height: calc(var(--grid-size) / 4);
  border-radius: 50%;
  border: solid 2px var(--wbhb-color-yellow);
  background-color: var(--wbhb-color-black);
  transform: rotate(30deg) translateY(calc(var(--grid-size) / -2)) rotate(-30deg);
}

#drag-widget.hidden {
  display: none;
}

#dot {
  width: calc(var(--grid-size) / 16);
  height: calc(var(--grid-size) / 16);
  background-color: var(--wbhb-color-white);
  border-radius: 50%;
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

export class WBHBAdjustTempo extends HTMLElement {
  
  tempo;
  
  #buttonEl;
  #buttonEl_plus;
  #buttonEl_minus;
  #tapEl;
  #dragWidget;
  
  #adjustStart = 0;
  #adjustStartBPM = 0;
  #adjust120 = 0;
  #connected = false;
  
  #boundListeners = {};
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this.#boundListeners.dragstart = this.dragstart.bind(this);
    this.#boundListeners.drag = this.drag.bind(this);
  }
  
  connectedCallback() {
    if (!this.#connected) {
      
      this.#connected = true;
    
      this.#buttonEl = document.createElement('wbhb-button');
      this.#buttonEl_plus = document.createElement('wbhb-button');
      this.#buttonEl_minus = document.createElement('wbhb-button');
      this.#tapEl = document.createElement('wbhb-tap-tempo');
      this.#dragWidget = this.shadowRoot.querySelector('#drag-widget');
      
      let parentEl = this.parentElement;
      
      parentEl.insertBefore(this.#buttonEl, this);
      this.#buttonEl.appendChild(this.#buttonEl_plus);
      this.#buttonEl.appendChild(this.#buttonEl_minus);
      this.#buttonEl.appendChild(this.#tapEl);
      
      this.querySelectorAll(':scope > wbhb-button').forEach((el) => {
        this.#buttonEl.appendChild(el);
      });
      
      this.#buttonEl.draggable = "true";
      this.#buttonEl.type = "BPM";
      this.#buttonEl.name = "Tempo";
      this.#buttonEl_plus.name = '\uFF0B';
      this.#buttonEl_minus.name = '\uFF0D';
      
      this.tempo = this.#tapEl.tempo;
      
      this.#buttonEl.appendChild(this);
      
      this.setupListeners();
    }
  }
  
  setupListeners() {
    this.tempo.addEventListener("change", (e) => {
      
      this.#dragWidget.classList.toggle('hidden', !this.tempo.BPM)
      
      if (this.tempo.BPM) {
        this.#buttonEl.name = Math.round(this.tempo.BPM);
      }
    });
    this.#buttonEl_plus.addEventListener("click", () => {
      this.tempo.BPM++;
    });
    this.#buttonEl_minus.addEventListener("click", () => {
      this.tempo.BPM--;
    });
    this.#buttonEl.querySelector('wbhb-button[type="Preset"]').querySelectorAll('wbhb-button[type="BPM"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        this.tempo.BPM = Number.parseInt(el.name, 10);
      });
    });
    this.#dragWidget.addEventListener("dragstart", this.#boundListeners.dragstart);
    this.#dragWidget.addEventListener("touchstart", (e) => {this.#boundListeners.dragstart(e.touches[0]);});
    this.#dragWidget.addEventListener("drag", this.#boundListeners.drag);
    this.#dragWidget.addEventListener("touchmove", (e) => {this.#boundListeners.drag(e.touches[0]);});
  }
  
  render() {
    return templateEl.content.cloneNode(true);
  }
  
  dragstart(e) {
    
    if (e instanceof DragEvent) {
      e.dataTransfer.setDragImage(document.createElement('image'), 0, 0);
    }
    
    this.#adjustStart = 0;
    this.#adjustStartBPM = this.tempo.BPM;
    this.#adjust120 = 0;
    
    const transforms = this.#dragWidget.attributeStyleMap.get('transform');
    
    for (const i in transforms) {
      if (transforms[i] instanceof CSSRotate) {
        this.#adjustStart = transforms[i].angle.to('deg').value;
        break;
      }
    }
  }
  
  drag(e) {
    const bounds = this.#buttonEl.getBoundingClientRect();
    const size = Math.max(bounds.width, bounds.height);
    const offsetX = e.screenX - (bounds.x + size / 2);
    const offsetY = e.screenY - (bounds.y + size / 2);
    const distance = size/2;
    let angle = -1 * Math.atan(offsetX / offsetY) * 180 / Math.PI;
    
    if (offsetY > 0) {
      angle = 180 + angle; 
    } else if (offsetX < 0) {
      angle = 360 + angle; 
    }
    
    let adjustAngle = angle;
    
    const inversionPoint = (this.#adjustStart + 180) % 360;
    if (inversionPoint > this.#adjustStart && adjustAngle > inversionPoint) {
      adjustAngle -= 360;
    }
    if (inversionPoint < this.#adjustStart && adjustAngle < inversionPoint) {
      adjustAngle += 360;
    }
    
    let delta = adjustAngle - this.#adjustStart + (120 * this.#adjust120);
    
    try {
    
      this.tempo.BPM = this.#adjustStartBPM + delta / 5;
    
      if (adjustAngle - this.#adjustStart > 120) {
        this.#adjust120++;
        this.#adjustStart = (this.#adjustStart + 120) % 360;
      } else if (adjustAngle - this.#adjustStart < -120) {
        this.#adjust120--;
        this.#adjustStart = (this.#adjustStart - 120) % 360;
        if (this.#adjustStart < 0) {
          this.#adjustStart = 360 + this.#adjustStart;
        }
      }
      
      if (window.CSS && CSS.Number) {
        const transforms = this.#dragWidget.attributeStyleMap.get('transform');
        for (const i in transforms) {
          if (transforms[i] instanceof CSSRotate) {
            if (transforms % 2 == 0) {
              transforms[i].angle.set(angle, 'deg');
            } else {
              transforms[i].angle.set(angle*-1, 'deg');
            }
          }
        }
      } else {
        this.#dragWidget.style.transform =  `rotate(${angle}deg) translateY(calc(var(--grid-size) / -2)) rotate(-${angle}deg)`;
      }
      
    } catch (e) {
      if (e instanceof RangeError) {
        //expected error, do nothing
      } else {
        throw e;
      }
    }
  }
}

window.customElements.define('wbhb-adjust-tempo', WBHBAdjustTempo);