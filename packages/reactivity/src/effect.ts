export let activeEffect;

export function effect(fn: () => any, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect)
  return runner;
}

class ReactiveEffect<T = any> {
  active = true
  deps: any[] = []
  parent: any[] | undefined
  constructor(
    public fn: () => T,
    private scheduler:()=>T
  ) {

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
      return this.fn();
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  stop() {
    if(this.active) {
      // clean all deps;
      cleanupEffect(this);
      // do not active again;
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect;
  for(let i = 0; i < deps.length; i ++) {
    const dep = deps[i];
    dep.delete(effect);
  }
  effect.deps.length = 0;
}

const targetMap = new WeakMap();


export function trackEffect(target, key) {

  if(!activeEffect) return;
  let depsMap = targetMap.get(target);
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key,(dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect)
  if(shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function triggerEffect(target,key,value,oldValue) {
    const depsMap = targetMap.get(target);

    if(!depsMap) return;

    const dep = depsMap.get(key);
    if(dep) {
      const newDep = new Set<any>(dep);
      newDep.forEach(effect => {
        if(effect !== activeEffect) {
          if(!effect.scheduler) {
            effect.run()
          }else {
            effect.scheduler();
          }
        }
      });
    }

}
