'use strict';

/**
 * 本地预览截图工具（Chrome DevTools Protocol）。
 * 用法：
 *   node tools/capture.js --url "file:///.../preview/index.html?dev=1" --out /tmp/menu.png
 * 可选：--debug=levels 会自动附加 ?debug=...；--wait 1200 控制等待毫秒。
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9300 + Math.floor(Math.random() * 400);
const ROOT = path.join(__dirname, '..');

function arg(name, fallback) {
  const index = process.argv.indexOf('--' + name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

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
  throw new Error('Chrome debugging endpoint not ready');
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
  const target = arg('url');
  const out = arg('out', '/tmp/shanye-shot.png');
  const debug = arg('debug', '');
  const wait = Number(arg('wait', '1400'));
  const viewportWidth = Number(arg('width', '390'));
  const viewportHeight = Number(arg('height', '844'));
  if (!target) {
    console.error('missing --url');
    process.exit(2);
  }

  let url = target;
  if (debug) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'debug=' + encodeURIComponent(debug);
  }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shanye-chrome-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    const page = await waitForEndpoint();
    const client = await connect(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 2,
      mobile: true,
      screenWidth: viewportWidth,
      screenHeight: viewportHeight
    });
    await client.send('Page.navigate', { url: url });
    await sleep(wait);

    const metrics = await client.send('Runtime.evaluate', {
      expression: 'JSON.stringify({innerWidth:innerWidth,innerHeight:innerHeight,dpr:devicePixelRatio,scrollW:document.body.scrollWidth,canvas:(function(){var el=document.getElementById("game");var r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,cw:el.width,ch:el.height};})()})',
      returnByValue: true
    });
    console.log('metrics', metrics.result && metrics.result.value);

    const shot = await client.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false
    });
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log('saved', out);
    client.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch (err) { /* ignore */ }
    setTimeout(function () {
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch (err) { /* ignore */ }
    }, 300);
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
