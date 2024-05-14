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

  const mountElement = (vnode, container, anchor) => {
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
    hostInsert(el, container, anchor)
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


  const patchChildren = (n1, n2, container) => {
    const c1 = n1.children
    const c2 = n2.children

    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    /**
     * text   array    umount(text) => mount array
     * text   text     changeInnerText
     * text   null     umount(text)
     * array  array    render diff
     * array  text     umount(text) => mountText
     * array  null     unmount(array)
     * null   array    mount(children)
     * null   text     mount(text)
     * null   null     do nothing
     */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      if (c1 !== c2) { //文本内容不相同
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff算法
          patchKeyedChildren(c1, c2, container);
        } else {
          unmountChildren(c1)
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, container)
        }
      }
    }
  }

  const patchKeyedChildren = (c1: any[], c2: any[], container) => {
    const l1 = c1.length;
    const l2 = c2.length;
    let e1 = l1 - 1;
    let e2 = l2 - 1
    let i = 0;

    /**
     * 全量 diff,深度遍历对比
     * a b c
     * a b c d
     */
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container)
      } else {
        break;
      }
      i++
    }

    /**
     * 全量 diff,深度遍历对比
     * a b c
     * a b c d
     */
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container)
      } else {
        break;
      }
      e1--;
      e2--
    }

    /**
     * c1.length < c2.length 
     * 新增节点
     */
    if (i > e1 && i <= e2) {

      while (i <= e2) {
        console.log(i, e1, e2)

        const nextPos = e2 + 1;

        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        patch(null, c2[i], container, anchor)
        i++
      }
    }
    /**
     * c1.length > c2.length
     * 删除节点
     */
    if (i <= e1 && i > e2) {
      while (i <= e1) {
        console.log(c1[i])
        unmount(c1[i])
        i++
      }
    }
    /**
     * fast diff algorithm
     * b c d a e
     * e c d a b
     */
    // const c1s = c1[i]
    // const c1e = c1[e1]
    // const c2s = c2[i]
    // const c2e = c2[e2]

    // [i,...e1] a b c d e    f g
    // [i,...e2] a b e c d    f g
    //               c d e 
    //               e c d 

    let s1 = i;
    let s2 = i;

    const keyToNewIndexMap = new Map();

    for (let i = s2; i <= e2; i++) {
      const vnode = c2[i]
      keyToNewIndexMap.set(vnode.key, i)
    }

    const toBePatched = e2 - s2 + 1;
    // 移动节点, 是否添加节点
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
    for (let i = s1; i <= e1; i++) {
      const oldnode = c1[i]
      const newIndex = keyToNewIndexMap.get(oldnode.key)
      if (newIndex === undefined) {
        unmount(oldnode)
      } else {
        newIndexToOldIndexMap[newIndex] = i + 1;
        patch(oldnode, c2[newIndex], container)
      }
    }

    let moved = false;
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);


    let j = increasingNewIndexSequence.length - 1
    for (let i = toBePatched - 1; i >= 0; i--) {
      const nextIdx = s2 + i;
      const nextChild = c2[nextIdx];
      const anchor = nextIdx + 1 < l2 ? c2[nextIdx + 1].el : null
      console.log(newIndexToOldIndexMap)
      if (newIndexToOldIndexMap[nextIdx] === 0) {
        patch(null, nextChild, container, anchor)
      } else if (!moved) { 
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          hostInsert(nextChild.el, container, anchor)
        } else {
          j--
        }
      }
    }
  }




  const getSequence = (arr) => {
    console.log(arr)
    let len = arr.length;
    let result = [0];
    let p = arr.slice();  // 标识索引

    let resultLastIndex;

    let start;
    let end;
    let mid;

    for (let i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        resultLastIndex = result[result.length - 1];
        if (arr[resultLastIndex] < arrI) {
          result.push(i)
          p[i] = resultLastIndex
          continue
        }
      }
      //
      start = 0;
      end = result.length - 1;
      
      while(start < end){
        mid = (start + end) / 2 | 0
        if(arr[result[mid]] < arrI) {
          start = mid + 1;
        }else {
          end = mid;
        }
      }
      // mid 第一个值比当前值大的值
      if(arrI < arr[result[start]]){
        p[i] = result[start - 1]; // 记住交换节点前一个索引
        result[start] = i; 
      }
    }

    let rl = result.length
    let last =result[rl-1];

    while(rl-- > 0) {
      result[rl] = last;
      last = p[last];  
    }
    
    return result
  }





  const patchElement = (n1, n2) => {
    const oldprops = n1.props || {}
    const newprops = n2.props || {}
    let el = n2.el = n1.el
    patchProps(oldprops, newprops, el)
    patchChildren(n1, n2, el)
  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      // first 
      mountElement(n2, container, anchor)
    } else {
      // patch children 
      patchElement(n1, n2)
    }
  }


  const patch = (n1, n2, container, anchor = null) => {

    if (n1 === n2) {
      return;
    }

    // n1 div =>  n2 p
    // del old node values
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1); // 删除节点
      n1 = null
    }

    processElement(n1, n2, container, anchor)

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
