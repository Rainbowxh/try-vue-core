import { ReactiveFlags, reactiveMap } from "@vue/reactivity";
import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";

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
  
  reactiveMap.set(proxy, target);

  return proxy
}
