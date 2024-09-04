import { getCurrentInstance } from "packages/runtime-dom/dist/runtime-dom.esm"
import { onMounted, onUpdated } from ".";
import { ShapeFlags } from "../dist/runtime-core.esm";


export const KeepAlive = {
  name: 'KeepAlive',
  __is_keepalive: true,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const sharedContex = instance.ctx;

    const keys = new Set();
    const cache = new Map();
    let pendingCachedKey;
    const cacheSubtree = () => {
      cache.set(pendingCachedKey, instance.subTree);
    }
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);
    return () => {
      const vnode = slots.default();
      const key = vnode.key === null ? vnode.type : vnode.key
      const cacheVnode =  cache.get(key)
      pendingCachedKey = key;
      if(cacheVnode) {
        vnode.el = cacheVnode.el
        vnode.component = cacheVnode.component;
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE;
      }else {
        keys.add(key)
      }
      return vnode
    }
  }
}
