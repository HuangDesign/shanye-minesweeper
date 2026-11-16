window.__ModuleLoader__.load({
  id: 'dsh-kb-cockpit',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const react = require('react')
    const h = react.createElement

    //__FORCE_GRAPH_INLINE__

    const PANEL_ID = 'kb-cockpit'
    const PRESET_ID = 'huangshifu'
    const API = '/kb-cockpit/api'
    const inject = ['slots']

    const COPY = {
      zh: {
        panel: '知识库驾驶舱',
        'stats.pages': '笔记页数',
        'stats.links': '链接条数',
        'stats.today': '今日收录',
        'stats.cost': '今日花费',
        'stats.costUnit': '份',
        'stats.est': '估算',
        'graph.title': '网状关系图',
        'graph.sub': '{pages} 页 · {links} 链接',
        'graph.empty': 'wiki/ 里还没有笔记',
        'recent.title': '最近收录',
        'recent.empty': 'raw/ 还是空的',
        'detail.title': '选中详情',
        'detail.hint': '点左边的点，看它的标题和摘要。再点空白处取消。',
        'detail.links': '被引用 {n} 次',
        'drop.title': '把文件拖到这里',
        'drop.hint': '落在 raw/，算作原件',
        'drop.busy': '正在导入…',
        'drop.done': '已导入 {n} 份',
        'drop.fail': '导入失败：{msg}',
        'error.load': '驾驶舱数据没拉下来：{msg}',
        'retry': '重试',
        'disabled': '这个驾驶舱只在「黄师傅」模式下出现。切回黄师傅，它会自己回来。',
        'loading': '正在读知识库…',
      },
      en: {
        panel: 'Knowledge cockpit',
        'stats.pages': 'Notes',
        'stats.links': 'Links',
        'stats.today': 'Added today',
        'stats.cost': 'Spend today',
        'stats.costUnit': 'files',
        'stats.est': 'estimate',
        'graph.title': 'Link graph',
        'graph.sub': '{pages} notes · {links} links',
        'graph.empty': 'No notes under wiki/ yet',
        'recent.title': 'Recently added',
        'recent.empty': 'raw/ is still empty',
        'detail.title': 'Selected note',
        'detail.hint': 'Click a node to read its title and summary. Click empty space to clear.',
        'detail.links': 'Referenced {n} times',
        'drop.title': 'Drop files here',
        'drop.hint': 'They land in raw/ as originals',
        'drop.busy': 'Importing…',
        'drop.done': 'Imported {n}',
        'drop.fail': 'Import failed: {msg}',
        'error.load': 'Could not load the cockpit: {msg}',
        'retry': 'Retry',
        'disabled': 'This cockpit only appears in the 黄师傅 mode. Switch back and it returns.',
        'loading': 'Reading the knowledge base…',
      },
    }

    const CSS = `
.kbc-root{--kbc-bg:#0e0d0b;--kbc-panel:#16140f;--kbc-line:rgba(217,188,122,.18);
--kbc-gold:#d9bc7a;--kbc-gold-dim:#a98f5c;--kbc-ink:#efe7d6;--kbc-muted:#94897a;
display:flex;flex-direction:column;height:100%;width:100%;min-height:0;box-sizing:border-box;
background:radial-gradient(120% 90% at 12% -10%,#1d1a13 0%,var(--kbc-bg) 58%),var(--kbc-bg);
color:var(--kbc-ink);font-family:system-ui,-apple-system,"PingFang SC","Noto Sans SC",sans-serif;
overflow:hidden}
.kbc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;flex:0 0 auto;
background:linear-gradient(180deg,rgba(217,188,122,.14),rgba(217,188,122,0));
border-bottom:1px solid var(--kbc-line)}
.kbc-stat{padding:14px 20px 16px;background:linear-gradient(180deg,rgba(255,255,255,.02),transparent)}
.kbc-stat dt{font-size:11px;letter-spacing:.14em;color:var(--kbc-muted);text-transform:uppercase}
.kbc-stat dd{margin:6px 0 0;font-size:26px;line-height:1.05;font-weight:600;color:var(--kbc-gold);
font-variant-numeric:tabular-nums}
.kbc-stat dd small{margin-left:6px;font-size:11px;font-weight:500;color:var(--kbc-gold-dim);letter-spacing:.02em}
.kbc-body{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:2fr 1fr;gap:14px;padding:14px}
.kbc-card{background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,0)),var(--kbc-panel);
border:1px solid var(--kbc-line);border-radius:14px;box-sizing:border-box;min-height:0}
.kbc-graph{position:relative;display:flex;flex-direction:column;overflow:hidden}
.kbc-graph-head{display:flex;align-items:baseline;gap:10px;padding:12px 16px 8px;flex:0 0 auto}
.kbc-graph-head b{font-size:13px;font-weight:600;letter-spacing:.04em;color:var(--kbc-ink)}
.kbc-graph-head span{font-size:11px;color:var(--kbc-muted)}
.kbc-canvas{flex:1 1 auto;min-height:0;position:relative}
.kbc-canvas canvas{display:block;border-radius:0 0 14px 14px}
.kbc-side{display:flex;flex-direction:column;gap:12px;min-height:0}
.kbc-side .kbc-card{padding:12px 14px 14px;display:flex;flex-direction:column;min-height:0}
.kbc-card h3{margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
color:var(--kbc-gold-dim)}
.kbc-recent{flex:0 1 auto;max-height:38%;overflow:auto}
.kbc-recent ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.kbc-recent li{display:flex;align-items:baseline;gap:8px;padding:6px 8px;border-radius:8px;font-size:12.5px}
.kbc-recent li:hover{background:rgba(217,188,122,.07)}
.kbc-recent .kbc-name{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d8d0c0}
.kbc-recent .kbc-when{flex:0 0 auto;font-size:11px;color:var(--kbc-muted);font-variant-numeric:tabular-nums}
.kbc-recent .kbc-ext{flex:0 0 auto;font-size:10px;letter-spacing:.08em;color:var(--kbc-gold-dim);
border:1px solid var(--kbc-line);border-radius:4px;padding:0 4px}
.kbc-detail{flex:1 1 auto;overflow:auto}
.kbc-detail-title{margin:0;font-size:15px;font-weight:600;line-height:1.4;color:var(--kbc-gold)}
.kbc-detail-body{margin:8px 0 0;font-size:12.5px;line-height:1.75;color:#cbc2b1;
display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.kbc-detail-meta{margin-top:10px;font-size:11px;color:var(--kbc-muted);font-variant-numeric:tabular-nums}
.kbc-hint{margin:0;font-size:12.5px;line-height:1.7;color:var(--kbc-muted)}
.kbc-drop{flex:0 0 auto;min-height:104px;display:flex;flex-direction:column;justify-content:center;
align-items:center;gap:4px;padding:14px;border:1.5px dashed rgba(217,188,122,.42);border-radius:14px;
background:linear-gradient(180deg,rgba(217,188,122,.05),rgba(217,188,122,0));text-align:center;
transition:border-color .15s ease,background .15s ease}
.kbc-drop[data-over="1"]{border-color:var(--kbc-gold);background:rgba(217,188,122,.12)}
.kbc-drop b{font-size:13px;font-weight:600;color:var(--kbc-gold)}
.kbc-drop span{font-size:11.5px;color:var(--kbc-muted)}
.kbc-drop[data-busy="1"]{opacity:.7}
.kbc-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
padding:24px;text-align:center;font-size:12.5px;color:var(--kbc-muted)}
.kbc-fail{color:#e0a08a}
.kbc-retry{margin-left:8px;background:transparent;border:1px solid var(--kbc-line);color:var(--kbc-gold);
border-radius:6px;padding:2px 8px;font-size:11.5px;cursor:pointer}
`

    /** Bind the panel copy to the host locale, with a fixed fallback table. */
    function makeT(ctx) {
      let translate
      try {
        ctx.locale.register('kb-cockpit', 'zh', COPY.zh)
        ctx.locale.register('kb-cockpit', 'en', COPY.en)
        translate = ctx.locale.bind('kb-cockpit')
      } catch {
        translate = undefined
      }
      return (key, vars) => {
        let text
        if (typeof translate === 'function') {
          try {
            text = translate(key, vars)
          } catch {
            text = undefined
          }
        }
        if (text === undefined || text === key) text = COPY.zh[key] ?? COPY.en[key] ?? key
        if (vars !== undefined) {
          for (const [name, value] of Object.entries(vars)) {
            text = text.replaceAll(`{${name}}`, String(value))
          }
        }
        return text
      }
    }

    /**
     * Read one value from a slot's session store. The hook is stable for a
     * given slot registration, so the conditional call keeps hook order.
     */
    function useSessionValue(hook, selector) {
      if (typeof hook === 'function') return hook(selector)
      return undefined
    }

    /** The preset of the Session the main column currently shows. */
    function currentPresetOf(state) {
      const sessions = state?.byId
      if (sessions === undefined) return undefined
      for (const session of Object.values(sessions)) {
        if ((session?.retainedBy?.mainView ?? 0) > 0) {
          const value = session?.projectionValues?.agentPreset
          return typeof value === 'string' ? value : undefined
        }
      }
      return undefined
    }

    function CockpitIcon(props) {
      const preset = useSessionValue(props.useSessions, (state) => currentPresetOf(state))
      if (preset !== PRESET_ID) return null
      const size = props.size ?? 16
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('circle', { cx: 12, cy: 5.5, r: 2.2 }),
        h('circle', { cx: 5.5, cy: 17, r: 2.2 }),
        h('circle', { cx: 18.5, cy: 17, r: 2.2 }),
        h('circle', { cx: 12, cy: 12, r: 1.4 }),
        h('path', { d: 'M12 7.7v2.9M10.9 12.6 7.2 15.6M13.1 12.6l3.7 3' }),
      )
    }

    function Stat({ label, value, unit, note }) {
      return h(
        'div',
        { className: 'kbc-stat' },
        h('dt', null, label),
        h('dd', null, value, unit ? h('small', null, unit) : null, note ? h('small', null, note) : null),
      )
    }

    function timeOf(ms) {
      const date = new Date(ms)
      const pad = (n) => String(n).padStart(2, '0')
      return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    function sizeOf(bytes) {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

    /** force-graph canvas: pre-warmed layout, labels on the ten most cited nodes. */
    function GraphView({ nodes, links, topIds, selectedId, hoverId, onSelect, onHover, t }) {
      const boxRef = react.useRef(null)
      const graphRef = react.useRef(null)
      const dataRef = react.useRef({ selectedId, hoverId, topIds })

      // Rewrite the accessors after a selection or hover change, then repaint.
      const restyle = react.useCallback(() => {
        const graph = graphRef.current
        if (graph === null) return
        const { selectedId: selected, hoverId: hovered } = dataRef.current
        const ids = dataRef.current.topIds
        const neighbours = new Set()
        if (hovered !== undefined) {
          neighbours.add(hovered)
          for (const link of links) {
            const source = typeof link.source === 'object' ? link.source.id : link.source
            const target = typeof link.target === 'object' ? link.target.id : link.target
            if (source === hovered) neighbours.add(target)
            if (target === hovered) neighbours.add(source)
          }
        }
        const lit = (id) => (hovered === undefined ? true : neighbours.has(id))
        graph.nodeColor((node) => {
          if (!lit(node.id)) return 'rgba(217,188,122,.14)'
          if (node.id === selected) return '#f4e3b4'
          if (ids.has(node.id)) return '#d9bc7a'
          return 'rgba(169,143,92,.9)'
        })
        graph.linkColor((link) => {
          const source = typeof link.source === 'object' ? link.source.id : link.source
          const target = typeof link.target === 'object' ? link.target.id : link.target
          const touch = hovered !== undefined && (source === hovered || target === hovered)
          const picked = selected !== undefined && (source === selected || target === selected)
          if (touch || picked) return 'rgba(233,200,132,.85)'
          if (hovered !== undefined) return 'rgba(217,188,122,.06)'
          return 'rgba(217,188,122,.22)'
        })
        graph.linkWidth(() => (hovered === undefined ? 0.7 : 1.1))
        if (typeof graph._rerender === 'function') graph._rerender()
      }, [links])

      react.useEffect(() => {
        dataRef.current = { selectedId, hoverId, topIds }
        restyle()
      }, [selectedId, hoverId, topIds, restyle])

      react.useEffect(() => {
        const box = boxRef.current
        if (box === null) return undefined
        const graph = ForceGraph()(box)
        graphRef.current = graph
        graph
          .graphData({ nodes: nodes.map((n) => ({ ...n })), links: links.map((l) => ({ ...l })) })
          .nodeId('id')
          .nodeVal((node) => Math.min(1 + node.inDegree, 9))
          .nodeRelSize(3.4)
          .nodeLabel((node) => `${node.title} · ${t('detail.links', { n: node.inDegree })}`)
          .linkDirectionalArrowLength(0)
          .backgroundColor('rgba(0,0,0,0)')
          .warmupTicks(300)
          .cooldownTicks(0)
          .onNodeClick((node) => onSelect(node.id))
          .onBackgroundClick(() => onSelect(null))
          .onNodeHover((node) => onHover(node?.id ?? null))
          .onNodeDragEnd((node) => {
            node.fx = node.x
            node.fy = node.y
          })
          .nodeCanvasObjectMode(() => 'after')
          .nodeCanvasObject((node, ctx, scale) => {
            const { selectedId: selected, hoverId: hovered, topIds: ids } = dataRef.current
            const show = ids.has(node.id) || node.id === selected || node.id === hovered
            const radius = Math.sqrt(Math.min(1 + node.inDegree, 9)) * 3.4
            if (node.id === selected) {
              ctx.beginPath()
              ctx.arc(node.x, node.y, radius + 3.5, 0, Math.PI * 2)
              ctx.strokeStyle = 'rgba(244,227,180,.9)'
              ctx.lineWidth = 1.4 / scale
              ctx.stroke()
            }
            if (!show) return
            const label = node.title.length > 14 ? `${node.title.slice(0, 13)}…` : node.title
            const fontSize = Math.max(9, 11.5 / scale)
            ctx.font = `600 ${fontSize}px system-ui,-apple-system,"PingFang SC",sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            const dim = hovered !== undefined && node.id !== hovered && !ids.has(node.id)
            ctx.fillStyle = dim ? 'rgba(239,231,214,.45)' : 'rgba(239,231,214,.92)'
            ctx.fillText(label, node.x, node.y + radius + 4 / scale)
          })

        const resize = () => {
          const width = box.clientWidth
          const height = box.clientHeight
          if (width === 0 || height === 0) return
          graph.width(width).height(height)
          graph.zoomToFit(0, 42)
        }
        resize()
        restyle()
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : undefined
        observer?.observe(box)

        return () => {
          observer?.disconnect()
          if (typeof graph._destructor === 'function') graph._destructor()
          graphRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [nodes, links])

      return h('div', { className: 'kbc-canvas', ref: boxRef })
    }

    function CockpitPage(props) {
      const t = props.t ?? ((key) => key)
      const preset = useSessionValue(props.useSessions, (state) => currentPresetOf(state))
      const [state, setState] = react.useState({ status: 'loading', data: null, error: null })
      const [selectedId, setSelectedId] = react.useState(null)
      const [hoverId, setHoverId] = react.useState(undefined)
      const [dropState, setDropState] = react.useState({ over: false, busy: false, message: null, failed: false })
      const alive = react.useRef(true)

      const load = react.useCallback(async () => {
        try {
          const response = await fetch(`${API}/snapshot`, { headers: { accept: 'application/json' } })
          const payload = await response.json().catch(() => null)
          if (!response.ok || payload?.ok !== true) {
            throw new Error(payload?.error ?? `HTTP ${response.status}`)
          }
          if (!alive.current) return
          setState({ status: 'ready', data: payload, error: null })
        } catch (error) {
          if (!alive.current) return
          setState({ status: 'failed', data: null, error: String(error?.message ?? error) })
        }
      }, [])

      react.useEffect(() => {
        alive.current = true
        load()
        return () => {
          alive.current = false
        }
      }, [load])

      const data = state.data
      const nodes = data?.graph?.nodes ?? []
      const links = data?.graph?.links ?? []
      const byId = react.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
      const topIds = react.useMemo(() => {
        const sorted = [...nodes].sort((a, b) => b.inDegree - a.inDegree || a.id.localeCompare(b.id))
        return new Set(sorted.slice(0, 10).filter((node) => node.inDegree > 0).map((node) => node.id))
      }, [nodes])
      const selected = selectedId === null ? undefined : byId.get(selectedId)

      const onDrop = react.useCallback(
        async (event) => {
          event.preventDefault()
          const files = [...(event.dataTransfer?.files ?? [])]
          if (files.length === 0) return
          setDropState({ over: false, busy: true, message: null, failed: false })
          let saved = 0
          try {
            for (const file of files) {
              const response = await fetch(`${API}/import?name=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                headers: { 'content-type': 'application/octet-stream' },
                body: file,
              })
              const payload = await response.json().catch(() => null)
              if (!response.ok || payload?.ok !== true) {
                throw new Error(payload?.error ?? `HTTP ${response.status}`)
              }
              saved += 1
            }
            await load()
            setDropState({ over: false, busy: false, message: t('drop.done', { n: saved }), failed: false })
          } catch (error) {
            setDropState({
              over: false,
              busy: false,
              message: t('drop.fail', { msg: String(error?.message ?? error) }),
              failed: true,
            })
          }
        },
        [load, t],
      )

      if (preset !== PRESET_ID) {
        return h('div', { className: 'kbc-root' }, h('div', { className: 'kbc-overlay' }, t('disabled')))
      }

      const stats = data?.stats
      const cost = stats?.cost
      const costValue = cost?.ok === true ? Number(cost.cny).toFixed(2) : '—'
      const recent = data?.recent ?? []

      return h(
        'div',
        { className: 'kbc-root' },
        h(
          'dl',
          { className: 'kbc-stats' },
          h(Stat, { label: t('stats.pages'), value: stats === undefined ? '—' : stats.pages }),
          h(Stat, { label: t('stats.links'), value: stats === undefined ? '—' : stats.links }),
          h(Stat, { label: t('stats.today'), value: stats === undefined ? '—' : stats.todayRaw, unit: t('stats.costUnit') }),
          h(Stat, {
            label: t('stats.cost'),
            value: `${cost?.ok === true ? cost.currency : ''}${costValue}`,
            note: cost?.ok === true ? t('stats.est') : undefined,
          }),
        ),
        h(
          'div',
          { className: 'kbc-body' },
          h(
            'section',
            { className: 'kbc-card kbc-graph' },
            h(
              'div',
              { className: 'kbc-graph-head' },
              h('b', null, t('graph.title')),
              h('span', null, t('graph.sub', { pages: stats?.pages ?? 0, links: stats?.links ?? 0 })),
            ),
            state.status === 'ready' && nodes.length > 0
              ? h(GraphView, {
                  nodes,
                  links,
                  topIds,
                  selectedId: selectedId ?? undefined,
                  hoverId,
                  onSelect: (id) => setSelectedId(id),
                  onHover: (id) => setHoverId(id ?? undefined),
                  t,
                })
              : h(
                  'div',
                  { className: 'kbc-overlay' },
                  state.status === 'loading'
                    ? t('loading')
                    : state.status === 'failed'
                      ? h(
                          'span',
                          { className: 'kbc-fail' },
                          t('error.load', { msg: state.error }),
                          h(
                            'button',
                            { type: 'button', className: 'kbc-retry', onClick: load },
                            t('retry'),
                          ),
                        )
                      : t('graph.empty'),
                ),
          ),
          h(
            'aside',
            { className: 'kbc-side' },
            h(
              'section',
              { className: 'kbc-card kbc-recent' },
              h('h3', null, t('recent.title')),
              recent.length === 0
                ? h('p', { className: 'kbc-hint' }, t('recent.empty'))
                : h(
                    'ul',
                    null,
                    recent.map((file) =>
                      h(
                        'li',
                        { key: file.name, title: `${file.name} · ${sizeOf(file.size)}` },
                        h('span', { className: 'kbc-ext' }, (file.ext || '·').replace('.', '').slice(0, 4)),
                        h('span', { className: 'kbc-name' }, file.name),
                        h('span', { className: 'kbc-when' }, timeOf(file.mtime)),
                      ),
                    ),
                  ),
            ),
            h(
              'section',
              { className: 'kbc-card kbc-detail' },
              h('h3', null, t('detail.title')),
              selected === undefined
                ? h('p', { className: 'kbc-hint' }, t('detail.hint'))
                : h(
                    'div',
                    null,
                    h('p', { className: 'kbc-detail-title' }, selected.title),
                    h('p', { className: 'kbc-detail-body' }, selected.excerpt || '—'),
                    h('p', { className: 'kbc-detail-meta' }, t('detail.links', { n: selected.inDegree })),
                  ),
            ),
            h(
              'div',
              {
                className: 'kbc-drop',
                'data-over': dropState.over ? '1' : '0',
                'data-busy': dropState.busy ? '1' : '0',
                onDragOver: (event) => {
                  event.preventDefault()
                  setDropState((current) => (current.over ? current : { ...current, over: true }))
                },
                onDragLeave: () => setDropState((current) => (current.over ? { ...current, over: false } : current)),
                onDrop,
              },
              h('b', null, dropState.busy ? t('drop.busy') : t('drop.title')),
              h(
                'span',
                { className: dropState.failed ? 'kbc-fail' : undefined },
                dropState.message ?? t('drop.hint'),
              ),
            ),
          ),
        ),
      )
    }

    function apply(ctx) {
      const t = makeT(ctx)
      const style = document.createElement('style')
      style.dataset.plugin = 'dsh-kb-cockpit'
      style.textContent = CSS
      document.head.appendChild(style)
      ctx.effect(() => () => style.remove(), 'kb-cockpit: styles')

      const page = (props) => h(CockpitPage, { ...props, t })
      const icon = (props) => h(CockpitIcon, props)

      ctx.slots.inject('main', function* () {
        yield ctx.slots.register({ name: 'main', key: PANEL_ID, label: t('panel') }, page)
      })
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order: 2, label: t('panel') }, icon),
      )
    }

    exports.PANEL_ID = PANEL_ID
    exports.CockpitPage = CockpitPage
    exports.CockpitIcon = CockpitIcon
    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
