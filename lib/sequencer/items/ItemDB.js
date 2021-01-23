import {SequencerItem, UidStillGenerating} from './SequencerItem.js';

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
    return SequencerItem.clone(super.get(uid));
  }
}

export const ItemDB = new ItemMap();