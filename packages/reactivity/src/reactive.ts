import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive', //judge if is reactive proxy
  IS_REF = '__v_isRef', //judge if is reactive proxy
  RAW = '__v_isRaw'
}

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}

export const reactiveMap = new WeakMap();

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


export function toReactive<T>(value: T): T {
  return isObject(value) ? reactive(value) : value;
}

export function toRaw<T>(observed:T): T {
  const raw = observed && observed[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed
}
