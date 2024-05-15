import { hasOwn, isFunction } from "@vue/shared";
import { initProps } from "./componentProps";
import { reactive } from "@vue/reactivity";

export function createComponentInstance(vnode) {
  const instance = {
    data: null,
    isMounted: false,
    vnode,
    update: () => { },
    subTree: null,
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {},
    proxy: null,
    // lifecycle
    // slots
    // event
  }

  return instance
} 
const publicProperties = {
  $attrs: target => target.attrs,
  $props: target => target.props,
}
const PublicInstanceProxyHandlers = {
    get(target, key) {

      let { data, props } = target
      if (hasOwn(data, key)) {
        return data[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      }
      const getter = publicProperties[key]
      if (getter) {
        return getter(target)
      }
    },
    set(target, key, value, receiver) {
      let { data, props } = target
      if (hasOwn(data, key)) {
        data[key] = value
      } else if (hasOwn(props, key)) {
        props[key] = value

        return false;
      }
      return true
    }

}



export function setupComponent(instance) {
  if(!instance) return;

  const { type, props } = instance.vnode;

  /**
   * 组件的虚拟节点传递的props
   */
  

  /**
   * instance.propsOptions 组件上所接收的属性列表   props: { name: '123' } 
   * instance.props        组件真实接受的属性列表   <component name='123' age='12' />
   */ 
  initProps(instance, props);
  // create代理对象
  instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers)

  let data = type.data
  if(type.data){
    if(isFunction(data)){
      instance.data = reactive(data());
    }
  }
  // 用户写的render作为实例的render
  instance.render = type.render;
}
