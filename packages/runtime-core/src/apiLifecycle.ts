import { currentInstance, setCurrentInstance } from "./component"

export const enum LifecycleHooks {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATED = 'bu',
  UPDATED = "u"
}

export function createHook(type: LifecycleHooks){
  return (hook, target = currentInstance) => {
    if(target) {
      const wrapperHook = () => {
        setCurrentInstance(target);
        hook();
        setCurrentInstance(null)
      }
      const hooks =  target[type] || (target[type] = [])
      hooks.push(wrapperHook)
    }
  }
}


export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)

export const onMounted = createHook(LifecycleHooks.MOUNTED)

export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATED)

export const onUpdated = createHook(LifecycleHooks.UPDATED)

export const onBeforeUnmounted = () => {}

export const onUnmounted = () => {}
