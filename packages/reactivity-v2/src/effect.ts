export let activeSub = {};

export enum EffectFlags {
  ACTIVE = 1 << 0,
  RUNNING = 1 << 1,
  TRACKING = 1 << 2,
  NOTIFIED = 1 << 3,
  DIRTY = 1 << 4,
  ALLOW_RECURSE = 1 << 5,
  PAUSED = 1 << 6,
}
let batchDepth = 0;
let batchedEffect = undefined


export class ReactiveEffect {
  deps = undefined;
  depsTail = undefined;
  flags: EffectFlags = EffectFlags.ACTIVE | EffectFlags.TRACKING
  nextEffect = undefined;
  scheduler = undefined;
  // to-do future
  cleanup?: () => void = undefined

  constructor(
    private fn: () => void,
  ) {
    this.fn = fn;
  }
  
  run() {
    this.flags |= EffectFlags.RUNNING
    const prevEffect = activeSub;
    activeSub = this;
    cleanupEffect(this);
    try {
      return this.fn();
    }finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      this.flags &= ~EffectFlags.RUNNING
    }
  }

  notify() {
    if (
      this.flags & EffectFlags.RUNNING 
    ) {
      return
    }
    // do sth;
    if (!(this.flags & EffectFlags.NOTIFIED)) {
      this.flags |= EffectFlags.NOTIFIED
      this.nextEffect = batchedEffect
      batchedEffect = this
    }
  }

  trigger() {
    if(this.scheduler) {
      this.scheduler();
    }else {
      this.run();
    }
  }
}

export function refreshComputed(computed) {
  if (
    computed.flags & EffectFlags.TRACKING &&
    !(computed.flags & EffectFlags.DIRTY)
  ) {
    return
  }
  try {
    prepareDeps(computed)
    if(computed.flags & EffectFlags.DIRTY)  {
      const value = computed.fn();
      computed._value = value
      computed.flags &= ~EffectFlags.DIRTY
    }
  }finally {
    cleanupDeps(computed)
  }

}

export function startBatch() {
  batchDepth ++
}

export function endBatch() {
  if(--batchDepth > 0) {
    return;
  }
  let e = batchedEffect
  while(e) {
    const next = e.nextEffect
    if (e.flags & EffectFlags.ACTIVE) {
      try {
        e.trigger();
      } catch (err) {
      }
    }
    e.nextEffect = undefined
    e = next
  }
}


export function effect(fn: () => void) {
  const effect = new ReactiveEffect(fn);
  effect.run();
  const result = effect.run.bind(effect)
  result.effect = effect;
  return result;
}

export function cleanupEffect(e: ReactiveEffect) {
  const { cleanup } = e
  e.cleanup = undefined
  if (cleanup) {
    // run cleanup without active effect
    const prevSub = activeSub
    activeSub = undefined
    try {
      cleanup()
    } finally {
      activeSub = prevSub
    }
  }
}
/**
 * sub deps 记录所有节点的开头，
 * 从前到后将所有节点的版本设置为 -1, 代表着需要更新
 * @param sub 
 */
export function prepareDeps(sub: ReactiveEffect) {
  for(let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink
    link.dep.activeLink = link;
  }
}



/**
 * sub depsTail 指向deps的尾部节点
 * 
 * @param sub 
 */
function cleanupDeps(sub) {
    // Cleanup unsued deps
    let head
    let tail = sub.depsTail
    for (let link = tail; link; link = link.prevDep) {
      if (link.version === -1) {
        if (link === tail) tail = link.prevDep
        removeSub(link)
        removeDep(link)
      } else {
        head = link
      }
      link.dep.activeLink = link.prevActiveLink
      link.prevActiveLink = undefined
    }
    // set the new head & tail
    sub.deps = head
    sub.depsTail = tail
}

function removeSub(link) {
  const { dep, prevSub, nextSub } = link
  if (prevSub) {
    prevSub.nextSub = nextSub
    link.prevSub = undefined
  }
  if (nextSub) {
    nextSub.prevSub = prevSub
    link.nextSub = undefined
  }
  if (dep.subs === link) {
    // was previous tail, point new tail to prev
    dep.subs = prevSub
  }

  if (!dep.subs && dep.computed) {
    // last subscriber removed
    // if computed, unsubscribe it from all its deps so this computed and its
    // value can be GCed
    dep.computed.flags &= ~EffectFlags.TRACKING
    for (let l = dep.computed.deps; l; l = l.nextDep) {
      removeSub(l)
    }
  }
}

function removeDep(link) {
  const { prevDep, nextDep } = link
  if (prevDep) {
    prevDep.nextDep = nextDep
    link.prevDep = undefined
  }
  if (nextDep) {
    nextDep.prevDep = prevDep
    link.nextDep = undefined
  }
}
