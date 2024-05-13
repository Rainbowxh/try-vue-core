export const patchStyle = (el: HTMLElement,prev,next) => {
  const style = el.style;

  for(let key in next) {
    style[key] = next[key]
  }

  for(let key in prev) {
    if(next[key] === null) {
      style[key] = null
    }
  }

}
