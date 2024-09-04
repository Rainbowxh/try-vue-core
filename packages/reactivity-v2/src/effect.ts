export let activeSub = undefined;
export let batchedEffect = undefined;


export class ReactiveEffect {
  deps = undefined;
  depsTail = undefined;
  flags = undefined;
  nextEffect = undefined;
  scheduler = undefined;

  constructor(
    private fn: () => void,
  ) {
    this.fn = fn;
  }
  
  run() {
    let prev = activeSub
    try {
      activeSub = this;
      // to-do-cleanupEffect
      return this.fn();
    }finally {
      activeSub = prev;
    }
  }

  notify() {
    // do sth;
    this.nextEffect = batchedEffect;
    batchedEffect = this;
  }

  trigger() {
    if(this.scheduler) {
      this.scheduler();
    }else {
      this.run();
    }
  }
}

export function effect(fn: () => void) {
  const effect = new ReactiveEffect(fn);
  effect.run();
  const result = effect.run.bind(effect)
  result.effect = effect;
  return result;
}
