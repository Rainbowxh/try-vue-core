import { ReactiveEffect, reactive } from "@vue/reactivity"
import { ShapeFlags, 
  isSameVnode, 
  Text, 
  Fragment, 
  queueJob,
   initProps, 
   createComponentInstance, 
   setupComponent } from "@vue/runtime-core"
import { invokeArrayFn } from "@vue/shared"

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
      patchProps({}, props, el)
      // for (let key in props) {
      //   hostPatchProp(el, key, null, props[key])
      // }
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
     * 
     * a b 
     * d
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
     *   b c d
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
     * 
     * f g b
     * c1.length < c2.length 
     * 新数组长度大于老数组长度 新增节点
     */
    if (i > e1 && i <= e2) {
      while (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        patch(null, c2[i], container, anchor)
        i++
      }
    }

    /**
     * 
     * c1.length > c2.length
     * 新数组长度小于老数组长度 删除节点
     */
    if (i <= e1 && i > e2) {
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }

    if (i > e2) {
      return;
    }


    /**
     * fast diff algorithm
     * b c d a e
     * e c d a b
     * 计算最长递增子序列
     * 递增的部分不需要移动
     * 剩余部分开始按顺序添加渲染
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

    console.log(i, e1, e2)

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
      /**
       * 计算是向后添加还是向前添加
       * a b c d e
       * b c d e f g
       * 
       * b c d e f g
       *   a b c d e
       */
      const anchor = nextIdx + 1 < l2 ? c2[nextIdx + 1].el : null
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

      while (start < end) {
        mid = (start + end) / 2 | 0
        if (arr[result[mid]] < arrI) {
          start = mid + 1;
        } else {
          end = mid;
        }
      }
      // mid 第一个值比当前值大的值
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1]; // 记住交换节点前一个索引
        result[start] = i;
      }
    }

    let rl = result.length
    let last = result[rl - 1];
    while (rl-- > 0) {
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


  const mountComponent = (vnode, container, anchor = null) => {

    //创建实例
    const instance = vnode.component = createComponentInstance(vnode)

    
    /**
     * instance.propsOptions 用户接受的属性列表
     * instance.props        组件真实接受的属性列表
     * instance.slots        用户插槽
     */
    // 给实例的props赋值
    setupComponent(instance)

    // 安装属性
    setupRenderFn(instance, container, anchor)
  }
  const updateProps = (prevProps, nextProps) => {
    //比对
    for(let key in nextProps) {
      prevProps[key] = nextProps[key]
    }

    for(let key in prevProps) {
      if(!(key in nextProps)) {
        delete nextProps[key]
      }
    }
  }

  const updateSlots = (slots, next) => {

  }

  const updateComponentPreRender = (instance, next) => {
    instance.next = undefined
    // 老节点 => 新节点
    instance.vnode = next;
    // 更新属性
    updateProps(instance.props, next.props);
    // 需要更新插槽
    // updateSlots(instance.slots, next.slots);
    // 将新的children合并到新的
    Object.assign(instance.slots, next.children)
  }

  const setupRenderFn = (instance, container, anchor) => {

    console.log(instance)

    const componentFn = () => {
      const { render,setup } = instance || {};
      const { bm,m,bu, u } = instance
      if (!instance.isMounted) {

        if(bm) {
          invokeArrayFn(bm);
        }

        const subTree = render.call(instance.proxy, instance.proxy)
        patch(null, subTree, container, anchor)
        instance.isMounted = true;
        instance.subTree = subTree

        if(m) {
          invokeArrayFn(m);
        }
      } else {
        console.log("doing?????")
        let { next } = instance
        // props update 或者插槽更新
        if(next) {
          // 更新props属性/更新插槽属性
          updateComponentPreRender(instance,next); 
        }
        if(bu) {
          invokeArrayFn(bu);
        }
        // 数据变化导致的更新  
        // update function
        // 需要拿到最新的属性和插槽到原来的实力上
        const subTree = render.call(instance.proxy);
        patch(instance.subTree, subTree, container)
        instance.subTree = subTree;

        if(u) {
          invokeArrayFn(u);
        }
      }
    }
    const effect = new ReactiveEffect(componentFn, () => {
      queueJob(instance.update)
    })
    const update = (instance.update = effect.run.bind(effect))
    update()
  }

  const hasPropsChanged = (prev = {}, next = {}) => {
    let l1 = Object.keys(prev);
    let l2 = Object.keys(next);

    if (l1 !== l2) return true;

    for (let i = 0; i < l2.length; i++) {
      const key = l2[i];
      if (next[key] !== prev[key]) {
        return true;
      }
    }
    return false;
  }

  const shouldComponentUpdate = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1;
    const { props: nextProps, children: nextChildren } = n2;

    // props 是否更新
    // slots 是否需要更新

    if (prevChildren || nextChildren) return true

    if (prevProps === nextProps) return false;

    return hasPropsChanged(prevProps, nextProps)
  }
  /**
   * finish update
   */
  const updateComponent = (n1, n2, container, anchor = null) => {
    if (n1 === n2) return;

    const instance = n2.component = n1.component

    if (shouldComponentUpdate(n1, n2)) {
      //比对属性和插槽是否要更新
      instance.next = n2;
      instance.update()
    }
  }


  const processComponent = (n1, n2, container) => {
    if (n1 === null) {
      // 组件的状态的更新 内部state的更新
      mountComponent(n2, container)
    } else {
      //组件 指代的是组件更新，插槽更新 props
      updateComponent(n1, n2, container)
    }
  }

  const processFragment = (n1, n2, container) => {
    if (n1 === null) {
      mountChildren(n2.children, container)
    } else {
      patchKeyedChildren(n1.children, n2.children, container)
      // patchChildren(n1, n2,container)
    }
  }

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      n2.el = hostCreateText(n2.children)
      hostInsert(n2.el, container)
    } else {
      let el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  const patch = (n1, n2, container, anchor = null) => {

    if (n1 === n2) {
      return;
    }

    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1); // 删除节点
      n1 = null
    }

    // deal different type
    const { type, shapeFlag } = n2;

    switch (type) {
      case Text:
        processText(n1, n2, container)
        return;
      case Fragment:
        processFragment(n1, n2, container);
        return;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // n1 div =>  n2 p del old node values
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container)
        }
        return;
    }
  }

  const unmount = (vnode) => {
    if (vnode.type === Fragment) {
      //卸载的时候，卸载所有的儿子节点
      return unmountChildren(vnode.children)
    } else {
      hostRemove(vnode.el)
    }
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
      patch(container.__vnode || null, vnode, container)
      container.__vnode = vnode
    }
  }

  const createApp = () => {
  }
  return {
    render,
    createApp
  }
}
