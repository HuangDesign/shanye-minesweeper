# 扫雷 · 山林

> 微信小游戏 · Canvas 2D · 单机扫雷 · 无需登录

以“山林”自然质感为视觉基调的扫雷小游戏。经典模式无限局，闯关模式 9 级倒计时递进；全部界面由 Canvas 2D 自绘，不使用 WXML / WXSS；进度、设置与纪录保存在本机，业务上不依赖后端（仅小程序码使用云函数，失败自动降级）。

- **需求基线**：[docs/PRD.md](docs/PRD.md)
- **开发者工具排错**：[docs/DEVTOOLS.md](docs/DEVTOOLS.md)
- **验收说明**：[docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)
- **版本**：v1.0（实现基线）
- **运行环境**：微信小游戏，基础库 3.5+，竖屏

---

## 预览

| 模式选择 | 闯关选关 |
| --- | --- |
| <img src="docs/images/menu.png" width="260" alt="模式选择"> | <img src="docs/images/levels.png" width="260" alt="闯关选关"> |

| 经典对局 | 设置面板 |
| --- | --- |
| <img src="docs/images/classic.png" width="260" alt="经典对局"> | <img src="docs/images/settings.png" width="260" alt="设置面板"> |

| 海报预览 | 海报成品（750×1334） |
| --- | --- |
| <img src="docs/images/poster-preview.png" width="260" alt="海报预览"> | <img src="docs/images/poster-sample.jpg" width="260" alt="海报成品"> |

> 截图来自本地预览环境（微信 API 的浏览器模拟层），二维码为预览用占位图；真机接入云函数后为真实小程序码。

---

## 已实现

- **经典模式**：低 9×9/10 雷、中 16×16/40 雷、高 16×30/99 雷；首次默认“中”；难度持久化；支持“随机”（每局等概率抽取）并对局内展示实际难度。
- **闯关模式**：9 关参数与 PRD 完全一致；进入即倒计时；踩雷/归零失败；通关解锁下一关；进度、最佳用时本地持久化；可重复挑战。
- **首点安全**：首次翻开时布雷，排除首点及其 8 邻域，两种情况均有兜底。
- **手势**：短按 <300ms 翻开；长按 ≥300ms 循环标记（安全 → 疑似 → 地雷 → 隐藏）；移出格子取消；长按轻振动；按钮与棋盘分区处理。
- **四态标记视觉**：叶片 / 问号 / 雷形 / 隐藏，形状差异优先；顶部只统计“地雷标记”。
- **计时**：经典首点后计时；闯关立即倒计时；最后 10 秒数字脉冲放大 + 滴答声；切后台、打开设置面板时暂停。
- **音效**：翻开、标记、取消标记、失败、通关、滴答；本地 WAV；实例复用；`touchstart` 解锁；中断恢复；全局开关。
- **分享海报**：750×1334 离屏绘制；状态文案 + 小程序码（≥280px）；保存相册；`wx.showShareImageMenu` 不可用时自动保存降级；云函数不可用时输出无二维码海报。
- **进入路径**：链接/搜索/二维码/分享卡片统一落地模式选择页；识别 `scene` 的 `c` / `pN` 并轻提示；朋友圈单页（场景值 1155）展示引导且不依赖完整存储。
- **容错**：存储损坏、清缓存、非法启动参数均不崩溃；无登录、无排行榜、无内购。

---

## 快速开始

### 1. 本地浏览器预览（不需要微信开发者工具）

预览层 `preview/wx-mock.js` 模拟了本项目用到的 `wx` API，直接复用 `minigame/js/` 下的同一份游戏代码。

```bash
# 生成预览包
node tools/build-preview.js

# 推荐：起一个本地静态服务（音频、Canvas 临时文件在 http 下更稳）
node tools/serve.js
# 打开 http://127.0.0.1:8787/preview/
```

也可以直接用 Chrome 打开 `preview/index.html`（`file://` 下也可运行；音频自动播放策略因浏览器而异）。

**调试参数**（可组合）：

| 参数 | 作用 |
| --- | --- |
| `?dev=1` | 右侧显示调试状态切换面板与操作提示 |
| `?debug=mode` / `levels` / `classic` / `classicHigh` | 直接进入模式选择 / 选关 / 经典中难度 / 经典高难度 |
| `?debug=level:5` / `level:9` / `levelPulse` | 直接进入对应关卡 / 最后 10 秒脉冲演示 |
| `?debug=settings` / `classicEnd` / `classicLose` / `levelFail` / `levelSuccess` | 打开设置或对应结算状态 |
| `?debug=poster` / `posterClassic` | 生成闯关 / 经典海报 |
| `?qr=1` | 模拟云函数返回小程序码（预览用假码） |
| `?scene=1155` | 模拟朋友圈单页模式 |
| `?share=0` | 模拟 `wx.showShareImageMenu` 不可用，验证保存降级 |
| `?w=375&h=667` | 预览指定逻辑分辨率（需同时设置浏览器视口） |
| `?qrscene=p5` | 模拟扫码进入，模式选择页提示“好友通过了第 5 关” |

### 2. 微信开发者工具（正式运行）

> **重要：必须以“小游戏项目”打开，不能是“小程序模式”。**
> 如果工具顶部显示「小程序模式」，模拟器会空白并报 `TypeError: Cannot convert undefined or null to object`；这是开发者工具项目类型选错，不是游戏代码错误。详细排查见 [docs/DEVTOOLS.md](docs/DEVTOOLS.md)。

> 工程根目录是 [minigame/](minigame/)，**不是仓库根目录**。仓库根目录放的是文档、预览和测试工具，直接导入会被开发者工具误判为其他项目类型。

1. 准备**小游戏类型**的 AppID（小程序 AppID 或 `touristappid` 可能被识别为小程序），并将 [minigame/project.config.json](minigame/project.config.json) 的 `appid` 替换为它。
2. 在开发者工具中「新建项目 → **小游戏**」，目录选择 **`minigame/`**；**不要勾选“小程序模式”**。如果旧项目已经显示“小程序模式”且无法切回，删除旧项目记录后重新按小游戏创建。
3. 确认顶部编译类型为“小游戏”/空白，再编译；无需安装前端依赖。
4. 云函数可选；不部署时海报自动降级为无二维码版本。

### 3. 云函数（小程序码，可选）

```bash
cd minigame/cloudfunctions/getQrCode
npm install
```

1. 在微信开发者工具中开通云开发环境。
2. 将环境 ID 填入 [minigame/js/config.js](minigame/js/config.js) 的 `CLOUD.env`；留空则使用默认环境。若自动识别开发版/体验版失败，可设置 `CLOUD.envVersion` 为 `develop` / `trial` / `release` 强制指定。
3. 右键 `minigame/cloudfunctions/getQrCode` →「上传并部署：云端安装依赖」。
4. 云函数已通过 `minigame/cloudfunctions/getQrCode/config.json` 声明 `wxacode.getUnlimited` 权限；前端会按开发版/体验版/正式版传递 `envVersion`。
5. 真机上生成一次海报验证二维码；若失败，游戏主体与无二维码海报仍可用。

### 4. 分享卡片

- 已注册 `wx.onShareAppMessage`，分享标题为山林风格，卡片图在运行时绘制为 500×400 本地图片，落地 query `from=card`，统一进入模式选择页。
- 通过右上角菜单转发即可；无需额外按钮。

---

## 目录

```
minigame/                   ★ 微信开发者工具导入这个目录（小游戏工程根）
  game.js                   小游戏入口
  game.json                 小游戏配置（竖屏、隐藏状态栏）
  project.config.json       开发者工具项目配置（compileType: game）
  js/
    config.js               难度、关卡外观常量、颜色、字体、时间阈值
    levels.js               闯关参数、时间格式化、进度与最佳纪录
    storage.js              本地持久化与容错（含预览/1155 内存模式）
    game-core.js            布雷、首点安全、BFS 展开、标记、胜负
    renderer.js             Canvas 2D 分层渲染、山林视觉、脏区更新
    input.js                短按 / 长按 300ms / 移出取消 / 多指取消
    audio.js                音效实例复用、解锁、开关、中断恢复
    share.js                750×1334 海报、二维码、保存、分享降级、分享卡片
    launch.js               启动参数与 scene 解析
    main.js                 状态机、计时、结算、海报流程、调试桩
  audio/                    本地合成的 WAV 音效
  cloudfunctions/getQrCode/ 小程序码云函数（含 openapi 权限声明）

docs/                       需求、验收、开发者工具排错
  PRD.md
  ACCEPTANCE.md
  DEVTOOLS.md
  images/
preview/                    浏览器预览（wx API mock + 生成包）
tests/run.js                核心逻辑与存储单测（24 项）
tools/
  gen-audio.js              重新生成 WAV 音效
  build-preview.js          生成 preview/bundle.js
  serve.js                  本地静态预览服务
  interact.js               CDP 真实交互回归（39 项断言）
  capture.js                指定状态截图
  eval.js                   预览页任意表达式调试
```

游戏工程与开发工具分离：`minigame/` 内只有小游戏文件，预览/测试/文档都在仓库根目录，不会被打进小游戏包，也不会干扰开发者工具识别项目类型。

---

## 规则与交互要点

- **短按**：按下至抬起 <300ms，且手指未移出该格 → 翻开；已标记格也会翻开（若是雷则失败并清除标记）。
- **长按**：≥300ms → 标记循环 `隐藏 → 安全 → 疑似 → 地雷 → 隐藏`，触发时轻振（开关开启时）。
- **取消**：移出格子边界 / 多指触摸 / 触摸取消 → 不执行翻开与标记。
- **首点安全**：点击后才布雷，排除首点 3×3 邻域；若可布雷格不足则只排除首点，保证首点不是雷。
- **展开**：零邻雷格使用 BFS 队列展开；已标记格不会被自动展开吞掉。
- **计时**：经典模式首次翻开开始；闯关进入即开始；设置面板打开、App 切后台时暂停。
- **结算**：失败展示全部地雷；结算面板可关闭以查看棋盘，点击棋盘可重新打开结算；胜利自动为全部地雷补旗。

---

## 技术实现

### 渲染

- 主 Canvas + 场景层（`sceneCanvas`）+ 背景层（`bgCanvas`）。
- 背景（山体、松林、雾气、月光、颗粒、暗角）只在尺寸变化时重建。
- 棋盘仅在格子状态变化时重绘对应格子；HUD 计时区域使用背景局部还原后重绘；动画期间只重绘参与动画的格子。
- `requestAnimationFrame` 驱动，无持续整屏重绘；菜单页为静态画面。
- 全 Canvas 自绘：模式选择、选关、对局、设置、结算、海报预览均为 Canvas 页面。

### 输入

- `touchstart` 记录时间、坐标、格子；`touchmove` 越界取消；`touchend` 判定短按。
- 长按定时器 300ms；定时器触发后 `touchend` 不再翻开；主线程繁忙导致延迟时在 `touchend` 兜底判定。
- 按钮与棋盘分区命中；浮层使用独立命中层，避免穿透。
- 数据坐标统一为 `cells[row][col]`。

### 计时与暂停

- 以帧间隔累计 `elapsedMs`，避免直接依赖系统时间跳变。
- 闯关倒计时进入即运行；`elapsed >= time * 1000` 判超时。
- 设置面板打开、App 隐藏、海报预览时暂停，返回后继续。

### 音效

- 每种音效只创建一个 `InnerAudioContext`，`useWebAudioImplement: true`，本地 WAV。
- `touchstart` 中调用 `audio.unlock()` 播放近静音短音完成解锁。
- 音效开关持久化；静音仍可继续游戏；音频中断结束后恢复。
- 音效资源可用 `node tools/gen-audio.js` 重新生成。

### 海报与二维码

- 750×1334 离屏 Canvas 绘制：品牌标题、状态文案（【】高亮）、数据卡、二维码卡、页脚。
- 二维码 300×300；云函数 `wxacode.getUnlimited` 返回 base64，前端写临时文件或 data URI 后 `drawImage`。
- 海报导出同时兼容小游戏 `Canvas.toTempFilePath` 与小程序 `wx.canvasToTempFilePath`，避免小游戏环境无法保存海报。
- 云函数不可用 / 超时 6s：绘制“小程序码暂不可用”占位，海报仍可保存/分享。
- 保存相册处理相册授权；图片分享失败或 API 不存在时自动保存相册并提示手动发送。
- 分享卡片图在启动后异步绘制，避免额外静态资源。

### 数据

| Key | 内容 |
| --- | --- |
| `settings` | `{ sound, vibrate }` |
| `classicDifficulty` | `low / mid / high / random` |
| `classicBest` | `{ low, mid, high }` |
| `levelProgress` | `{ unlocked, bestTimes }` |

所有读取均校验类型与取值；清缓存后回到默认设置；朋友圈单页模式（1155）使用内存存储，不读写玩家纪录。

---

## 测试

```bash
# 24 项纯逻辑 / 存储单测（Node，无依赖）
npm test

# 39 项浏览器真实交互回归（需要 Chrome，macOS 默认路径）
npm run test:interaction

# 代码更新后重新生成预览包
npm run preview:build
```

交互回归覆盖：

- 短按翻开、首点后计时；
- 长按 300ms 标记、移出取消；
- 按钮按压视觉、设置面板打开/关闭；
- 音效开关、设置面板暂停倒计时；
- 选关、关卡倒计时推进；
- 结算面板关闭 / 点击棋盘重新打开；
- 海报生成、保存、无二维码降级、图片分享不可用时的保存降级；
- 云函数二维码海报路径；
- 扫码 scene 提示、朋友圈单页 1155 模式。

截图工具：

```bash
node tools/capture.js \
  --url "file://$(pwd)/preview/index.html" \
  --debug classic --out /tmp/classic.png
```

截图脚本默认使用 macOS Chrome 路径（`/Applications/Google Chrome.app/...`）；其他系统请修改 `tools/capture.js` 与 `tools/interact.js` 顶部的 `CHROME` 常量。

---

## 入口与发布配置

以下配置在微信公众平台完成，无法由代码替代：

1. **搜索进入**：MP 平台配置“功能直达 / 搜索关键词”，建议召回词：`扫雷`、`单机扫雷`、`山林扫雷`、`经典扫雷`。
2. **链接进入**：MP 平台「工具 → 生成 URL Scheme / URL Link」，路径指向小游戏入口启动页，可附带来源参数（如 `from=link`）。所有入口都会落地模式选择页。
3. **二维码**：海报中的小程序码由云函数生成，`scene` 为 `c`（经典）或 `pN`（第 N 关）；前端读取 `query.scene` 后在模式选择页轻提示。
4. **分享卡片**：需真实 AppID；顶部菜单转发落地模式选择页。
5. **朋友圈**：通过“保存到相册”后用户手动发布；代码不直接唤起朋友圈发布。

---

## 已知限制与真机待验证

1. **高难度格子物理尺寸**：PRD 要求“16×30 格子不小于 28–30px”，但 16 列在 375–390pt 宽屏幕上即使零边距也无法达到 28pt。
   - 实现为优先压缩间距、再适配屏幕：390×844 下 16×16 约 21–22pt/格，16×30 约 19–20pt/格；375×667 下 16×30 约 14–15pt/格。
   - 物理像素（DPR 2–3）远大于 28px，但按 CSS pt 计未达到 PRD 数值；这是已记录的物理约束偏差，详见 [PRD §14.1](docs/PRD.md#14-实现判定与偏差记录开发基线补充)。
   - 未引入缩放/平移棋盘（首版不做未定义扩展）；若真机反馈点击困难，建议上线前追加“放大 + 双指平移”方案。
2. **图片分享 API**：`wx.showShareImageMenu` 在目标基础库/机型上的支持需真机验证；失败时已自动保存相册并提示。
3. **云函数与二维码**：需真实 AppID 与云环境；开发版/体验版/正式版 `envVersion` 需真机确认。
4. **振动与音频**：iOS 静音开关、振动强度、首次解锁时机需真机复核。
5. **字体**：海报与界面使用宋体/苹方/CJK 字体栈；Android 字体回退可能与截图略有差异。
6. **性能**：已在桌面 Chrome 和逻辑层压测，未在低端真机做帧率采样；16×30 首次全量绘制与脏区更新均为可接受范围。

---

## 文档

- [docs/PRD.md](docs/PRD.md)：整理后的产品需求、实现判定与偏差记录。
- [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)：PRD 第 13 章 12 条验收标准的逐项对照与证据。
- 截图：`docs/images/`。
