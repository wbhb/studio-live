import {SequencerItem, UidStillGenerating, Timings} from './SequencerItem.mjs';
import {Length} from '../../util/length.mjs';

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
    
    super.set(uid, JSON.stringify(item));
    
    return uid;
  }
  
  get(uid) {
    if (this.has(uid)) {
      return SequencerItem.create(super.get(uid));
    } else {
      return undefined;
    }
  }
  
  timings(uid) {
    if (this.has(uid)) {
      let plain = JSON.parse(super.get(uid)).timings;
      
      const timings = new Timings(
        new Length(plain.length.value || 1, plain.length.unit || Length.units.beat),
        new Length(plain.offset.value || 0, plain.offset.unit || Length.units.beat)
      );
      
      timings.immediate = plain.immediate;
      
      return timings;
      
    } else {
      return undefined;
    }
  }
}

export const ItemDB = new ItemMap();