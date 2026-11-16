/**
 * Build the browser bundle: inline the vendored force-graph UMD into the
 * module factory so the served client.js needs no network fetch.
 *
 * Run: node build.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'

const VENDOR = new URL('./vendor/force-graph.min.js', import.meta.url)
const APP = new URL('./lib/app.js', import.meta.url)
const OUT = new URL('./client.js', import.meta.url)
const MARKER = '    //__FORCE_GRAPH_INLINE__'

const vendor = (await readFile(VENDOR, 'utf8')).trimEnd()
const app = await readFile(APP, 'utf8')

if (!app.includes(MARKER)) throw new Error(`missing marker ${MARKER} in lib/app.js`)

const inlined = [
  '    /* force-graph 1.52.0 (MIT) — vendored in vendor/force-graph.min.js, inlined below. */',
  '    const __KB_FORCE_GRAPH__ = (function () {',
  '      var module = { exports: {} }',
  '      var exports = module.exports',
  vendor,
  '      return module.exports',
  '    })()',
].join('\n')

// A replacer function keeps `$&`/`$'` inside the vendored source literal.
await writeFile(OUT, app.replace(MARKER, () => inlined))
console.log(`client.js written: ${(await readFile(OUT, 'utf8')).length} bytes`)
