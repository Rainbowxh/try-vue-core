import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

export function watch(source, cb, options) {
  return doWatch(source, cb, options)
}

function doWatch(source, cb, { immediate = false, deep = false }) {
  let getter;

  if (isReactive(source)) {
    getter = () => {
      //循环访问属性用来依赖收集
      return deep === true ? traverse(source) : source
    };
  } else if (isFunction(source)) {
    getter = source;
  }

  const scheduler = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  }

  const effect = new ReactiveEffect(getter, scheduler)

  let oldValue = effect.run();

  if (immediate) {
   scheduler();
  }

  return () => {
    effect.stop();
  }
}

function traverse(source, set = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (set.has(source)) {
    return source
  }
  set.add(source);
  for (let key in source) {
    traverse(source[key]);
  }
  return source
}
