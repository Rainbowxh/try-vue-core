export function isArray(ipt: unknown) {
  return Array.isArray(ipt);
}

export const isObject = (val: unknown): Boolean =>  val !== null && typeof val === 'object'

export const isFunction = (val: unknown): Boolean => val !== null && typeof val === 'function'

export const isString = (val: unknown): Boolean => typeof val === 'string'
