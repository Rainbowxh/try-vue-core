import minimist from "minimist";
import esbuild from 'esbuild'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
//utils
const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
//args
const args = minimist(process.argv.slice(2))
const target = args._[0] || ['reactivity'];
const format = args.f || 'global';
const outputFormat = format.startsWith('global')
? 'iife'
: format === 'cjs'
  ? 'cjs'
  : 'esm'
const pkg = require(`../packages/${target}/package.json`)
const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`,
)
esbuild
.context({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true,
  sourcemap: true,
  format: outputFormat,
  globalName: pkg.buildOptions?.name,
  platform: format === 'cjs' ? 'node' : 'browser',
})
.then(ctx =>  {
  ctx.watch()
})



