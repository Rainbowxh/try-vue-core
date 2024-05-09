import { ShapeFlags } from "./shapeFlag"

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
    setScopeId: hostSetScopeId = NOOP,
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
      hostSetElementText(container, children)
    }
    hostInsert(el,container)
  }



  const patch = (n1,n2,container) => {

    if(n1 === n2) return ;

    if(n1 === null) {
      // first 

      mountElement(n2,container)
    }else {

    }
  
  }




  const render = (vnode,container) => {
      if(vnode == null) {
        return;
      }else {

        patch(container._vnode || null,vnode,container)
      }
      container._vnode = vnode
  }
  const createApp = () => {}

  return {
    render,
    createApp
  }
}
