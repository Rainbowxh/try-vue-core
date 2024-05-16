import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProps"
import { createRenderer } from "./renderer"


const renderOptions = Object.assign(nodeOps, {patchProp})

export const render = (vnode,container) => {
  return createRenderer(renderOptions).render(vnode,container);
}

export * from "../../runtime-core/dist/runtime-core.esm.js"
export * from "../../reactivity/dist/reactivity.esm.js";

