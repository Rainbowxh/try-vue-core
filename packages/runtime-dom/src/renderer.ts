import { ShapeFlags } from "@vue/runtime-core"

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


  const mountChildren = (children,el) => {
    for(let i = 0; i < children.length; i ++) {
      patch(null,children[i],el)
    }
  }

  const mountElement = (vnode,container) => {
    const { type, props,children, shapeFlag} = vnode

    const el = (vnode.el = hostCreateElement(type))

    if(props) {
      for(let key in props) {
          hostPatchProp(el,key,null,props[key])
      }
    }

    if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    } else if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    hostInsert(el,container)
  }
  const patch = (n1,n2,container) => {
    if(n1 === n2) {
      return ;
    }

    // n1 div =>  n2 p

    console.log(n1,n2)




    if(n1 === null) {
      // first 
      mountElement(n2,container)
    }else {
      // patch children 
    }
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
  const render = (vnode,container) => {
      if(vnode == null) {
        if(container.__vnode) {
          unmount(container.__vnode)
        }
      }else {
        patch(container._vnode || null,vnode,container)
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
