# 知识库驾驶舱（dsh-kb-cockpit）

黄师傅模式专属的左栏面板。当前会话用别的模式时，左栏图标不渲染，面板也只剩一句提示。

## 它读什么

- `wiki/**/*.md` — 笔记页；页内 `[[双链]]` 解析成图的边。
- `raw/**` — 原件；按 mtime 算「今日收录」，并列出最近 6 条。
- `~/.dsh/storages/session_projcache/sessions/*.json` — 只读，用来估算今日花费。

## 四个数字

| 指标 | 口径 |
|---|---|
| 笔记页数 | `wiki/` 下的 `.md` 文件数 |
| 链接条数 | 全部 `[[...]]` 出现次数（图里只画能解析到页面的边） |
| 今日收录 | `raw/` 中 mtime ≥ 今天 0 点的文件数 |
| 今日花费 | **估算**：今天创建的 DSH 会话，按步数 × 单步上下文 tokens 与新输入/缓存读/输出三档单价折算 |

花费一定不是账单金额。口径写死在这里，改单价改 `cordis.patch.yml` 的 `prices`。

## 交互

- 图：`warmupTicks: 300` 预跑布局，`cooldownTicks: 0` 停住；挂载后 `zoomToFit` 缩到一屏。
- 点节点 → 高亮 + 右栏显示标题与两行摘要；点空白 → 取消选中。
- 悬停 → 只亮自己和相邻点，其余压暗。
- 拖文件到虚线区 → POST 到 `/kb-cockpit/api/import`，落到 `raw/`，面板随即刷新。

## 代码结构

```
index.js                 Host 半：读知识库、估花费、两条 HTTP 路由
lib/app.js               浏览器半的源码（React + force-graph）
build.mjs                把 vendor/force-graph.min.js 内联进 client.js
client.js                产物：被 dsh.client 加载的浏览器 bundle（改源码后重跑 build.mjs）
vendor/force-graph.min.js force-graph 1.52.0，MIT，本地文件，不联网加载
```

改完 `lib/app.js` 或换 vendor 版本后，跑 `node build.mjs` 重新生成 `client.js`。
浏览器侧改动只在页面刷新后生效。

## 接口

- `GET /kb-cockpit/api/snapshot` → 统计、图数据、最近收录
- `POST /kb-cockpit/api/import?name=<file>` → 请求体为文件字节，写入 `raw/`

## force-graph

MIT License，版权归原作者 Vasco Asturiano。https://github.com/vasturiano/force-graph
