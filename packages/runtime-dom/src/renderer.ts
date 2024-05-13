import { ShapeFlags, isSameVnode } from "@vue/runtime-core"

export function createRenderer(options: any) {

  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId,
    insertStaticContent: hostInsertStaticContent,
  } = options


  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el)
    }
  }

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode

    const el = (vnode.el = hostCreateElement(type))

    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    hostInsert(el, container)
  }

  const patchProps = (oldProps, newProps, el: HTMLElement) => {
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]

        if (prev !== next) { //updatenew value 
          hostPatchProp(el, key, prev, next)
        }

        for (let key in oldProps) { // del old value
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }


  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children
    const c2 = n2.children

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){

      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }

      if(c1 !== c2) { //文本内容不相同
        hostSetElementText(el,c2)
      }
    }
  }

  const patchElement = (n1, n2) => {
    const oldprops = n1.props || {}
    const newprops = n2.props || {}
    let el = n2.el = n1.el
    patchProps(oldprops, newprops, el)
    patchChildren(n1, n2, el)
  }

  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      // first 
      mountElement(n2, container)
    } else {
      // patch children 
      patchElement(n1, n2)
    }
  }


  const patch = (n1, n2, container) => {

    if (n1 === n2) {
      return;
    }

    // n1 div =>  n2 p
    // del old node values
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1); // 删除节点
      n1 = null
    }

    processElement(n1, n2, container)

  }

  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }

  /**
   * 
   * @param vnode virtual doms
   * @param container  actual doms
   * @returns 
   */
  const render = (vnode, container) => {
    if (vnode == null) {
      if (container.__vnode) {
        unmount(container.__vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
      container._vnode = vnode
    }
  }

  const createApp = () => {
  }

  return {
    render,
    createApp
  }
}
