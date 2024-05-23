export function isArray(ipt: unknown) {
  return Array.isArray(ipt);
}

export const isObject = (val: unknown): Boolean =>  val !== null && typeof val === 'object'

export const isFunction = (val: unknown): Boolean => val !== null && typeof val === 'function'

export const isString = (val: unknown): Boolean => typeof val === 'string'

export const hasOwn = (value,key) => {
  if(value === null || value === undefined) return false;
  return Object.prototype.hasOwnProperty.call(value,key)
}

export function invokeArrayFn(arr) {
  arr.forEach(fn => fn());
}
