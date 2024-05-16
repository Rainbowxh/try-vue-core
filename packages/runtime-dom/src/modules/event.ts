export const patchEvent = (el: HTMLElement,key,nextValue) => {
  const invokers = el.__vei || (el.__vei = {})

  const name = key.slice(2).toLowerCase();

  const existingInvoker = invokers[name]

  if(nextValue && existingInvoker) {
    existingInvoker.value = nextValue
  }else if(nextValue) {
    const invoker = (invokers[name] = createInvoker(nextValue))
    el.addEventListener(name, invoker)
  }else if(existingInvoker) {
    el.removeEventListener(key,existingInvoker)
    invokers[name] = null
  }
}

function createInvoker(initValue) {
  const invoker = (e) => invoker.value(e)
  invoker.value = initValue
  return invoker
}
