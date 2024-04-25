import { ReactiveFlags, reactive, trackEffect, triggerEffect } from "@vue/reactivity";
import { isObject } from "@vue/shared";


export const mutableHandlers = {
  get(target, key, receiver) {
    // special tag judge whether update
    if(ReactiveFlags.IS_REACTIVE === key) {
      return true;
    }
    trackEffect(target,key)

    const result = Reflect.get(target,key,receiver)
    if(isObject(result)){ 
      return reactive(result)
    }
    return result
  },
  set(target, key, value ,receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target,key,value,receiver)
    if(oldValue !== value) {
      triggerEffect(target,key,value,oldValue)
    }
    return result;
  }
}
