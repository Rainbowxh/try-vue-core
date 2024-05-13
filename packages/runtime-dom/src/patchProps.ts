import { patchAttr } from "./modules/attribute";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";
import { nodeOps } from "./nodeOps";

export const patchProp = (el: HTMLElement, key, prevValue, newValue) => {
  // class style event attr
  if (key === 'class') {
    patchClass(el, newValue);
  } else if (key === 'style') {
    /**
     * { color:'red' } =>  { color: 'blue' }
     */
    patchStyle(el, prevValue, newValue)
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el, key, newValue)
  } else {
    patchAttr(el, key, newValue);
  }
}


