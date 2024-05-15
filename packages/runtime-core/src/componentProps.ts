import { reactive } from "@vue/reactivity";

export function initProps(instance, rawProps){
  const props = {}
  const attrs = {}
  const options = instance.propsOptions;
  
  if(rawProps){
    for(let key in rawProps) {
      if(Object.hasOwnProperty.call(options,key)){
        props[key] = rawProps[key];
      }else {
        attrs[key] = rawProps[key]
      }
    }
  }

  instance.props = reactive(props)
  instance.attrs = attrs
}
