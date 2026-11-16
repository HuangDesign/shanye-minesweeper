'use strict';

/**
 * 在预览页执行一段表达式并输出结果，用于调试。
 * 用法：node tools/eval.js --url "file://.../preview/index.html?debug=poster" --expr "wx.__game.state" --wait 2000
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9500 + Math.floor(Math.random() * 200);
const ROOT = path.join(__dirname, '..');

function arg(name, fallback) {
  const index = process.argv.indexOf('--' + name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function endpoint() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/json/list');
      if (res.ok) {
        const list = await res.json();
        const page = list.find(function (p) { return p.type === 'page'; });
        if (page) return page;
      }
    } catch (err) { /* retry */ }
    await sleep(100);
  }
  throw new Error('no endpoint');
}

function connect(url) {
  return new Promise(function (resolve, reject) {
    const socket = new WebSocket(url);
    const pending = new Map();
    let id = 1;
    socket.addEventListener('open', function () {
      resolve({
        send: function (method, params) {
          return new Promise(function (res, rej) {
            const current = id++;
            pending.set(current, { res: res, rej: rej });
            socket.send(JSON.stringify({ id: current, method: method, params: params || {} }));
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
        if (data.error) item.rej(new Error(JSON.stringify(data.error)));
        else item.res(data.result);
      }
    });
    socket.addEventListener('error', reject);
  });
}

async function main() {
  const url = arg('url', pathToFileURL(path.join(ROOT, 'preview', 'index.html')).href);
  const expr = arg('expr', 'wx.__game.state');
  const wait = Number(arg('wait', '1800'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'shanye-eval-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', 'about:blank'
  ], { stdio: 'ignore' });

  try {
    const page = await endpoint();
    const client = await connect(page.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844
    });
    const logs = [];
    client.send('Log.enable').catch(function () {});
    await client.send('Page.navigate', { url: url });
    await sleep(wait);
    const result = await client.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      console.error('EXCEPTION', JSON.stringify(result.exceptionDetails, null, 2));
    } else {
      console.log(typeof result.result.value === 'string' ? result.result.value : JSON.stringify(result.result.value, null, 2));
    }
    client.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch (err) { /* ignore */ }
    setTimeout(function () {
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch (err) { /* ignore */ }
    }, 300);
  }
}

main().catch(function (err) { console.error(err); process.exit(1); });
