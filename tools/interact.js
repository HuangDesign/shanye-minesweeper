'use strict';

/**
 * 预览交互回归：真实点击 / 长按 / 移动取消 / 设置 / 选关 / 海报。
 * 运行：node tools/interact.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9700 + Math.floor(Math.random() * 200);
const ROOT = path.join(__dirname, '..');
const PAGE_URL = pathToFileURL(path.join(ROOT, 'preview', 'index.html')).href;

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function waitForEndpoint() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      if (res.ok) {
        const list = await res.json();
        const page = list.find(function (item) { return item.type === 'page'; });
        if (page) return page;
      }
    } catch (err) { /* retry */ }
    await sleep(100);
  }
  throw new Error('debug endpoint unavailable');
}

function connect(url) {
  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(url);
    const pending = new Map();
    let nextId = 1;
    socket.addEventListener('open', function () {
      resolve({
        send: function (method, params) {
          return new Promise(function (res, rej) {
            const id = nextId++;
            pending.set(id, { resolve: res, reject: rej });
            socket.send(JSON.stringify({ id: id, method: method, params: params || {} }));
          });
        },
        close: function () { try { socket.close(); } catch (err) { /* ignore */ } }
      });
    });
    socket.addEventListener('message', function (event) {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const item = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) item.reject(new Error(JSON.stringify(data.error)));
        else item.resolve(data.result);
      }
    });
    socket.addEventListener('error', reject);
  });
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shanye-interact-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--mute-audio', '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check',
    'about:blank'
  ], { stdio: 'ignore' });

  let failures = 0;
  function check(name, condition, detail) {
    if (condition) {
      console.log('  ✓ ' + name);
    } else {
      failures++;
      console.log('  ✗ ' + name + (detail !== undefined ? ' → ' + JSON.stringify(detail) : ''));
    }
  }

  try {
    const page = await waitForEndpoint();
    const client = await connect(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844
    });
    await client.send('Page.navigate', { url: PAGE_URL + '?dev=1' });
    await sleep(1500);

    async function evaluate(expression) {
      const result = await client.send('Runtime.evaluate', {
        expression: expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (result.exceptionDetails) {
        throw new Error('Eval failed: ' + JSON.stringify(result.exceptionDetails));
      }
      return result.result.value;
    }

    async function mouse(type, x, y, buttons) {
      await client.send('Input.dispatchMouseEvent', {
        type: type,
        x: x,
        y: y,
        button: type === 'mouseMoved' ? 'none' : 'left',
        buttons: buttons === undefined ? 1 : buttons,
        clickCount: 1
      });
    }

    async function tap(x, y) {
      await mouse('mouseMoved', x, y, 0);
      await mouse('mousePressed', x, y, 1);
      await sleep(60);
      await mouse('mouseReleased', x, y, 0);
      await sleep(260);
    }

    async function longPress(x, y, hold) {
      await mouse('mouseMoved', x, y, 0);
      await mouse('mousePressed', x, y, 1);
      await sleep(hold || 430);
      await mouse('mouseReleased', x, y, 0);
      await sleep(240);
    }

    const gameReady = await evaluate('!!(window.wx && wx.__game)');
    check('预览启动成功', gameReady);
    check('初始落地模式选择页', await evaluate('wx.__game.state') === 'menu');

    const menuHits = await evaluate('Object.keys(wx.__game.renderer.hitsBase)');
    check('模式选择按钮注册', menuHits.indexOf('menu.classic') >= 0 && menuHits.indexOf('menu.levels') >= 0);

    await mouse('mouseMoved', 195, 340, 0);
    await mouse('mousePressed', 195, 340, 1);
    await sleep(80);
    check('按钮按压视觉状态', await evaluate('wx.__game.renderer.pressedId') === 'menu.classic');
    await mouse('mouseReleased', 195, 340, 0);
    await sleep(300);
    let state = await evaluate('wx.__game.state');
    check('点击经典模式进入对局', state === 'classic', state);
    check('经典默认中难度', await evaluate('wx.__game.game.difficultyKey') === 'mid');

    const before = await evaluate('wx.__game.game.board.revealedCount');
    const center = await evaluate('(function(){var g=wx.__game,m=g.renderer.metrics;return {x:m.ox+8*(m.cell+m.gap)+m.cell/2,y:m.oy+8*(m.cell+m.gap)+m.cell/2};})()');
    await tap(center.x, center.y);
    const after = await evaluate('wx.__game.game.board.revealedCount');
    check('短按翻开格子', after > before, { before: before, after: after });
    check('经典计时在首点后启动', await evaluate('wx.__game.game.running') === true);

    const markCell = await evaluate('(function(){var g=wx.__game,b=g.game.board,m=g.renderer.metrics;for(var r=0;r<b.rows;r++)for(var c=0;c<b.cols;c++){var cell=b.cells[r][c];if(!cell.revealed&&cell.mark===0&&!cell.isMine)return {c:c,r:r,x:m.ox+c*(m.cell+m.gap)+m.cell/2,y:m.oy+r*(m.cell+m.gap)+m.cell/2};}return null;})()');
    await longPress(markCell.x, markCell.y, 450);
    const markAfter = await evaluate('(function(){var c=wx.__game.game.board.cells[' + markCell.r + '][' + markCell.c + '];return {mark:c.mark,revealed:c.revealed};})()');
    check('长按进入安全标记', markAfter.mark === 1 && markAfter.revealed === false, markAfter);

    const moveCell = await evaluate('(function(){var g=wx.__game,b=g.game.board,m=g.renderer.metrics;for(var r=0;r<b.rows;r++)for(var c=0;c<b.cols;c++){var cell=b.cells[r][c];if(!cell.revealed&&cell.mark===0)return {c:c,r:r,x:m.ox+c*(m.cell+m.gap)+m.cell/2,y:m.oy+r*(m.cell+m.gap)+m.cell/2};}return null;})()');
    await mouse('mouseMoved', moveCell.x, moveCell.y, 0);
    await mouse('mousePressed', moveCell.x, moveCell.y, 1);
    await sleep(80);
    await mouse('mouseMoved', moveCell.x + 44, moveCell.y + 44, 1);
    await sleep(80);
    await mouse('mouseReleased', moveCell.x + 44, moveCell.y + 44, 0);
    await sleep(240);
    const moveAfter = await evaluate('(function(){var c=wx.__game.game.board.cells[' + moveCell.r + '][' + moveCell.c + '];return {mark:c.mark,revealed:c.revealed};})()');
    check('移出格子取消判定', moveAfter.mark === 0 && moveAfter.revealed === false, moveAfter);

    // 缩放控件：放大 → 拖动 → 复位
    const zoomButton = await evaluate('(function(){var h=wx.__game.renderer.hitsBase["zoom.in"];return {x:h.x+h.w/2,y:h.y+h.h/2};})()');
    await tap(zoomButton.x, zoomButton.y);
    check('放大按钮生效', await evaluate('wx.__game.renderer.zoom') > 1);
    check('放大后可拖动', await evaluate('wx.__game.renderer.canPan()') === true);
    check('缩放条不遮挡棋盘', await evaluate('(function(){var r=wx.__game.renderer.zoomRect,f=wx.__game.renderer.metrics.frame;return r.y >= f.y+f.h;})()') === true);

    const panBefore = await evaluate('wx.__game.renderer.panX');
    const revealedBeforePan = await evaluate('wx.__game.game.board.revealedCount');
    const panStart = await evaluate('(function(){var g=wx.__game,m=g.renderer.metrics;return {x:m.ox+8*(m.cell+m.gap)+m.cell/2,y:m.oy+8*(m.cell+m.gap)+m.cell/2};})()');
    await mouse('mouseMoved', panStart.x, panStart.y, 0);
    await mouse('mousePressed', panStart.x, panStart.y, 1);
    await sleep(60);
    await mouse('mouseMoved', panStart.x - 34, panStart.y, 1);
    await sleep(100);
    await mouse('mouseReleased', panStart.x - 34, panStart.y, 0);
    await sleep(180);
    const panAfter = await evaluate('wx.__game.renderer.panX');
    const revealedAfterPan = await evaluate('wx.__game.game.board.revealedCount');
    check('单指拖动平移棋盘', panAfter < panBefore, { before: panBefore, after: panAfter });
    check('拖动不会误触翻开', revealedAfterPan === revealedBeforePan, { before: revealedBeforePan, after: revealedAfterPan });

    const resetPoint = await evaluate('(function(){var h=wx.__game.renderer.hitsBase["zoom.reset"];return {x:h.x+h.w/2,y:h.y+h.h/2};})()');
    await tap(resetPoint.x, resetPoint.y);
    check('适应按钮复位缩放', await evaluate('wx.__game.renderer.zoom') === 1 && await evaluate('wx.__game.renderer.panX') === 0);

    const pinchZoom = await evaluate('(function(){var g=wx.__game,i=g.input;function t(x,y){return {clientX:x,clientY:y};}i.onStart({touches:[t(150,400),t(250,400)]});i.onMove({touches:[t(120,400),t(280,400)]});i.onEnd({touches:[],changedTouches:[t(120,400)]});return g.renderer.zoom;})()');
    check('双指捏合放大', pinchZoom > 1.2, pinchZoom);
    await evaluate('wx.__game.zoomReset()');

    await evaluate('wx.__game.debugJump("classic"); wx.__game.demoPlay();');
    await sleep(420);
    await tap(63, 68);
    await sleep(260);
    check('打开设置面板', await evaluate('wx.__game.overlay') === 'settings');
    await tap(195, 355);
    check('音效开关生效', await evaluate('wx.__game.settings.sound') === false);
    await tap(195, 607);
    check('关闭设置面板', await evaluate('wx.__game.overlay') === null);

    await evaluate('wx.__game.debugJump("levels")');
    await sleep(300);
    check('进入闯关选关', await evaluate('wx.__game.state') === 'levels');
    const levelHits = await evaluate('Object.keys(wx.__game.renderer.hitsBase).filter(function(k){return k.indexOf("level.")===0;})');
    check('关卡卡片注册命中', levelHits.length >= 1, levelHits);

    await tap(75, 195);
    check('点击第 1 关进入对局', await evaluate('wx.__game.state') === 'level');
    check('闯关倒计时立即运行', await evaluate('wx.__game.game.running') === true);
    const elapsed1 = await evaluate('wx.__game.game.elapsedMs');
    await sleep(1200);
    const elapsed2 = await evaluate('wx.__game.game.elapsedMs');
    check('闯关倒计时推进', elapsed2 > elapsed1 + 800, { elapsed1: elapsed1, elapsed2: elapsed2 });

    // 打开设置时倒计时应暂停
    await tap(63, 68);
    const paused1 = await evaluate('wx.__game.game.elapsedMs');
    await sleep(900);
    const paused2 = await evaluate('wx.__game.game.elapsedMs');
    check('设置面板暂停倒计时', Math.abs(paused2 - paused1) < 80, { paused1: paused1, paused2: paused2 });
    await evaluate('wx.__game.closeSettings()');

    // 返回选关 → 首页，生成海报
    await tap(32, 71);
    await tap(32, 71);
    await sleep(300);
    check('返回模式选择', await evaluate('wx.__game.state') === 'menu');
    await tap(285, 742);
    await sleep(2200);
    check('生成并打开海报预览', await evaluate('wx.__game.state') === 'poster');
    check('无云函数时海报降级', await evaluate('wx.__game.posterView.hasQr') === false);
    const posterInfo = await evaluate('(function(){var v=wx.__game.posterView;return {path:!!(v&&v.tempFilePath),prefix:v&&v.tempFilePath?String(v.tempFilePath).slice(0,22):null};})()');
    check('海报临时文件已生成', posterInfo.path === true, posterInfo);
    await evaluate('(function(){var g=wx.__game;g.__tapCalls=[];var orig=g.handleTap;g.handleTap=function(id){g.__tapCalls.push(id);return orig.call(g,id);};return 1;})()');
    await tap(105, 770);
    const tapCalls = await evaluate('wx.__game.__tapCalls');
    check('保存按钮命中', tapCalls && tapCalls.indexOf('poster.save') >= 0, tapCalls);
    let savedToast = null;
    for (let i = 0; i < 12; i++) {
      await sleep(200);
      savedToast = await evaluate('wx.__game.toast');
      if (savedToast) break;
    }
    check('保存相册提示', typeof savedToast === 'string' && savedToast.length > 0, savedToast);
    await tap(32, 71);
    await sleep(300);
    check('从海报返回模式选择', await evaluate('wx.__game.state') === 'menu');

    // 长按次数与音效静音状态持久化（同一会话）
    check('音效关闭后仍可继续游戏', await evaluate('wx.__game.settings.sound') === false);

    // 启动参数：二维码场景提示
    await client.send('Page.navigate', { url: PAGE_URL + '?qrscene=p5' });
    await sleep(1500);
    check('扫码进入落地模式选择页', await evaluate('wx.__game.state') === 'menu');
    const hint = await evaluate('wx.__game.toast');
    check('识别 p5 场景并提示', typeof hint === 'string' && hint.indexOf('第 5 关') >= 0, hint);

    // 朋友圈单页模式
    await client.send('Page.navigate', { url: PAGE_URL + '?scene=1155' });
    await sleep(1500);
    check('scene=1155 进入预览模式', await evaluate('wx.__game.previewMode') === true);
    check('预览模式仍可进入游戏', await evaluate('wx.__game.state') === 'menu');
    await tap(195, 340);
    check('预览模式可开始经典对局', await evaluate('wx.__game.state') === 'classic');

    // 结算面板：关闭后可查看棋盘，点击棋盘可重新打开
    await client.send('Page.navigate', { url: PAGE_URL + '?debug=classicLose' });
    await sleep(1900);
    check('经典失败展示结算面板', await evaluate('wx.__game.overlay') === 'classicEnd');
    check('失败结算展示全部地雷数据', await evaluate('(function(){var b=wx.__game.game.board;var n=0;for(var r=0;r<b.rows;r++)for(var c=0;c<b.cols;c++)if(b.cells[r][c].isMine)n++;return n===b.mineCount;})()') === true);
    await tap(337, 283);
    check('关闭结算面板查看棋盘', await evaluate('wx.__game.overlay') === null);
    await tap(195, 470);
    check('点击棋盘重新打开结算', await evaluate('wx.__game.overlay') === 'classicEnd');
    await tap(337, 283);

    // 二维码海报路径
    await client.send('Page.navigate', { url: PAGE_URL + '?debug=poster&qr=1' });
    await sleep(2600);
    check('云函数二维码海报生成', await evaluate('wx.__game.state') === 'poster' && await evaluate('wx.__game.posterView.hasQr') === true);
    check('分享卡片图已生成', await evaluate('!!wx.__game.shareCardImage') === true);

    // 图片分享面板不可用时的降级（模拟 share=0）
    await client.send('Page.navigate', { url: PAGE_URL + '?debug=poster&qr=1&share=0' });
    await sleep(2600);
    await tap(285, 770);
    let shareToast = null;
    for (let i = 0; i < 10; i++) {
      await sleep(200);
      shareToast = await evaluate('wx.__game.toast');
      if (shareToast) break;
    }
    check('图片分享不可用时保存相册降级', typeof shareToast === 'string' && (shareToast.indexOf('已保存') >= 0 || shareToast.indexOf('分享') >= 0), shareToast);

    client.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch (err) { /* ignore */ }
    setTimeout(function () {
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch (err) { /* ignore */ }
    }, 300);
  }

  console.log(failures === 0 ? '\n交互回归全部通过' : '\n交互回归失败 ' + failures + ' 项');
  if (failures) process.exitCode = 1;
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
