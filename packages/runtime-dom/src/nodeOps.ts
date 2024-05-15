export const nodeOps = {
  insert(child,parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },
  remove(child) {
    const parent = child.parentNode
    if(parent) {
      parent.removeChild(child)
    }
  },
  querySelector(select) {
    return document.querySelector(select)
  },
  createElement(tagName) {
    return document.createElement(tagName)
  },
  parentNode(node) {
    return node.parentNode
  },
  nextSibling(node) {
    return node.nextSibling
  },
  setElementText(node, text) {
    node.textContent = text
  },
  createText(text) {
    return document.createTextNode(text)
  },
  setText: (node, text) => {
    node.nodeValue = text
  }
}
