import { ReactiveFlags, reactive, reactiveMap, track, trigger } from "@vue/reactivity";
import { isObject } from "@vue/shared";


export const mutableHandlers = {
  get(target, key, receiver) {


    // special tag judge whether update
    if(ReactiveFlags.IS_REACTIVE === key) {
      return true;
    }else if(ReactiveFlags.RAW === key){
      return reactiveMap.get(target);
    }

    track(target,key)

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
      trigger(target,key,value,oldValue)
    }
    return result;
  }
}
