import {SequencerItem, UidStillGenerating} from './SequencerItem.mjs';

export class ItemMap extends Map {
  
  constructor(args) {
    super(args);
  }
  
  async set(item) {
    let uid;
    
    try {
      uid = item.uid;
    } catch (e) {
      if (e instanceof UidStillGenerating) {
        uid = await e.uidPromise;
      }
    }
    
    super.set(uid, Object.freeze(SequencerItem.clone(item)));
    
    return uid;
  }
  
  get(uid) {
    if (this.has(uid)) {
      return SequencerItem.clone(super.get(uid));
    } else {
      return undefined;
    }
  }
  
  timings(uid) {
    if (this.has(uid)) {
      return Object.freeze(super.get(uid).timings);
    } else {
      return undefined;
    }
  }
}

export const ItemDB = new ItemMap();