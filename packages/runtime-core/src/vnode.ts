import { isObject, isString } from "@vue/shared";
import { ShapeFlags } from "./shapeFlag";
export const Text = '__v_text';
export const Fragment = "__v_fragment";


export function createVNode(type, props = null, children = null) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.COMPONENT
      : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    shapeFlag,
    key: props?.key,
    el: null,
    slots: {}
  }
  if (children) {
    let type = 0
    if (Array.isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else if(isObject(children)) {
      type = ShapeFlags.SLOTS_CHILDREN
    }
     else {
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }
  return vnode
}

export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export function isVnode(vnode) {
  return vnode.__v_isVnode;
}
