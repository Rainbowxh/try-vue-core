export * from "./vnode"
export * from "./h"

import { nodeOps } from "./nodeOps"
import { createRenderer } from "./renderer"


const renderOptions = Object.assign(nodeOps, { })

export const render = (vnode,container) => {
  return createRenderer(renderOptions).render(vnode,container);
}
