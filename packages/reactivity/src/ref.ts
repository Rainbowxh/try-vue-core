import { isArray, isFunction, isObject } from "@vue/shared";
import { ReactiveFlags, isReactive, reactive, toRaw, trackEffect, triggerEffect } from ".";





import { activeEffect, getactiveEffect } from "@vue/reactivity"

export function ref(value: unknown) {
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value, true);
}

function createRef(rawValue: unknown, shallow = false) {
  if (isRef(rawValue)) {
    return rawValue;
  }

  return new RefImpl(rawValue, shallow)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF] === true)
}

export class RefImpl<T> {
  private _value;
  //@ts-ignore
  private _rawValue;

  public dep;
  public readonly __v_isRef = true;

  constructor(
    value: T,
    public readonly __v_isShallow: boolean
  ) {
    this._rawValue = toRaw(value);
    this._value = toReactive(value);
  }

  get value() {
    if (activeEffect) {
      trackEffect(activeEffect, this.dep || (this.dep = new Set()))
    }
    return this._value
  }
  set value(newValue) {
    console.log("elicxh test sth")
    this._rawValue = newValue;
    this._value = newValue
    if (this.dep) {
      triggerEffect(this.dep)
    }
  }
}

export class ObjectRefImpl {
  public readonly __v_isRef = true;

  constructor(
    private readonly _object,
    private readonly _key
    ){}

  get value(){
    return this._object[this._key]
  }

  set value(newValue) {
    this._object[this._key] = newValue
  } 
}

function toReactive<T>(value: T) {
  if (isObject) {
    return reactive(value)
  }
}

export function toRef(source, key?: string) {
  if(isRef(source)){
    return source
  }else if(isFunction(source)){
  }else if(isObject(source) && arguments.length > 1){
    return propertyToRef(source,key)
  }else {
    return ref(source)
  }
}

export function toRefs<T>(object: T) {
  const result = isArray(object) ? Array.from({length: (object as Array<unknown>).length}) : {}
  for(const key in Object) {
    result[key] = propertyToRef(result,key)
  }
  return result
}
function propertyToRef(source,key){
  return isRef(source) ? source : new ObjectRefImpl(source,key) 
}

export function proxyRef(objectWithRefs){
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs,{
      get(target,key,receiver) {
        let result = Reflect.get(target,key,receiver)
        return result[ReactiveFlags.IS_REF] ? result.value : result 
      },
      set(target,key,newValue,receiver) {
        const oldValue = target[key]
        if(oldValue[ReactiveFlags.IS_REF]){
          oldValue.value = newValue;
          return true;
        }
        return Reflect.set(target,key,newValue,receiver)
      } 
  })
}
