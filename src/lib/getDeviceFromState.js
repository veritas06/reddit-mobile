import { find } from 'lodash/collection';

export const ANDROID = 'Android';
export const IPHONE = 'iPhone';
export const IPAD = 'iPad';

export const IOS_DEVICES = [IPHONE, IPAD];

export const RECOGNIZED_DEVICES = [ANDROID, IPHONE, IPAD];

export function getDevice(state) {
  const ua = state.meta.userAgent || '';
  
  return find(RECOGNIZED_DEVICES, device => ua.indexOf(device) !== -1);
}
