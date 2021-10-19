import {SequencerItem} from '../sequencer/items/SequencerItem.mjs';
import {ItemDB} from '../sequencer/items/ItemDB.mjs';

const html = `
  <div id="shade"></div>
  <div id="name"></div>
  <div id="type"></div>
  <div id="menu">
    <div id="menuButton">\u22EF</div>
  </div>
  <div id="content">
    <slot></slot>
  </div>
`;

const css = `
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    
    contain: layout style size;
    
    position: relative;
    font-size: 24pt;
    
    width: var(--grid-size);
    height: var(--grid-size);
    
    background-color: var(--wbhb-color-black);
    border: solid 2px var(--wbhb-color-yellow);
    border-radius: calc(var(--grid-size) / 2);
    font-family: inherit;
    color: var(--wbhb-color-white);
    text-align: center;
    z-index: 1;
  }
  
  :host([opened]) {
    border-color: var(--wbhb-color-grey);
    z-index: 3;
  }
  
  :host:disabled {
    color: var(--wbhb-color-grey);
    border-color: var(--wbhb-color-grey);
  }
  
  #shade {
    width: 200vmax;
    height: 200vmax;
    margin: -100vmax;
    position: absolute;
    top: 50%;
    left: 50%;
    background: radial-gradient(closest-side, var(--wbhb-color-grey), transparent);
    opacity: 0;
    transition: transform 0.5s ease-in-out, opacity 0.3s ease-in-out;
    transform: scale(0.2);
    display: none;
    z-index: 2;
  }
  
  :host([opened]) #shade {
    opacity: 1;
    transform: scale(1);
    display: unset;
  }
  
  :host([wide]) {
    width: calc(calc(2 * var(--grid-size)) + var(--grid-gap));
    grid-column: span 2;
  }
  
  #type {
    position: absolute;
    display: block;
    height: calc(var(--grid-size) / 3);
    width: var(--grid-size);
    top: 0;
    margin-top: calc(var(--grid-size) / 6);
    text-align: center;
    font-size: 12pt;
    color: var(--wbhb-color-grey);
  }
  
  :host(:empty) #menu {
    display: none;
  }
  
  #menu {
    position: absolute;
    height: calc(var(--grid-size) / 6);
    width: calc(var(--grid-size) / 6);
    bottom: 0;
    margin-bottom: 2vmin;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #menuButton {
    height: 100%;
    width: 100%;
    
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12pt;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    z-index: 1;
  }
  
  :host([opened]) #menuButton {
    transform: scale(2);
  }
  
  ::slotted(wbhb-button) {
    position: absolute;
    top: 0;
    left: 0;
    transform: scale(0.166);
    opacity: 0;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    z-index: 1;
  }
  
  ::slotted(wbhb-button[opened]) {
    z-index: 4;
  }
  
  #content {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
  
  :host([opened]) #content {
    z-index: 3;
    transform: translateZ(0);
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

export class WBHBButton extends HTMLElement {
  
  #boundListeners = {};
  #item;
  #itemId;
  
  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(this.render());
    
    this.#boundListeners.dragStart = this.dragStart.bind(this);
    
    this.setupListeners();
  }
  
  connectedCallback() {
    this.connected = true;
    this.type = this.type;
    this.name = this.name;
    this.classList.add('resolved');
    let connectedEvent = new CustomEvent('connected');
    this.dispatchEvent(connectedEvent);
  }
  
  static get observedAttributes() {
    return ['name', 'type', 'opened', 'draggable'];
  }
  
  setupListeners() {
    this.addEventListener('closeAll', (e) => {
      this.opened = false;
    });
    this.addEventListener('dragstart', (e) => {
      if (e instanceof DragEvent) {
        if (this.item) {
          let data = JSON.stringify(this.item);
          e.dataTransfer.setData("application/json", data);
        }
        if (this.itemId) {
          e.dataTransfer.setData(this.item.mediaType, this.itemId);
          e.dataTransfer.setData(SequencerItem.mediaType, this.itemId);
        }
        e.dataTransfer.setData('text/plain', `${this.type}: ${this.name}`);
        e.dataTransfer.effectAllowed = 'copy';
        this.closeAll();
      }
    });
    const childButtons = this.querySelectorAll(":scope > wbhb-button");
    childButtons.forEach((child) => {
      child.addEventListener(`closeAll`, () => {
        this.closeAll();
      });
    });
    this.shadowRoot.querySelector("#menuButton").addEventListener('click', (e) => {
      this.toggleAttribute('opened');
    });
    this.shadowRoot.querySelector("#shade").addEventListener('click', (e) => {
      this.closeAll();
    });
  }
  
  render() {
    return templateEl.content.cloneNode(true);
  }

  set name(newValue) {
    this.setAttribute("name", newValue);
  }
  
  get name() {
    return this.getAttribute("name") || "";
  }
  
  set type(newValue) {
    this.setAttribute("type", newValue);
  }
  
  get type() {
    return this.getAttribute("type") || "";
  }
  
  set itemId(newValue) {
    this.setAttribute("item-id", newValue);
  }
  
  get itemId() {
    return this.getAttribute("item-id") || "";
  }
  
  set opened(newValue) {
    if (newValue) {
      this.setAttribute("opened", "");
    } else {
      this.removeAttribute("opened");
    }
  }
  
  get opened() {
    return this.hasAttribute("opened");
  }
  
  set item(newValue) {
    this.#item = newValue;
    ItemDB.set(this.item).then((id) => {
      this.itemId = id;
    });
  }
  
  get item() {
    if (this.#item) {
      return this.#item;
    } else {
      return ItemDB.get(this.itemId) ?? undefined;
    }
  }
  
  open() {
    
    const getRingSlots = (ringdex) => {
      const offset = ringdex % 2 ? 30 : 0;
      let slots = new Array(ringdex * 6).fill(true);
      slots.forEach((slot, index) => {
        const angle = offset + (360 / slots.length) * index;
        const size = Math.max(bounds.width, bounds.height);
        const distance = size * 1.2 * ringdex;
        const xOffset = Math.sin(angle * Math.PI / 180) * distance;
        const yOffset = Math.cos(angle * Math.PI / 180) * distance * -1;
        const x = xOffset + bounds.left + bounds.width/2;
        const y = bounds.top + yOffset + bounds.height/2;
        const onScreen = x > (0 + size / 2) && x < (window.innerWidth - size / 2) && y > (0 + size / 2) && y < (window.innerHeight - size / 2);
        
        slots[index] = {
          ring: ringdex, slot: index, angle, distance, xOffset, yOffset, x, y, onScreen
        };
      });
      
      return slots;
      
    };
    
    const bounds = this.getBoundingClientRect();
    const childButtons = this.querySelectorAll(":scope > wbhb-button");
    
    let slots = [];
    let rings = 0;
    
    for (let i = 1; slots.length < childButtons.length; i++) {
      let newSlots = getRingSlots(i).filter(slot => slot.onScreen);
      
      if (newSlots.length == 0) {
        break;
      }
      
      slots = [...slots, ...newSlots];
      
      rings = i;
    }
    
    childButtons.forEach((el, i) => {
      if (!slots[i]) {
        throw new Error("Not all buttons can be displayed on screen");
      }
      el.style.opacity = 1;
      el.slideAndRotate(slots[i].distance, slots[i].angle);
    });
    
  }
  
  slideAndRotate(distance, angle) {
    this.style.transform = `rotate(${angle}deg) translate(0, -${distance}px) rotate(-${angle}deg)`;
  }
  
  close() {
    const childButtons = this.querySelectorAll(":scope > wbhb-button");
    
    childButtons.forEach((el, i) => {
      el.style.transform = `scale(0)`;
      el.style.opacity = 0;
      el.slideAndRotate(0, 0);
    });
    
  }
  
  closeAll() {
    const closeAll = new CustomEvent('closeAll');
    this.dispatchEvent(closeAll);
  }
  
  dragStart(e) {
    // e.stopPropagation();
    // this.closeAll();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "name":
        this.shadowRoot.querySelector("#name").innerText = newValue;
        break;
      case "type":
        this.shadowRoot.querySelector("#type").innerText = newValue;
        break;
      case "opened":
        if (this.hasAttribute("opened")) {
          this.open();
        } else {
          this.close();
          this.querySelectorAll('wbhb-button').forEach((button) => {button.opened = false});
        }
        break;
      case "draggable":
        // if (newValue) {
        //   this.addEventListener('dragstart', this.#boundListeners.dragStart);
        // } else {
        //   this.removeEventListener('dragstart', this.#boundListeners.dragStart);
        // }
        break;
    }
  }
}

window.customElements.define('wbhb-button', WBHBButton);