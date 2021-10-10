import {AsyncMap} from '../lib/util/AsyncMap.mjs';

export const WBHB_STUDIO = Symbol('wbhb-studio');
globalThis[WBHB_STUDIO] = {};

export const RACK = Symbol('rack');
globalThis[WBHB_STUDIO][RACK] = new AsyncMap();

export const BUTTONS = Symbol('buttons');
globalThis[WBHB_STUDIO][BUTTONS] = new AsyncMap();