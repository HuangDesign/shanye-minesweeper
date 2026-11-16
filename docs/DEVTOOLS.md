# 微信开发者工具运行说明

## 当前状态：已经可以直接试运行

仓库根目录现在带一个**微信小程序预览壳**，专门用于在“小程序模式”的微信开发者工具里试玩；它只包含一个承载 Canvas 的页面，游戏代码复用 [minigame/js/](../minigame/js/)。

已在开发者工具（Stable 1.06.2504030，lib 3.17.6）模拟器验证：

- 模式选择页正常渲染；
- 经典模式可开始（16×16）；
- 短按可翻开格子（BFS 展开 71 格）；
- 长按 300ms 可标记，顶部计数变为 1；
- 闯关模式、计时 HUD、设置入口、海报入口均正常显示。

实拍：

- 模式选择：[images/devtools-running.png](images/devtools-running.png)
- 实际对局：[images/devtools-game.png](images/devtools-game.png)

> HUD 的返回 / 设置 / 重开按钮已统一移到左上角，避开微信右上角胶囊；对局实拍中可直接看到。

## 直接在开发者工具试运行

1. 开发者工具打开**仓库根目录**（当前项目 `shanye-devtools-preview`）。
2. 点击「编译」；模拟器显示“扫雷 · 山林”模式选择页即成功。
3. 根目录配置：
   - [project.config.json](../project.config.json)：`compileType: "miniprogram"`，`appid: "touristappid"`；
   - [app.json](../app.json) / [app.js](../app.js)：小程序入口；
   - [pages/index/index.js](../pages/index/index.js)：Canvas 宿主，创建游戏实例并把触摸事件转发给 Input；
   - 游戏内核仍来自 `minigame/js/`，音频来自 `minigame/audio/`。

> 如果你之前打开的是旧项目/旧缓存，先「清缓存 → 全部清除」再编译；本项目已经补齐根目录 `app.json`，不会再报 `app.json is not found`。

## 两种运行形态（不要混淆）

| 形态 | 位置 | 配置 | 用途 |
| --- | --- | --- | --- |
| **小程序预览壳** | 仓库根目录 | `compileType: miniprogram`，`touristappid` | 在“小程序模式”的开发者工具里立即试玩；WXML/WXSS 只用于 canvas 宿主，游戏 UI 全部是 Canvas |
| **正式小游戏工程** | [minigame/](../minigame/) | [minigame/project.config.json](../minigame/project.config.json) 中 `compileType: "game"` | 用小游戏 AppID 发布、真机调试、分享/云函数 |

正式小游戏：

1. 准备**小游戏 AppID**；
2. 开发者工具「新建项目 → 小游戏」，目录选择 `minigame/`；
3. AppID 填小游戏 AppID，**不要选小程序模式**；
4. 编译。

如果新建小游戏项目仍被识别为小程序，通常是 AppID 不是小游戏类型，或公众平台服务类目不是“游戏”；需要更换 AppID/账号。此时仍可用根目录预览壳试玩。

## 常见错误

### `app.json is not found` / `app.json: 在项目根目录未找到`

说明当前项目按**小程序**编译，但项目根目录没有 `app.json`。

- 用根目录预览壳：确认打开的是仓库根目录，根目录已有 `app.json`；
- 不要用“小程序”方式打开 `minigame/`（正式小游戏工程没有 `app.json`）；
- 正式小游戏请按“小游戏”项目导入 `minigame/`。

### `SummerCompiler ... getAllPageAndComponent` / `Cannot convert undefined or null to object`

这是开发者工具在“小程序模式”下找不到 app 配置时的内部异常。根目录预览壳补齐 `app.json` 后不会再触发；若仍出现，先确认项目根目录正确、清缓存后重编。

### 控制台出现 `report-online ... ERR_CONNECTION_CLOSED`

这是开发者工具/基础库的联网上报失败（游客 AppID 或网络环境导致），不影响游戏运行。可以忽略。

### 控制台出现大量 `wx.operateWXData` 警告

这是**游客模式**（`touristappid`）下基础库的 API 模拟提示，不是游戏代码调用的接口。把根目录 `project.config.json` 的 `appid` 换成真实小程序 AppID 并登录开发者工具后即可消失。正式小游戏工程请使用小游戏 AppID。

### 当前开发者工具中的 12 个红色报错

全部是 `report-online.sh.wxqcloud.qq.com/sdkReport` 的网络上报失败（`ERR_CONNECTION_CLOSED`），属于工具/基础库的统计上报；本游戏菜单、对局、计时、翻开、长按均正常。游戏本身唯一的外部请求是可选的小程序码云函数，而且只在生成海报时调用；启动/对局阶段不发起业务网络请求。

## 预览壳的限制

- `appid` 为 `touristappid`，属于游客模式：分享、相册、云函数、真机能力受限；
- 海报/小程序码在预览壳中可能只能预览，正式保存/分享/云函数请用 `minigame/` + 小游戏 AppID/云环境验证；
- 预览壳的 WXML/WXSS 仅用于 canvas 宿主，不是产品发布形态。

## 代码侧确认

- 预览壳入口：[app.js](../app.js)、[app.json](../app.json)、[pages/index/index.js](../pages/index/index.js)
- 正式小游戏入口：[minigame/game.js](../minigame/game.js)
- 正式工程配置：[minigame/project.config.json](../minigame/project.config.json)
- 游戏共用逻辑：[minigame/js/](../minigame/js/)
