import { activeSub, batchedEffect } from "./effect";

export let targetMap = new WeakMap();

export class Dep {
  version = 0;
  activeLink = undefined
  subs = undefined; // point to last subs link;

  constructor(public computed?: undefined) {
    this.computed = computed;
  }

  track() {
    let link = this.activeLink;
    if(link === undefined || link.sub !== activeSub) {
      link = this.activeLink = {
        dep: this,
        sub: activeSub,
        prevSub: null,
        nextSub: null,
        prevDep: null,
        nextDep: null
      }
      if(!activeSub.deps) {
        activeSub.deps = link
      }else {
        link.prevDep = activeSub.depsTail;
        if(!activeSub.depsTail) {
          activeSub.depsTail = link;
        }else {
          activeSub.depsTail.nextDep = link;
        }
      }

      const subsTail = link.dep.subs;
      if(subsTail !== link) {
        link.prevSub = subsTail;
        if(subsTail) {
          subsTail.nextSub = link
        }
      }
      // 缓存当前的sublink
      link.dep.subs = link
    }else {
      // to-do sth
    }
  }

  trigger() {
    this.version++;
    this.notify();
  }
  
  notify() {
    /**
     * 由于是从尾部开始遍历的，所以执行顺序不能够保证，需要倒序当前链表
     * 先通知当前所有订阅的列表要更新
     * 再次进行更行
     */
    for(let tail = this.subs; !!tail; tail = tail.prevSub) {
      tail.sub.notify();
    }

    let e = batchedEffect

    while(e) {
      const next = e.nextEffect
      e.trigger();
      e.nextEffect = undefined
      e = next
    }
  }
}

export function track(target: object, key) {
  if(!activeSub) {
    return; 
  }

  let depsMap = targetMap.get(target);
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = new Dep()))
  }
  dep.track();
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)

  if(!depsMap) return;

  // to-do

  const dep = depsMap.get(key);

  dep.trigger();
}


