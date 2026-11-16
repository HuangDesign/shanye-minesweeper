'use strict';

/**
 * 将小游戏 CommonJS 源码打成一个浏览器可用的预览包。
 * 运行：node tools/build-preview.js
 * 说明：仅用于本地验收，正式发布仍使用微信开发者工具直接加载根目录。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'preview', 'bundle.js');
const GAME_ROOT = path.join(ROOT, 'minigame');

const FILES = [
  'js/config.js',
  'js/levels.js',
  'js/storage.js',
  'js/game-core.js',
  'js/launch.js',
  'js/audio.js',
  'js/share.js',
  'js/renderer.js',
  'js/input.js',
  'js/main.js',
  'game.js'
];

const modules = {};
FILES.forEach(function (file) {
  const absolute = path.join(GAME_ROOT, file);
  modules[file] = fs.readFileSync(absolute, 'utf8');
});

let output = '';
output += '/* 自动生成：node tools/build-preview.js —— 请勿手改 */\n';
output += '(function () {\n';
output += '  var __defs = {};\n';
output += '  var __cache = {};\n';
output += '  function __resolve(fromId, request) {\n';
output += '    var base = fromId.indexOf("/") === -1 ? "" : fromId.substring(0, fromId.lastIndexOf("/"));\n';
output += '    var target = request;\n';
output += '    if (request.indexOf(".") === 0) {\n';
output += '      var parts = (base ? base.split("/") : []).concat(request.split("/"));\n';
output += '      var stack = [];\n';
output += '      for (var i = 0; i < parts.length; i++) {\n';
output += '        var part = parts[i];\n';
output += '        if (!part || part === ".") continue;\n';
output += '        if (part === "..") { stack.pop(); continue; }\n';
output += '        stack.push(part);\n';
output += '      }\n';
output += '      target = stack.join("/");\n';
output += '    }\n';
output += '    if (!/\\.js$/.test(target)) target += ".js";\n';
output += '    return target;\n';
output += '  }\n';
output += '  function __require(id, fromId) {\n';
output += '    var resolved = __resolve(fromId || "", id);\n';
output += '    if (__cache[resolved]) return __cache[resolved].exports;\n';
output += '    var factory = __defs[resolved];\n';
output += '    if (!factory) throw new Error("Cannot find module " + id + " (resolved: " + resolved + ")");\n';
output += '    var module = { exports: {} };\n';
output += '    __cache[resolved] = module;\n';
output += '    factory(module, module.exports, function (request) { return __require(request, resolved); });\n';
output += '    return module.exports;\n';
output += '  }\n';

Object.keys(modules).forEach(function (file) {
  output += '\n// ---- ' + file + ' ----\n';
  output += '__defs[' + JSON.stringify(file) + '] = function (module, exports, require) {\n';
  output += modules[file];
  output += '\n};\n';
});

output += '\n  window.__previewRequire = function (id) { return __require(id, ""); };\n';
output += '  __require("game.js", "");\n';
output += '})();\n';

fs.writeFileSync(OUT, output, 'utf8');
console.log('preview bundle written:', OUT, (Buffer.byteLength(output) / 1024).toFixed(1) + ' KB');
