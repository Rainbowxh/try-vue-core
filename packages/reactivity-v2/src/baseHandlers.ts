import { track, trigger } from "./dep";

export const mutableHandlers: ProxyHandler<Object> = {
  get(target, key, receiver) {
    if(key === '__v_isReactive') {
      return true;
    }

    track(target, key);

    return Reflect.get(target, key, receiver)
  },
  set(target, key, newValue, receiver) {
    const result = Reflect.set(target, key, newValue, receiver)
    trigger(target, key)
    return result
  }
}
