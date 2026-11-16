'use strict';

/**
 * 本地静态服务器，用于浏览器预览（音频 / canvas 在 http 下更稳定）。
 * 运行：node tools/serve.js [port]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.argv[2] || process.env.PORT || 8787);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.md': 'text/markdown; charset=utf-8',
  '.ico': 'image/x-icon'
};

http.createServer(function (req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (pathname === '/' || pathname === '/preview' || pathname === '/preview/') {
    pathname = '/preview/index.html';
  }

  const filePath = path.join(ROOT, pathname);
  const normalizedRoot = path.resolve(ROOT) + path.sep;
  if (path.resolve(filePath).indexOf(normalizedRoot) !== 0 && path.resolve(filePath) !== path.resolve(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, '127.0.0.1', function () {
  console.log('扫雷·山林 预览：http://127.0.0.1:' + PORT + '/preview/');
  console.log('带调试面板：http://127.0.0.1:' + PORT + '/preview/?dev=1');
});
