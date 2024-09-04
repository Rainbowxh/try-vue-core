import { hasOwn, isFunction } from "@vue/shared";
import { initProps } from "./componentProps";
import { proxyRef, reactive } from "@vue/reactivity";
import { ShapeFlags } from "@vue/runtime-dom";

export let currentInstance;

export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function getCurrentInstance(){
  return currentInstance
}


export function createComponentInstance(vnode, parent = null) {
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
    setupState: null,
    slots: {},
    ctx: {},
    emit: null,
    // lifecycle
    // event
  }
  instance.ctx = { _: instance}
  return instance
} 
const publicProperties = {
  $attrs: target => target.attrs,
  $props: target => target.props,
}
const PublicInstanceProxyHandlers = {
    get(target, key) {
      let { data, props, setupState } = target

      if (hasOwn(data, key)) {
        return data[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      } else if(hasOwn(setupState,key)) {
        return setupState[key]
      }
      const getter = publicProperties[key]
      if (getter) {
        return getter(target)
      }
    },
    set(target, key, value, receiver) {
      let { data, props, setupState } = target
      if (hasOwn(data, key)) {
        data[key] = value
      } else if (hasOwn(props, key)) {
        props[key] = value
        return false;
      } else if (hasOwn(props, key)) {
        setupState[key] = value
        return false;
      }
      return true
    }

}

const initSlots = (instance,children) => {
  if(instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    //将用户的插槽绑定到实例上
    instance.slots = children;
  }
}

export function setupComponent(instance) {
  if(!instance) return;

  const { type, props, children } = instance.vnode;

  /**
   * 组件的虚拟节点传递的props
   */
  /**
   * instance.propsOptions 组件上所接收的属性列表   props: { name: '123' } 
   * instance.props        组件真实接受的属性列表   <component name='123' age='12' />
   */ 
  initProps(instance, props);
  

  initSlots(instance, children);

  // create代理对象
  instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers)


  let { setup } = type;

  if(setup) {
    const setupContext = {
      attrs: instance.attrs,
      slots: instance.slots,
      expose: (exposed) => {
        instance.exposed = exposed; //将当前的属性放在instances上面
      },
      emit: (event, ...args) => {
        const eventName = `on${event[0].toUpperCase()}` + event.slice(1);
        const handler = instance.vnode.props[eventName];
        if(isFunction(handler)) {
          handler(...args); 
        }else {
          console.warn('Cannot find ', eventName, 'on component instance')
        }

      }
    }

    setCurrentInstance(instance)
    const setupResult = setup(instance.props, setupContext);
    setCurrentInstance(null)
    
    if(isFunction(setupResult)) {
      instance.render = setupResult
    } else {
      if(setupResult !== null && typeof setupResult === 'object') {
        // 将返回结果作为数据源
        instance.setupState = proxyRef(setupResult)
      }else {
        console.error('setup must return an object or a function')
      }
    }
  }

  let data = type.data

  if(type.data){
    if(isFunction(data)){
      instance.data = reactive(data());
    }
  }

  // 用户写的render作为实例的render
  instance.render = instance.render ?? type.render;

}
