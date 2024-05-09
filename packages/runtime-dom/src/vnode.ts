import { isString } from "@vue/shared";
import { ShapeFlags } from "./shapeFlag";

export function createVNode(type, props = null, children = null) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

  const vnode =  {
    __v_isVnode: true,
    type,
    props,
    children,
    shapeFlag,
    key: props?.key,
    el: null,
  }

  if(children) {
    let type = 0 
    if(Array.isArray(children)) { 
      type = ShapeFlags.ARRAY_CHILDREN
    }else {
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }

  return vnode
}
export function isVnode(vnode) {
  return vnode.__v_isVnode;
}
