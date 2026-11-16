'use strict';

/**
 * 分享海报：
 * - 750×1334 离屏 Canvas 绘制。
 * - 通过云函数获取小程序码；云函数不可用时绘制无二维码海报（可正常保存/分享）。
 * - 支持 showShareImageMenu、保存相册与降级提示。
 */

const CONFIG = require('./config.js');
const COLORS = CONFIG.COLORS;
const FONTS = CONFIG.FONTS;
const CLOUD = CONFIG.CLOUD;

const QR_SIZE = 300;

function getWx() {
  return typeof wx !== 'undefined' ? wx : null;
}

function makeCanvas(width, height) {
  const w = getWx();
  if (!w || typeof w.createCanvas !== 'function') return null;
  const canvas = w.createCanvas();
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function setFont(ctx, size, weight, family) {
  ctx.font = (weight || 'normal') + ' ' + size + 'px ' + (family || FONTS.sans);
}

function drawSpaced(ctx, text, cx, y, options) {
  const opts = options || {};
  const spacing = opts.spacing || 0;
  setFont(ctx, opts.size || 20, opts.weight || 'normal', opts.family);
  ctx.fillStyle = opts.color || COLORS.cream;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const chars = String(text).split('');
  let total = 0;
  for (let i = 0; i < chars.length; i++) total += ctx.measureText(chars[i]).width + (i < chars.length - 1 ? spacing : 0);
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += ctx.measureText(chars[i]).width + spacing;
  }
}

function paintBackground(ctx, w, h, canvasFactory) {
  const grad = ctx.createLinearGradient(0, 0, w * 0.35, h);
  grad.addColorStop(0, '#0a1310');
  grad.addColorStop(0.38, '#142219');
  grad.addColorStop(0.72, '#1b2b21');
  grad.addColorStop(1, '#0d1712');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 顶部柔光
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.13, 20, w * 0.5, h * 0.13, w * 0.8);
  glow.addColorStop(0, 'rgba(211, 224, 184, 0.13)');
  glow.addColorStop(1, 'rgba(211, 224, 184, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h * 0.5);

  // 远山
  ctx.beginPath();
  ctx.moveTo(-20, h * 0.55);
  ctx.bezierCurveTo(w * 0.16, h * 0.47, w * 0.3, h * 0.58, w * 0.46, h * 0.52);
  ctx.bezierCurveTo(w * 0.62, h * 0.46, w * 0.74, h * 0.56, w + 20, h * 0.5);
  ctx.lineTo(w + 20, h * 0.72);
  ctx.lineTo(-20, h * 0.72);
  ctx.closePath();
  ctx.fillStyle = 'rgba(40, 58, 44, 0.4)';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-20, h * 0.63);
  ctx.bezierCurveTo(w * 0.2, h * 0.55, w * 0.38, h * 0.66, w * 0.58, h * 0.6);
  ctx.bezierCurveTo(w * 0.78, h * 0.54, w * 0.9, h * 0.64, w + 20, h * 0.58);
  ctx.lineTo(w + 20, h * 0.78);
  ctx.lineTo(-20, h * 0.78);
  ctx.closePath();
  ctx.fillStyle = 'rgba(23, 36, 27, 0.66)';
  ctx.fill();

  // 雾带
  for (let i = 0; i < 3; i++) {
    const y = h * (0.47 + i * 0.07);
    const mist = ctx.createLinearGradient(0, y, w, y + 26);
    mist.addColorStop(0, 'rgba(210, 224, 195, 0)');
    mist.addColorStop(0.42, 'rgba(210, 224, 195, 0.05)');
    mist.addColorStop(0.66, 'rgba(210, 224, 195, 0.085)');
    mist.addColorStop(1, 'rgba(210, 224, 195, 0)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, y, w, 42);
  }

  drawPine(ctx, 36, h - 30, 420, 210, 'rgba(7, 14, 10, 0.7)');
  drawPine(ctx, 100, h - 24, 300, 150, 'rgba(7, 14, 10, 0.52)');
  drawPine(ctx, w - 42, h - 20, 470, 230, 'rgba(7, 14, 10, 0.68)');
  drawPine(ctx, w - 130, h - 10, 320, 160, 'rgba(7, 14, 10, 0.5)');
  drawPine(ctx, w * 0.24, h * 0.77, 190, 96, 'rgba(35, 54, 40, 0.55)');
  drawPine(ctx, w * 0.76, h * 0.8, 230, 110, 'rgba(31, 48, 36, 0.55)');

  drawBranch(ctx, 24, 26, 190, 'rgba(196, 205, 166, 0.3)');
  drawBranch(ctx, w - 24, 26, 190, 'rgba(196, 205, 166, 0.24)');

  // 颗粒
  try {
    const noise = canvasFactory ? canvasFactory(150, 150) : makeCanvas(150, 150);
    if (noise) {
      const nctx = noise.getContext('2d');
      const image = nctx.createImageData(150, 150);
      for (let i = 0; i < image.data.length; i += 4) {
        const value = Math.random() > 0.5 ? 255 : 0;
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = Math.floor(Math.random() * 18);
      }
      nctx.putImageData(image, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = ctx.createPattern(noise, 'repeat');
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  } catch (err) { /* 颗粒纹理失败不影响海报 */ }

  // 内框
  ctx.strokeStyle = 'rgba(217, 192, 138, 0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 26, 26, w - 52, h - 52, 6);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(217, 192, 138, 0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, 34, 34, w - 68, h - 68, 4);
  ctx.stroke();

  // 暗角
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawPine(ctx, x, baseY, height, width, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 4, baseY);
  ctx.lineTo(x - 2, baseY - height * 0.3);
  ctx.lineTo(x + 2, baseY - height * 0.3);
  ctx.lineTo(x + 4, baseY);
  ctx.closePath();
  ctx.fill();
  const layers = 6;
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const y = baseY - height * (0.18 + t * 0.78);
    const half = (width / 2) * Math.pow(1 - t, 0.78);
    ctx.beginPath();
    ctx.moveTo(x, y - height * 0.12);
    ctx.quadraticCurveTo(x - half * 0.35, y - height * 0.01, x - half, y + height * 0.02);
    ctx.quadraticCurveTo(x - half * 0.4, y + height * 0.04, x, y + height * 0.015);
    ctx.quadraticCurveTo(x + half * 0.4, y + height * 0.04, x + half, y + height * 0.02);
    ctx.quadraticCurveTo(x + half * 0.35, y - height * 0.01, x, y - height * 0.12);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBranch(ctx, x, y, length, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + length * 0.4, y + 18, x + length, y + 32);
  ctx.stroke();
  for (let i = 1; i <= 4; i++) {
    const t = i / 5;
    const bx = x + length * t;
    const by = y + 6 + 26 * t;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 10 + i * 3, by + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + 6, by + 2);
    ctx.lineTo(bx + 14 + i * 2, by + 12);
    ctx.stroke();
  }
  ctx.restore();
}

function layoutRichText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const chars = String(text).split('');
  const lines = [];
  let line = [];
  let lineWidth = 0;
  let highlight = false;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === '【') highlight = true;
    if (ch === '】') highlight = false;
    const width = ctx.measureText(ch).width;
    if (lineWidth + width > maxWidth && line.length) {
      lines.push({ chars: line, width: lineWidth });
      line = [];
      lineWidth = 0;
    }
    line.push({ ch: ch, highlight: highlight || ch === '【' || ch === '】' });
    lineWidth += width;
  }
  if (line.length) lines.push({ chars: line, width: lineWidth });
  return lines;
}

function drawRichLines(ctx, lines, cx, startY, lineHeight, size, color, highlightColor) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let x = cx - line.width / 2;
    const y = startY + i * lineHeight;
    for (let j = 0; j < line.chars.length; j++) {
      const item = line.chars[j];
      setFont(ctx, size, 'normal', FONTS.serif);
      ctx.fillStyle = item.highlight ? highlightColor : color;
      ctx.fillText(item.ch, x, y);
      x += ctx.measureText(item.ch).width;
    }
  }
}

function drawPosterImage(ctx, image, x, y, size) {
  if (!image) return;
  try {
    ctx.drawImage(image, x, y, size, size);
  } catch (err) { /* ignore */ }
}

function drawQrPlaceholder(ctx, x, y, size) {
  ctx.save();
  ctx.strokeStyle = 'rgba(52, 64, 48, 0.3)';
  ctx.lineWidth = 2;
  if (typeof ctx.setLineDash === 'function') ctx.setLineDash([6, 7]);
  roundRect(ctx, x + 8, y + 8, size - 16, size - 16, 10);
  ctx.stroke();
  if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.strokeStyle = 'rgba(47, 62, 45, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 62, cy + 24);
  ctx.lineTo(cx - 28, cy - 26);
  ctx.lineTo(cx - 6, cy + 4);
  ctx.lineTo(cx + 18, cy - 34);
  ctx.lineTo(cx + 64, cy + 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy + 44);
  ctx.lineTo(cx + 44, cy + 44);
  ctx.stroke();

  setFont(ctx, 20, 'normal', FONTS.sans);
  ctx.fillStyle = 'rgba(44, 56, 42, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('小程序码暂不可用', cx, cy + 82);
  setFont(ctx, 15, 'normal', FONTS.sans);
  ctx.fillStyle = 'rgba(58, 72, 54, 0.6)';
  ctx.fillText('微信搜索「扫雷 · 山林」', cx, cy + 110);
  ctx.restore();
}

class Share {
  constructor(options) {
    this.options = options || {};
    this.createCanvasFn = this.options.createCanvas || null;
    this.qrCache = {};
    this.cloudTried = false;
    this.cloudReady = false;
    this.cardImagePath = null;
    this.cardPromise = null;
  }

  makeCanvas(width, height) {
    let canvas = null;
    if (this.createCanvasFn) {
      try { canvas = this.createCanvasFn(width, height); } catch (err) { canvas = null; }
    }
    if (!canvas) canvas = makeCanvas(width, height);
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
    return canvas;
  }

  getWx() {
    return getWx();
  }

  getEnvVersion() {
    if (CLOUD.envVersion === 'develop' || CLOUD.envVersion === 'trial' || CLOUD.envVersion === 'release') {
      return CLOUD.envVersion;
    }
    try {
      const w = getWx();
      if (w && typeof w.getAccountInfoSync === 'function') {
        const info = w.getAccountInfoSync();
        if (info) {
          if (info.miniProgram && info.miniProgram.envVersion) return info.miniProgram.envVersion;
          if (info.miniGame && info.miniGame.envVersion) return info.miniGame.envVersion;
        }
      }
    } catch (err) { /* ignore */ }
    return 'release';
  }

  ensureCloud() {
    if (this.cloudTried) return this.cloudReady;
    this.cloudTried = true;
    const w = getWx();
    if (!w || !w.cloud || typeof w.cloud.callFunction !== 'function') return false;
    try {
      const options = { traceUser: false };
      if (CLOUD.env) options.env = CLOUD.env;
      w.cloud.init(options);
      this.cloudReady = true;
    } catch (err) {
      this.cloudReady = false;
    }
    return this.cloudReady;
  }

  loadImage(src) {
    return new Promise(function (resolve, reject) {
      const w = getWx();
      if (!w || typeof w.createImage !== 'function' || !src) {
        reject(new Error('image unsupported'));
        return;
      }
      const image = w.createImage();
      image.onload = function () { resolve(image); };
      image.onerror = function (err) { reject(err || new Error('image load failed')); };
      image.src = src;
    });
  }

  canvasToTemp(canvas, width, height) {
    const w = getWx();
    return new Promise(function (resolve) {
      if (!canvas) {
        resolve(null);
        return;
      }
      const options = {
        x: 0,
        y: 0,
        width: width,
        height: height,
        destWidth: width,
        destHeight: height,
        fileType: 'png',
        quality: 1,
        success: function (res) { resolve((res && res.tempFilePath) || null); },
        fail: function () { resolve(null); }
      };

      try {
        // 小游戏 Canvas 实例提供 toTempFilePath；小程序侧才是 wx.canvasToTempFilePath
        if (typeof canvas.toTempFilePath === 'function') {
          canvas.toTempFilePath(options);
          return;
        }
        if (typeof canvas.toTempFilePathSync === 'function') {
          const syncPath = canvas.toTempFilePathSync({
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height,
            destWidth: options.destWidth,
            destHeight: options.destHeight,
            fileType: options.fileType,
            quality: options.quality
          });
          resolve(syncPath || null);
          return;
        }
        if (w && typeof w.canvasToTempFilePath === 'function') {
          options.canvas = canvas;
          w.canvasToTempFilePath(options);
          return;
        }
      } catch (err) { /* ignore */ }
      resolve(null);
    });
  }

  /** 云函数获取小程序码，返回可绘制 Image 或 null。 */
  getQrImage(scene) {
    const self = this;
    const key = String(scene || 'c');
    if (this.qrCache[key] !== undefined) return this.qrCache[key];
    if (!this.ensureCloud()) {
      this.qrCache[key] = Promise.resolve(null);
      return this.qrCache[key];
    }

    const cached = new Promise(function (resolve) {
      const w = getWx();
      let settled = false;
      const finish = function (value) {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const timeout = setTimeout(function () { finish(null); }, 6000);
      let call;
      try {
        call = w.cloud.callFunction({
          name: CLOUD.qrFunction,
          data: { scene: key, envVersion: self.getEnvVersion() }
        });
      } catch (err) {
        clearTimeout(timeout);
        finish(null);
        return;
      }
      Promise.resolve(call).then(function (res) {
        clearTimeout(timeout);
        const data = res && res.result;
        if (!data || !data.ok || !data.base64) {
          finish(null);
          return;
        }
        const base64 = data.base64;
        let src = 'data:image/png;base64,' + base64;
        try {
          if (w.env && w.env.USER_DATA_PATH && w.getFileSystemManager) {
            const fs = w.getFileSystemManager();
            const filePath = w.env.USER_DATA_PATH + '/shanye_qr_' + key + '.png';
            fs.writeFileSync(filePath, base64, 'base64');
            if (typeof fs.accessSync === 'function') {
              fs.accessSync(filePath);
            }
            src = filePath;
          }
        } catch (err) { /* 回退 data URI */ }
        self.loadImage(src).then(function (image) {
          finish(image);
        }).catch(function () {
          finish(null);
        });
      }).catch(function () {
        clearTimeout(timeout);
        finish(null);
      });
    });
    this.qrCache[key] = cached;
    cached.then(function (value) {
      if (!value) delete self.qrCache[key];
    });
    return cached;
  }

  /**
   * 生成 750×1334 海报。
   * @returns {Promise<{source:any, tempFilePath:string|null, hasQr:boolean, canvas:any}>}
   */
  createPoster(options) {
    const opts = options || {};
    const width = 750;
    const height = 1334;
    const canvas = this.makeCanvas(width, height);
    if (!canvas) {
      return Promise.reject(new Error('canvas unavailable'));
    }
    const ctx = canvas.getContext('2d');
    const scene = opts.qrScene || 'c';
    const self = this;

    return this.getQrImage(scene).then(function (qrImage) {
      paintBackground(ctx, width, height, self.createCanvasFn ? self.makeCanvas.bind(self) : null);

      // 顶部品牌
      drawSpaced(ctx, 'MINESWEEPER · IN THE WILDS', width / 2, 86, {
        size: 16,
        spacing: 5,
        color: 'rgba(217, 192, 138, 0.62)'
      });

      // 标题
      drawSpaced(ctx, '扫雷 · 山林', width / 2, 170, {
        size: 62,
        spacing: 4,
        family: FONTS.serif,
        color: COLORS.cream
      });

      // 装饰线
      ctx.strokeStyle = 'rgba(217, 192, 138, 0.42)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 150, 208);
      ctx.lineTo(width / 2 - 16, 208);
      ctx.moveTo(width / 2 + 16, 208);
      ctx.lineTo(width / 2 + 150, 208);
      ctx.stroke();
      ctx.save();
      ctx.translate(width / 2, 208);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(217, 192, 138, 0.55)';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();

      // 状态文案
      const stateText = opts.stateText || '山林里起雾了，来一局扫雷';
      const stateLines = layoutRichText(ctx, stateText, 640, '32px ' + FONTS.serif);
      drawRichLines(ctx, stateLines.slice(0, 3), width / 2, 296, 50, 32,
        'rgba(236, 229, 211, 0.9)', 'rgba(220, 195, 143, 1)');

      // 数据卡
      const stats = opts.stats || [];
      if (stats.length) {
        const cardX = 70;
        const cardY = 488;
        const cardW = width - 140;
        const cardH = 196;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = 'rgba(12, 20, 14, 0.55)';
        roundRect(ctx, cardX, cardY, cardW, cardH, 22);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = 'rgba(226, 214, 184, 0.14)';
        ctx.lineWidth = 1;
        roundRect(ctx, cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1, 22);
        ctx.stroke();

        const count = Math.min(stats.length, 3);
        const columnW = cardW / count;
        for (let i = 0; i < count; i++) {
          if (i > 0) {
            ctx.strokeStyle = 'rgba(226, 214, 184, 0.1)';
            ctx.beginPath();
            ctx.moveTo(cardX + columnW * i, cardY + 48);
            ctx.lineTo(cardX + columnW * i, cardY + cardH - 48);
            ctx.stroke();
          }
          const cx = cardX + columnW * (i + 0.5);
          drawSpaced(ctx, stats[i].label || '', cx, cardY + 62, {
            size: 16,
            spacing: 3,
            color: 'rgba(236, 229, 211, 0.46)'
          });
          setFont(ctx, 42, 'normal', FONTS.serif);
          ctx.fillStyle = i === 1 ? COLORS.gold : COLORS.cream;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(String(stats[i].value || ''), cx, cardY + 138);
        }
      }

      // 二维码卡片
      const qrCardX = (width - 370) / 2;
      const qrCardY = 720;
      const qrCardW = 370;
      const qrCardH = 372;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 12;
      const qrGrad = ctx.createLinearGradient(0, qrCardY, 0, qrCardY + qrCardH);
      qrGrad.addColorStop(0, '#f3ecdc');
      qrGrad.addColorStop(1, '#ded2b8');
      ctx.fillStyle = qrGrad;
      roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 26);
      ctx.fill();
      ctx.restore();

      const qrX = (width - QR_SIZE) / 2;
      const qrY = qrCardY + 34;
      if (qrImage) {
        ctx.fillStyle = '#f7f2e6';
        ctx.fillRect(qrX, qrY, QR_SIZE, QR_SIZE);
        drawPosterImage(ctx, qrImage, qrX, qrY, QR_SIZE);
      } else {
        drawQrPlaceholder(ctx, qrX, qrY, QR_SIZE);
      }

      // 小程序码标识
      drawSpaced(ctx, qrImage ? '微信扫一扫 · 进入山林' : '微信搜索「扫雷 · 山林」', width / 2, 1130, {
        size: 20,
        spacing: 3,
        color: qrImage ? 'rgba(236, 229, 211, 0.66)' : 'rgba(236, 229, 211, 0.82)'
      });

      // 页脚
      setFont(ctx, 28, 'normal', FONTS.serif);
      ctx.fillStyle = COLORS.cream;
      ctx.textAlign = 'center';
      ctx.fillText(qrImage ? '长按识别二维码，来山林里扫雷' : '微信搜索「扫雷 · 山林」，来山林里扫雷', width / 2, 1206);

      setFont(ctx, 15, 'normal', FONTS.sans);
      ctx.fillStyle = 'rgba(236, 229, 211, 0.36)';
      ctx.fillText('无需登录 · 进度与纪录保存在本机', width / 2, 1262);

      // 右上角印章
      ctx.save();
      ctx.strokeStyle = 'rgba(217, 192, 138, 0.4)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, width - 108, 70, 58, 58, 4);
      ctx.stroke();
      setFont(ctx, 30, 'normal', FONTS.serif);
      ctx.fillStyle = 'rgba(217, 192, 138, 0.72)';
      ctx.textAlign = 'center';
      ctx.fillText('林', width - 79, 111);
      ctx.restore();

      const hasQr = !!qrImage;
      return self.canvasToTemp(canvas, width, height).then(function (tempFilePath) {
        const sourcePromise = tempFilePath
          ? self.loadImage(tempFilePath).catch(function () { return canvas; })
          : Promise.resolve(canvas);
        return sourcePromise.then(function (source) {
          return {
            source: source,
            tempFilePath: tempFilePath,
            hasQr: hasQr,
            canvas: canvas
          };
        });
      });
    });
  }

  /** 5:4 分享卡片图，供 onShareAppMessage 使用。 */
  createCardImage() {
    if (this.cardPromise) return this.cardPromise;
    const self = this;
    const width = 500;
    const height = 400;
    const canvas = this.makeCanvas(width, height);
    if (!canvas) {
      this.cardPromise = Promise.resolve(null);
      return this.cardPromise;
    }
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0d1712');
    grad.addColorStop(0.6, '#1d2d22');
    grad.addColorStop(1, '#101b14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.72, height * 0.2, 10, width * 0.72, height * 0.2, 260);
    glow.addColorStop(0, 'rgba(206, 221, 178, 0.16)');
    glow.addColorStop(1, 'rgba(206, 221, 178, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    drawPine(ctx, 66, height, 300, 150, 'rgba(7, 14, 10, 0.66)');
    drawPine(ctx, width - 60, height, 340, 170, 'rgba(7, 14, 10, 0.6)');
    drawPine(ctx, width * 0.5, height + 20, 180, 90, 'rgba(7, 14, 10, 0.35)');

    ctx.strokeStyle = 'rgba(217, 192, 138, 0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, 16, 16, width - 32, height - 32, 5);
    ctx.stroke();

    drawSpaced(ctx, 'MINESWEEPER · IN THE WILDS', width / 2, 84, {
      size: 11,
      spacing: 4,
      color: 'rgba(217, 192, 138, 0.6)'
    });
    drawSpaced(ctx, '扫雷 · 山林', width / 2, 166, {
      size: 46,
      spacing: 3,
      family: FONTS.serif,
      color: COLORS.cream
    });
    ctx.strokeStyle = 'rgba(217, 192, 138, 0.4)';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 84, 194);
    ctx.lineTo(width / 2 + 84, 194);
    ctx.stroke();
    drawSpaced(ctx, '来山林里扫雷', width / 2, 242, {
      size: 20,
      spacing: 5,
      family: FONTS.serif,
      color: 'rgba(236, 229, 211, 0.72)'
    });
    setFont(ctx, 12, 'normal', FONTS.sans);
    ctx.fillStyle = 'rgba(236, 229, 211, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('九关山径 · 经典无限局', width / 2, 288);

    return this.canvasToTemp(canvas, width, height).then(function (path) {
      self.cardImagePath = path;
      return path;
    });
  }

  saveImage(path) {
    const w = getWx();
    return new Promise(function (resolve) {
      if (!w || !path || typeof w.saveImageToPhotosAlbum !== 'function') {
        resolve({ ok: false, reason: 'unsupported' });
        return;
      }
      const save = function () {
        w.saveImageToPhotosAlbum({
          filePath: path,
          success: function () { resolve({ ok: true }); },
          fail: function (err) { resolve({ ok: false, reason: (err && err.errMsg) || 'fail' }); }
        });
      };
      try {
        if (typeof w.getSetting === 'function') {
          w.getSetting({
            success: function (res) {
              const auth = res && res.authSetting ? res.authSetting['scope.writePhotosAlbum'] : undefined;
              if (auth === false) {
                resolve({ ok: false, reason: 'auth' });
              } else if (auth === undefined && typeof w.authorize === 'function') {
                w.authorize({
                  scope: 'scope.writePhotosAlbum',
                  success: save,
                  fail: function () { resolve({ ok: false, reason: 'auth' }); }
                });
              } else {
                save();
              }
            },
            fail: save
          });
        } else {
          save();
        }
      } catch (err) {
        resolve({ ok: false, reason: 'fail' });
      }
    });
  }

  shareImage(path) {
    const self = this;
    const w = getWx();
    if (!path) return Promise.resolve({ ok: false, reason: 'unsupported' });
    const fallback = function () {
      return self.saveImage(path).then(function (res) {
        return { ok: false, fallbackSaved: res.ok, reason: res.reason || 'unsupported' };
      });
    };
    if (w && typeof w.showShareImageMenu === 'function') {
      return new Promise(function (resolve) {
        try {
          w.showShareImageMenu({
            path: path,
            success: function () { resolve({ ok: true, mode: 'menu' }); },
            fail: function () { resolve(fallback()); }
          });
        } catch (err) {
          resolve(fallback());
        }
      });
    }
    return fallback();
  }
}

module.exports = Share;
