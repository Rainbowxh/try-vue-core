import { isFunction } from "@vue/shared";
import { Dep } from "./dep";
import { activeSub, EffectFlags, refreshComputed } from "./effect";

export function computed(getterOrOptions: any) {
  let getter: any = undefined;
  let setter: any = undefined

  if(isFunction(getterOrOptions)) {
    getter = getterOrOptions
  }

  const computedRef = new ComputedRefImpl(getter, setter)

  return computedRef
}

export class ComputedRefImpl {
  _value: any
  deps: any;
  dep = new Dep();
  flags = EffectFlags.DIRTY | EffectFlags.ACTIVE;

  constructor(
    public fn: any, 
    private setter: any,
  ) {
    this.fn = fn;
  }

  notify() {
    this.flags &= EffectFlags.DIRTY
  }

  get value() {
    refreshComputed(this);
    return this._value
  }

  set value(newValue) {
    if(this.setter) {
      this.setter(newValue);
    }
  }
}
