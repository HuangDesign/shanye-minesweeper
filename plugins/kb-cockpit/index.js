/**
 * 知识库驾驶舱 · Host half.
 *
 * Reads the workspace knowledge base (raw/ + wiki/) and serves one JSON
 * snapshot plus a drop-import endpoint. Everything is read-only on the wiki;
 * the only write is a dropped file landing in raw/.
 */
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-kb-cockpit'
export const inject = ['webServer']

const HERE = dirname(fileURLToPath(import.meta.url)) // <workspace>/plugins/kb-cockpit
const DEFAULT_ROOT = dirname(dirname(HERE)) // <workspace>

const API = '/kb-cockpit/api'
const MAX_IMPORT_BYTES = 12 * 1024 * 1024
const SNAPSHOT_TTL_MS = 3000
const MAX_PAGES = 600

const DEFAULT_PRICES = {
  inputMiss: 2,
  cacheHit: 0.2,
  output: 3,
  currency: '¥',
}

const LINK_RE = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g

/** Strip the markdown that would look like noise in a one-line excerpt. */
function plain(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|#]+)(?:[|#]([^\]]*))?\]\]/g, (_, target, alias) => (alias ?? target).trim())
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '')
    .replace(/[*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Recursively collect .md files under one directory. */
async function walkMarkdown(dir, out, depth) {
  if (depth > 6 || out.length >= MAX_PAGES) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (out.length >= MAX_PAGES) return
    if (entry.name.startsWith('.')) continue
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      await walkMarkdown(abs, out, depth + 1)
      continue
    }
    if (extname(entry.name).toLowerCase() === '.md') out.push(abs)
  }
}

/** Recursively collect every file under one directory with its stat. */
async function walkFiles(dir, out, depth) {
  if (depth > 3) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkFiles(abs, out, depth + 1)
      continue
    }
    if (!entry.isFile()) continue
    try {
      const info = await stat(abs)
      out.push({ abs, name: relative(dir, abs), size: info.size, mtime: info.mtimeMs })
    } catch {
      /* a file that vanished mid-scan is simply absent */
    }
  }
}

/** Local midnight of the current day, in ms. */
function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

/**
 * Estimate today's spend from the DSH session projection cache.
 *
 * Each cache file keeps one session's cumulative step count, its last request
 * usage and its cumulative decoded output tokens. Sessions created today are
 * summed: fresh input ≈ steps × last-request input, cache reads ≈ steps ×
 * last-request cache read, output ≈ cumulative decoded tokens. This is a
 * coarse estimate, never an invoice.
 */
async function estimateSpend(prices) {
  const dir = join(homedir(), '.dsh', 'storages', 'session_projcache', 'sessions')
  const since = startOfToday()
  let files = []
  try {
    files = (await readdir(dir)).filter((file) => file.endsWith('.json'))
  } catch {
    return { ok: false, reason: 'no-session-records' }
  }
  let freshInput = 0
  let cacheRead = 0
  let outputTokens = 0
  let sessions = 0
  for (const file of files) {
    try {
      const raw = JSON.parse(await readFile(join(dir, file), 'utf8'))
      const record = raw?.record
      const createdAt = record?.identity?.createdAt
      if (typeof createdAt !== 'number' || createdAt < since) continue
      const rows = record?.rows ?? {}
      const usage = rows.tokenMeasurement?.val?.anchor?.usage
      const stats = rows.sessionStats?.val
      const steps = typeof stats?.steps === 'number' ? stats.steps : 0
      freshInput += steps * (usage?.inputTokens ?? 0)
      cacheRead += steps * (usage?.cacheReadTokens ?? 0)
      outputTokens += typeof stats?.decodeTokens === 'number' ? stats.decodeTokens : 0
      sessions += 1
    } catch {
      /* one unreadable cache file does not fail the estimate */
    }
  }
  const cny =
    (freshInput / 1e6) * prices.inputMiss +
    (cacheRead / 1e6) * prices.cacheHit +
    (outputTokens / 1e6) * prices.output
  return {
    ok: true,
    cny: Math.round(cny * 100) / 100,
    sessions,
    freshInput,
    cacheRead,
    outputTokens,
    currency: prices.currency,
    approx: true,
  }
}

/** Build one snapshot of the knowledge base. */
async function snapshot(root, prices) {
  const wikiDir = join(root, 'wiki')
  const rawDir = join(root, 'raw')
  const files = []
  await walkMarkdown(wikiDir, files, 0)

  const pages = new Map()
  for (const abs of files) {
    let text = ''
    try {
      text = await readFile(abs, 'utf8')
    } catch {
      continue
    }
    const rel = relative(wikiDir, abs).split(sep).join('/')
    const id = rel.replace(/\.md$/i, '')
    const heading = text.match(/^#\s+(.+)$/m)
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && !line.startsWith('>') && !line.startsWith('|'))
    const targets = [...text.matchAll(LINK_RE)].map((match) => match[1].trim()).filter(Boolean)
    pages.set(id, {
      id,
      title: (heading?.[1] ?? basename(id)).trim(),
      excerpt: lines.slice(0, 2).map(plain).join(' ').slice(0, 220),
      targets,
      inDegree: 0,
    })
  }

  const byBase = new Map()
  for (const page of pages.values()) {
    const key = page.id.split('/').pop()
    byBase.set(key, byBase.has(key) ? null : page.id)
  }
  const resolve = (target) => {
    const clean = target.replace(/\.md$/i, '').trim()
    if (pages.has(clean)) return clean
    const base = clean.split('/').pop()
    const hit = byBase.get(base)
    return hit ?? undefined
  }

  const links = []
  const seen = new Set()
  for (const page of pages.values()) {
    for (const target of page.targets) {
      const to = resolve(target)
      if (to === undefined || to === page.id) continue
      const key = `${page.id}->${to}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ source: page.id, target: to })
      pages.get(to).inDegree += 1
    }
  }
  const linkCount = [...pages.values()].reduce((sum, page) => sum + page.targets.length, 0)

  const rawFiles = []
  await walkFiles(rawDir, rawFiles, 0)
  const since = startOfToday()
  rawFiles.sort((a, b) => b.mtime - a.mtime)

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    workspace: root,
    stats: {
      pages: pages.size,
      links: linkCount,
      resolvedLinks: links.length,
      todayRaw: rawFiles.filter((file) => file.mtime >= since).length,
      cost: await estimateSpend(prices),
    },
    graph: {
      nodes: [...pages.values()].map((page) => ({
        id: page.id,
        title: page.title,
        excerpt: page.excerpt,
        inDegree: page.inDegree,
        size: 1 + page.inDegree,
      })),
      links,
    },
    recent: rawFiles.slice(0, 6).map((file) => ({
      name: file.name,
      size: file.size,
      mtime: file.mtime,
      ext: extname(file.name).toLowerCase(),
    })),
  }
}

/** Read one request body into a Buffer, refusing oversized uploads. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_IMPORT_BYTES) {
        reject(new Error('文件超过 12MB'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** A filesystem-safe name that keeps the original extension. */
function safeName(name) {
  const base = basename(String(name ?? 'dropped')).replace(/[\\/:*?"<>|]/g, '_').trim()
  return base === '' || base === '.' || base === '..' ? 'dropped' : base.slice(0, 120)
}

function sendJson(res, status, value) {
  const body = Buffer.from(JSON.stringify(value))
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': body.length,
  })
  res.end(body)
}

export function apply(ctx, config = {}) {
  const root = config.root ? String(config.root) : DEFAULT_ROOT
  const prices = {
    ...DEFAULT_PRICES,
    ...(config.prices ?? {}),
  }
  const rawDir = join(root, 'raw')
  let cached
  let cachedAt = 0

  const freshSnapshot = async () => {
    const now = Date.now()
    if (cached !== undefined && now - cachedAt < SNAPSHOT_TTL_MS) return cached
    cached = await snapshot(root, prices)
    cachedAt = now
    return cached
  }

  const handler = async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const path = url.pathname
    try {
      if (path === `${API}/snapshot` && req.method === 'GET') {
        return sendJson(res, 200, await freshSnapshot())
      }
      if (path === `${API}/import` && req.method === 'POST') {
        const body = await readBody(req)
        if (body.length === 0) return sendJson(res, 400, { ok: false, error: '空文件' })
        const wanted = safeName(url.searchParams.get('name'))
        await mkdir(rawDir, { recursive: true })
        let target = join(rawDir, wanted)
        let attempt = 1
        for (;;) {
          try {
            await stat(target)
          } catch {
            break
          }
          const ext = extname(wanted)
          const stem = wanted.slice(0, wanted.length - ext.length)
          attempt += 1
          target = join(rawDir, `${stem}-${attempt}${ext}`)
        }
        await writeFile(target, body)
        cachedAt = 0
        return sendJson(res, 200, { ok: true, saved: relative(rawDir, target) })
      }
      return sendJson(res, 404, { ok: false, error: 'not-found' })
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: String(error?.message ?? error) })
    }
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: API, handler }),
    'kb-cockpit: api',
  )
}

/** Exported for local checks: build one snapshot without mounting the plugin. */
export { snapshot }
