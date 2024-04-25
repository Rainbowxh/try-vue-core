import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive', //judge if is reactive proxy
}

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}

const reactiveMap = new WeakMap();

export function reactive(target: Object){
    if(!isObject(target)){
      return target
    }

    if(target && target[ReactiveFlags.IS_REACTIVE]) {
      return target;
    }

    const existingProxy = reactiveMap.get(target)
    if(existingProxy) {
      return existingProxy
    }

    const proxy = new Proxy(target as Object, mutableHandlers)
    
    reactiveMap.set(target,proxy);
    return proxy

}
