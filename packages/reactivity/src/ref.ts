import { isObject } from "@vue/shared";
import { activeEffect, reactive, toRaw, trackEffect, trigger, triggerEffect } from ".";

export function ref(value: unknown) {
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value,true);
}

function createRef(rawValue: unknown,shallow = false){
  if(isRef(rawValue)){
    return rawValue;
  }

  return new RefImpl(rawValue,shallow)
}

function isRef(value){
  return !!(value && value.__v_isRef === true)
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
    console.log("我被执行了")
    this._rawValue = toRaw(value);
    this._value = toReactive(value);
  }

  get value() {
    if(activeEffect){
      trackEffect(activeEffect,this.dep || ( this.dep = new Set()))
    }
    return this._value
  }
  set value(newValue) { 
    this._rawValue = newValue;
    this._value = newValue
    if(this.dep){
      triggerEffect(this.dep)
    }
  }
}

function toReactive<T>(value: T) {
  if(isObject){
    return reactive(value)
  }
}

export function toRef(){

}

export function toRefs() {
  
}
