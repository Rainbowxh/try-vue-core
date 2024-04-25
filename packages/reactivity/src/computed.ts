import { isFunction } from "@vue/shared";
import { ReactiveEffect, activeEffect, track, trackEffect, trigger, triggerEffect } from "./effect";

class ComputedRefImpl<T> {
  public dep;
  private readonly __v_isRef = true; // 是否返回.value
  _dirty = true;
  _value: undefined; // 缓存
  private readonly effect;

  constructor(private getter,private readonly _setter) {
    this.effect = new ReactiveEffect(
      () => this.getter(this._value), 
      () => {
        this._dirty = true;
        triggerEffect(this.dep)
      })
  }

  get value() {
    if(activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()))
    }
    if(this._dirty) {
      this._value = this.effect.run();
      this._dirty = false;
    }
    return this._value;
  }

  set value(val) {
    this._setter(val);
  }

}

export function computed(getterOptions) {
  const onlyGetter = isFunction(getterOptions);
  let getter, setter;
  if (onlyGetter) {
    getter = getterOptions
  } else {
    getter = getterOptions.get;
    setter = getterOptions.set;
  }

  const computed = new ComputedRefImpl(getter,setter)

  return computed
} 
