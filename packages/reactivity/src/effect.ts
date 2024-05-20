
import {recordEffectScope} from "."
export let activeEffect;

let id = 0

export const getactiveEffect = ()  => {
  console.log(id++)
  return activeEffect;
}

export function effect(fn: () => any, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect)
  return runner;
}

export class ReactiveEffect<T = any> {
  active = true
  deps: any[] = []
  parent: any[] | undefined
  constructor(
    public fn: () => T,
    //@ts-ignore
    private scheduler?: () => T
  ) {
    recordEffectScope(this)
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      // list stack operator
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      const result =  this.fn();
      return result
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  stop() {
    if (this.active) {
      // clean all deps;
      cleanupEffect(this);
      // do not active again;
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    dep.delete(effect);
  }
  effect.deps.length = 0;
}

const targetMap = new WeakMap();

/**
 * target => Map
 *    key => set()
 *           => activeEffect,activeEffect
 *              activeEffect => dep
 *      
 */
export function track(target, key?: string) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffect(activeEffect, dep);
}

export function trackEffect(activeEffect, dep) {
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    //双向存储对应的效果
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key?: string, value?: any, oldValue?: any) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    triggerEffect(dep);
  }
}

export function triggerEffect(dep) {

  const effects = [...dep];

  effects.forEach(effect => {
    /**
     * 避免无限循环
     * effect(() => {                     activeEffect
     *    const a = test.value;
     *    test.value = test.value + 1     effect (now effect is equal to activeEffect)
     * })
     */
    if (effect !== activeEffect) {
      if (!effect.scheduler) {
        effect.run()
      } else {
        effect.scheduler()
        // effect.scheduler();
      }
    }
  });
}
