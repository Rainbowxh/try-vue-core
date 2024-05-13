export const patchClass = (el: HTMLElement,value) => {
  if(value === null) {
    el.removeAttribute('class')
  }else {
    el.className = value;
  }
}
