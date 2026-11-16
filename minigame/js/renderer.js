'use strict';

/**
 * Canvas 2D 渲染层。
 * 采用三层结构：
 *  - 主 Canvas：仅负责把场景层贴到屏幕，并在其上叠加弹层 / Toast。
 *  - 场景层（sceneCanvas）：菜单、棋盘、HUD 等静态与局部更新内容。
 *  - 背景层（bgCanvas）：山林背景，只在尺寸变化时重建。
 * 棋盘与计时器使用脏区更新，不整屏重绘。
 */

const CONFIG = require('./config.js');
const LEVELS = require('./levels.js');

const COLORS = CONFIG.COLORS;
const FONTS = CONFIG.FONTS;
const LAYOUT = CONFIG.LAYOUT;
const TIMING = CONFIG.TIMING;
const NUMBER_COLORS = CONFIG.NUMBER_COLORS;

const FONT_SERIF = FONTS.serif;
const FONT_SANS = FONTS.sans;
const FONT_MONO = FONTS.mono;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getWindowInfo() {
  const w = typeof wx !== 'undefined' ? wx : null;
  if (w) {
    try {
      if (typeof w.getWindowInfo === 'function') {
        const info = w.getWindowInfo();
        if (info && info.windowWidth) return info;
      }
      if (typeof w.getSystemInfoSync === 'function') {
        const info = w.getSystemInfoSync();
        if (info && info.windowWidth) return info;
      }
    } catch (err) { /* ignore */ }
  }
  return {
    windowWidth: 375,
    windowHeight: 667,
    pixelRatio: 2,
    safeArea: { top: 20, bottom: 667, left: 0, right: 375 }
  };
}

function pathRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function roundRectFill(ctx, x, y, w, h, r, fill) {
  pathRoundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRectStroke(ctx, x, y, w, h, r, color, width) {
  pathRoundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = width || 1;
  ctx.stroke();
}

function setFont(ctx, size, weight, family) {
  ctx.font = (weight || '400') + ' ' + size + 'px ' + (family || FONT_SANS);
}

function text(ctx, value, x, y, options) {
  const opts = options || {};
  setFont(ctx, opts.size || 14, opts.weight || '400', opts.family || FONT_SANS);
  ctx.fillStyle = opts.color || COLORS.cream;
  ctx.textAlign = opts.align || 'center';
  ctx.textBaseline = opts.baseline || 'middle';
  if (opts.alpha !== undefined) {
    ctx.save();
    ctx.globalAlpha = opts.alpha;
    ctx.fillText(value, x, y);
    ctx.restore();
    return;
  }
  ctx.fillText(value, x, y);
}

function spacedWidth(ctx, value, spacing, family, size, weight) {
  setFont(ctx, size, weight, family);
  const chars = String(value).split('');
  let width = 0;
  for (let i = 0; i < chars.length; i++) {
    width += ctx.measureText(chars[i]).width + (i < chars.length - 1 ? spacing : 0);
  }
  return width;
}

function drawSpaced(ctx, value, cx, y, options) {
  const opts = options || {};
  const spacing = opts.spacing || 0;
  const size = opts.size || 12;
  const family = opts.family || FONT_SANS;
  const weight = opts.weight || '400';
  setFont(ctx, size, weight, family);
  ctx.fillStyle = opts.color || COLORS.cream;
  ctx.textAlign = 'left';
  ctx.textBaseline = opts.baseline || 'middle';
  const chars = String(value).split('');
  const total = spacedWidth(ctx, value, spacing, family, size, weight);
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += ctx.measureText(chars[i]).width + spacing;
  }
  return total;
}

function wrapLines(ctx, value, maxWidth, size, family, weight) {
  setFont(ctx, size, weight, family);
  const chars = String(value).split('');
  const lines = [];
  let line = '';
  let width = 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const chWidth = ctx.measureText(ch).width;
    if (width + chWidth > maxWidth && line.length) {
      lines.push(line);
      line = '';
      width = 0;
    }
    line += ch;
    width += chWidth;
  }
  if (line.length) lines.push(line);
  return lines;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function hashCell(col, row) {
  let h = (col * 374761393 + row * 668265263) % 2147483647;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return Math.abs(h);
}

class Renderer {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options || {};
    this.createCanvasFn = this.options.createCanvas || null;
    this.ctx = canvas.getContext('2d');
    this.board = null;
    this.metrics = null;
    this.layout = null;
    this.meta = null;
    this.screen = '';
    this.hitsBase = {};
    this.hitsOverlay = {};
    this.orderBase = [];
    this.orderOverlay = [];
    this.hitTarget = 'base';
    this.pressedId = null;
    this.pressedCell = null;
    this.anims = {};
    this.poster = null;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.zoomRect = null;
    this.resize();
  }

  resize() {
    const info = getWindowInfo();
    this.W = info.windowWidth || 375;
    this.H = info.windowHeight || 667;
    this.dpr = info.pixelRatio || 2;
    this.info = info;
    const safe = info.safeArea || {};
    this.safeTop = Math.max(0, Number(safe.top) || 0);
    const safeBottomPx = Number(safe.bottom);
    this.safeBottom = safeBottomPx > 0 ? Math.max(0, this.H - safeBottomPx) : 0;

    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    if (this.ctx && this.ctx.setTransform) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    this.bgCanvas = this.makeLayer();
    this.sceneCanvas = this.makeLayer();
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.sctx = this.sceneCanvas.getContext('2d');
    this.bgCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.buildBackground();
    if (this.board) {
      this.computeLayout();
    }
  }

  makeLayer() {
    let canvas = null;
    if (this.createCanvasFn) {
      canvas = this.createCanvasFn();
    } else {
      const w = typeof wx !== 'undefined' ? wx : null;
      if (w && typeof w.createCanvas === 'function') canvas = w.createCanvas();
    }
    if (!canvas) {
      throw new Error('offscreen canvas unavailable');
    }
    canvas.width = Math.round(this.W * this.dpr);
    canvas.height = Math.round(this.H * this.dpr);
    return canvas;
  }

  // ---------------------------------------------------------------------------
  // 背景艺术
  // ---------------------------------------------------------------------------

  buildBackground() {
    const ctx = this.bgCtx;
    const w = this.W;
    const h = this.H;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const grad = ctx.createLinearGradient(0, 0, w * 0.25, h);
    grad.addColorStop(0, '#0a120e');
    grad.addColorStop(0.38, '#141f18');
    grad.addColorStop(0.72, '#1e2b22');
    grad.addColorStop(1, '#0e1812');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 远山
    const ridge = function (base, amplitude, color) {
      ctx.beginPath();
      ctx.moveTo(-20, base);
      ctx.bezierCurveTo(w * 0.12, base - amplitude * 0.9, w * 0.25, base + amplitude * 0.4, w * 0.42, base - amplitude * 0.35);
      ctx.bezierCurveTo(w * 0.55, base - amplitude * 1.1, w * 0.68, base + amplitude * 0.35, w * 0.82, base - amplitude * 0.25);
      ctx.bezierCurveTo(w * 0.92, base - amplitude * 0.7, w + 10, base, w + 20, base + amplitude * 0.2);
      ctx.lineTo(w + 20, h);
      ctx.lineTo(-20, h);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    ridge(h * 0.54, 54, 'rgba(43, 62, 47, 0.42)');
    ridge(h * 0.63, 40, 'rgba(28, 43, 33, 0.62)');
    ridge(h * 0.71, 30, 'rgba(18, 30, 23, 0.8)');

    // 雾带
    for (let i = 0; i < 3; i++) {
      const y = h * (0.48 + i * 0.085);
      const mist = ctx.createLinearGradient(0, y, w, y + 30);
      mist.addColorStop(0, 'rgba(206, 220, 190, 0)');
      mist.addColorStop(0.4, 'rgba(206, 220, 190, 0.035)');
      mist.addColorStop(0.62, 'rgba(206, 220, 190, 0.065)');
      mist.addColorStop(1, 'rgba(206, 220, 190, 0)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, y, w, 46);
    }

    // 树木剪影
    this.drawPine(ctx, -12, h + 10, 360, 200, 'rgba(5, 11, 8, 0.72)');
    this.drawPine(ctx, 38, h + 6, 250, 132, 'rgba(6, 13, 9, 0.55)');
    this.drawPine(ctx, w + 18, h + 20, 400, 220, 'rgba(5, 10, 8, 0.7)');
    this.drawPine(ctx, w - 62, h + 8, 260, 140, 'rgba(4, 9, 7, 0.5)');
    this.drawPine(ctx, w * 0.16, h * 0.68, 64, 34, 'rgba(20, 34, 25, 0.7)');
    this.drawPine(ctx, w * 0.3, h * 0.7, 48, 26, 'rgba(19, 32, 24, 0.6)');
    this.drawPine(ctx, w * 0.84, h * 0.68, 76, 38, 'rgba(18, 31, 23, 0.7)');

    // 星点 / 萤火
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const hx = hashCell(i * 3 + 1, i + 2);
      const x = (hx % 1000) / 1000 * w;
      const y = this.safeTop + ((hx >> 10) % 1000) / 1000 * h * 0.32;
      const alpha = 0.05 + ((hx >> 6) % 100) / 100 * 0.12;
      ctx.fillStyle = 'rgba(226, 236, 204, ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 1.4 : 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 颗粒
    this.buildGrain(ctx);

    // 暗角
    const vignette = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.22, w / 2, h * 0.5, h * 0.82);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // 顶部压暗，保证标题与状态栏可读
    const topShade = ctx.createLinearGradient(0, 0, 0, this.safeTop + 90);
    topShade.addColorStop(0, 'rgba(5, 10, 7, 0.55)');
    topShade.addColorStop(1, 'rgba(5, 10, 7, 0)');
    ctx.fillStyle = topShade;
    ctx.fillRect(0, 0, w, this.safeTop + 90);
  }

  buildGrain(ctx) {
    try {
      let noise = null;
      if (this.createCanvasFn) {
        noise = this.createCanvasFn();
      } else {
        const w = typeof wx !== 'undefined' ? wx : null;
        if (w && typeof w.createCanvas === 'function') noise = w.createCanvas();
      }
      if (!noise) return;
      noise.width = 150;
      noise.height = 150;
      const nctx = noise.getContext('2d');
      const image = nctx.createImageData(150, 150);
      for (let i = 0; i < image.data.length; i += 4) {
        const value = Math.random() > 0.5 ? 255 : 0;
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = Math.floor(Math.random() * 14);
      }
      nctx.putImageData(image, 0, 0);
      const pattern = ctx.createPattern(noise, 'repeat');
      if (!pattern) return;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.restore();
    } catch (err) { /* 忽略纹理失败 */ }
  }

  drawPine(ctx, x, baseY, height, width, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 3, baseY);
    ctx.lineTo(x - 1.5, baseY - height * 0.3);
    ctx.lineTo(x + 1.5, baseY - height * 0.3);
    ctx.lineTo(x + 3, baseY);
    ctx.closePath();
    ctx.fill();
    const layers = 6;
    for (let i = 0; i < layers; i++) {
      const t = i / layers;
      const y = baseY - height * (0.16 + t * 0.8);
      const half = (width / 2) * Math.pow(1 - t, 0.8);
      ctx.beginPath();
      ctx.moveTo(x, y - height * 0.13);
      ctx.quadraticCurveTo(x - half * 0.4, y - height * 0.01, x - half, y + height * 0.02);
      ctx.quadraticCurveTo(x - half * 0.45, y + height * 0.04, x, y + height * 0.012);
      ctx.quadraticCurveTo(x + half * 0.45, y + height * 0.04, x + half, y + height * 0.02);
      ctx.quadraticCurveTo(x + half * 0.4, y - height * 0.01, x, y - height * 0.13);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 画布层与命中区域
  // ---------------------------------------------------------------------------

  beginScreen(name) {
    this.screen = name;
    this.hitsBase = {};
    this.orderBase = [];
    this.hitsOverlay = {};
    this.orderOverlay = [];
    this.hitTarget = 'base';
    this.pressedCell = null;
    this.anims = {};
    this.sctx.setTransform(1, 0, 0, 1, 0, 0);
    this.sctx.clearRect(0, 0, this.sceneCanvas.width, this.sceneCanvas.height);
    this.sctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.paintBackground();
  }

  paintBackground() {
    this.sctx.drawImage(this.bgCanvas, 0, 0, this.W, this.H);
  }

  /** 月光只出现在菜单等非对局页面，避免与计时 HUD 重叠。 */
  drawMoon(ctx) {
    const moonX = this.W * 0.79;
    const moonY = this.safeTop + this.H * 0.082;
    const radius = this.W * 0.17;
    const glow = ctx.createRadialGradient(moonX, moonY, 6, moonX, moonY, radius);
    glow.addColorStop(0, 'rgba(216, 229, 196, 0.1)');
    glow.addColorStop(0.4, 'rgba(196, 214, 172, 0.035)');
    glow.addColorStop(1, 'rgba(196, 214, 172, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moonX, moonY, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(226, 233, 205, 0.36)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX - 4, moonY - 5, 11, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(197, 212, 175, 0.16)';
    ctx.fill();
  }

  restoreBgRegion(x, y, w, h) {
    const ctx = this.sctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(this.bgCanvas, 0, 0, this.W, this.H);
    ctx.restore();
  }

  beginOverlayHits() {
    this.hitsOverlay = {};
    this.orderOverlay = [];
    this.hitTarget = 'overlay';
  }

  clearOverlayHits() {
    this.hitsOverlay = {};
    this.orderOverlay = [];
    this.hitTarget = 'base';
  }

  addHit(id, x, y, w, h) {
    if (!id) return;
    const target = this.hitTarget === 'overlay' ? this.hitsOverlay : this.hitsBase;
    const order = this.hitTarget === 'overlay' ? this.orderOverlay : this.orderBase;
    if (!target[id]) order.push(id);
    target[id] = { id: id, x: x, y: y, w: w, h: h };
  }

  getHit(x, y) {
    const check = function (order, map) {
      for (let i = order.length - 1; i >= 0; i--) {
        const hit = map[order[i]];
        if (!hit) continue;
        if (x >= hit.x - 3 && x <= hit.x + hit.w + 3 && y >= hit.y - 3 && y <= hit.y + hit.h + 3) {
          return hit;
        }
      }
      return null;
    };
    if (this.orderOverlay.length) {
      const hit = check(this.orderOverlay, this.hitsOverlay);
      if (hit) return hit;
      return null;
    }
    return check(this.orderBase, this.hitsBase);
  }

  present() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.sceneCanvas, 0, 0);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // ---------------------------------------------------------------------------
  // 通用组件
  // ---------------------------------------------------------------------------

  drawWoodPanel(ctx, x, y, w, h, radius, elevated) {
    ctx.save();
    if (elevated !== false) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
    }
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, 'rgba(54, 46, 34, 0.97)');
    grad.addColorStop(0.5, 'rgba(42, 36, 26, 0.98)');
    grad.addColorStop(1, 'rgba(31, 27, 19, 0.99)');
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius, COLORS.woodEdge, 1.2);
    ctx.save();
    pathRoundRect(ctx, x, y, w, h, radius);
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, y, 0, y + 26);
    sheen.addColorStop(0, 'rgba(255, 240, 205, 0.07)');
    sheen.addColorStop(1, 'rgba(255, 240, 205, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, 26);
    ctx.restore();
  }

  drawButton(ctx, opts) {
    const pressed = this.pressedId === opts.id;
    const x = opts.x;
    const y = opts.y + (pressed ? 1 : 0);
    const w = opts.w;
    const h = opts.h;
    const radius = opts.radius === undefined ? 12 : opts.radius;
    const variant = opts.variant || 'wood';
    const disabled = !!opts.disabled;

    ctx.save();
    if (!disabled) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = variant === 'primary' ? 16 : 10;
      ctx.shadowOffsetY = pressed ? 2 : 5;
    }

    let fill;
    if (disabled) {
      fill = 'rgba(38, 44, 36, 0.7)';
    } else if (variant === 'primary') {
      fill = ctx.createLinearGradient(0, y, 0, y + h);
      fill.addColorStop(0, pressed ? '#52694a' : '#6f8763');
      fill.addColorStop(1, pressed ? '#42563c' : '#536b4a');
    } else if (variant === 'ghost') {
      fill = 'rgba(17, 25, 19, 0.52)';
    } else {
      fill = ctx.createLinearGradient(0, y, 0, y + h);
      fill.addColorStop(0, pressed ? 'rgba(51, 44, 32, 0.98)' : 'rgba(61, 52, 39, 0.98)');
      fill.addColorStop(1, pressed ? 'rgba(36, 31, 23, 0.99)' : 'rgba(44, 38, 28, 0.99)');
    }
    roundRectFill(ctx, x, y, w, h, radius, fill);
    ctx.restore();

    if (disabled) {
      roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius, 'rgba(220, 224, 200, 0.08)', 1);
    } else if (variant === 'primary') {
      roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius, 'rgba(236, 243, 218, 0.22)', 1);
    } else if (variant === 'ghost') {
      roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius, 'rgba(229, 235, 209, 0.16)', 1);
    } else {
      roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius, 'rgba(220, 198, 154, 0.2)', 1);
    }

    const iconSize = opts.iconSize || 16;
    let labelX = x + w / 2;
    if (opts.icon) {
      const labelWidth = opts.label ? spacedWidth(ctx, opts.label, opts.spacing || 1, FONT_SANS, opts.fontSize || 14, opts.weight || '500') : 0;
      const total = iconSize + (opts.label ? 9 + labelWidth : 0);
      const start = x + (w - total) / 2;
      this.drawIcon(ctx, opts.icon, start + iconSize / 2, y + h / 2, iconSize, disabled ? COLORS.creamFaint : (variant === 'primary' ? COLORS.cream : COLORS.creamDim));
      labelX = start + iconSize + 9 + labelWidth / 2;
    }

    if (opts.label) {
      if (opts.spacing) {
        drawSpaced(ctx, opts.label, labelX, y + h / 2 + 0.5, {
          size: opts.fontSize || 14,
          spacing: opts.spacing,
          weight: opts.weight || '500',
          color: disabled ? COLORS.creamFaint : (variant === 'primary' ? '#f1eddc' : COLORS.cream),
          family: FONT_SANS
        });
      } else {
        text(ctx, opts.label, labelX, y + h / 2 + 0.5, {
          size: opts.fontSize || 14,
          weight: opts.weight || '500',
          color: disabled ? COLORS.creamFaint : (variant === 'primary' ? '#f1eddc' : COLORS.cream),
          align: 'center'
        });
      }
    }

    if (!disabled) {
      this.addHit(opts.id, x, y, w, h);
    }
  }

  drawIconButton(ctx, id, x, y, size, icon) {
    const pressed = this.pressedId === id;
    const yy = y + (pressed ? 1 : 0);
    roundRectFill(ctx, x, yy, size, size, size / 2, 'rgba(18, 27, 20, 0.62)');
    roundRectStroke(ctx, x + 0.5, yy + 0.5, size - 1, size - 1, size / 2, 'rgba(230, 238, 212, 0.14)', 1);
    this.drawIcon(ctx, icon, x + size / 2, yy + size / 2, size * 0.46, COLORS.cream);
    this.addHit(id, x, y, size, size);
  }

  drawIcon(ctx, name, cx, cy, size, color) {
    const s = size;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.2, s * 0.1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (name === 'back') {
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.16, cy - s * 0.28);
      ctx.lineTo(cx - s * 0.18, cy);
      ctx.lineTo(cx + s * 0.16, cy + s * 0.28);
      ctx.stroke();
    } else if (name === 'close') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.24, cy - s * 0.24);
      ctx.lineTo(cx + s * 0.24, cy + s * 0.24);
      ctx.moveTo(cx + s * 0.24, cy - s * 0.24);
      ctx.lineTo(cx - s * 0.24, cy + s * 0.24);
      ctx.stroke();
    } else if (name === 'restart') {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.3, -Math.PI * 0.35, Math.PI * 1.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.18, cy - s * 0.4);
      ctx.lineTo(cx + s * 0.38, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.15, cy - s * 0.14);
      ctx.closePath();
      ctx.fill();
    } else if (name === 'settings') {
      ctx.lineWidth = Math.max(1.3, s * 0.09);
      for (let i = 0; i < 3; i++) {
        const yy = cy - s * 0.26 + i * s * 0.26;
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.34, yy);
        ctx.lineTo(cx + s * 0.34, yy);
        ctx.stroke();
        const knobX = cx + (i === 0 ? -s * 0.12 : i === 1 ? s * 0.14 : -s * 0.04);
        ctx.beginPath();
        ctx.arc(knobX, yy, s * 0.075, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18, 27, 20, 0.95)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.fillStyle = color;
      }
    } else if (name === 'share') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.34);
      ctx.lineTo(cx, cy + s * 0.06);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy - s * 0.14);
      ctx.lineTo(cx, cy - s * 0.35);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.34, cy + s * 0.02);
      ctx.lineTo(cx - s * 0.34, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.34, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.34, cy + s * 0.02);
      ctx.stroke();
    } else if (name === 'clock') {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.16);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + s * 0.14, cy + s * 0.08);
      ctx.stroke();
    } else if (name === 'mine') {
      this.drawMineGlyph(ctx, cx, cy, s * 0.5, color);
    } else if (name === 'flag') {
      this.drawFlagGlyph(ctx, cx, cy, s, color);
    } else if (name === 'leaf') {
      this.drawLeafGlyph(ctx, cx, cy, s * 0.9, color);
    } else if (name === 'lock') {
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.12, s * 0.19, Math.PI, Math.PI * 2);
      ctx.stroke();
      roundRectStroke(ctx, cx - s * 0.28, cy - s * 0.12, s * 0.56, s * 0.4, s * 0.08, color, Math.max(1.4, s * 0.09));
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.04, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
    } else if (name === 'grid') {
      const cellSize = s * 0.2;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const gx = cx - s * 0.3 + c * s * 0.23;
          const gy = cy - s * 0.3 + r * s * 0.23;
          roundRectFill(ctx, gx, gy, cellSize, cellSize, s * 0.035, (r + c) % 2 === 0 ? color : 'rgba(236, 229, 211, 0.2)');
        }
      }
    } else if (name === 'mountain') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.35, cy + s * 0.22);
      ctx.lineTo(cx - s * 0.1, cy - s * 0.18);
      ctx.lineTo(cx + s * 0.06, cy + s * 0.04);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.14);
      ctx.lineTo(cx + s * 0.38, cy + s * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy + s * 0.32);
      ctx.lineTo(cx + s * 0.32, cy + s * 0.32);
      ctx.stroke();
    } else if (name === 'sound') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.16, cy - s * 0.1);
      ctx.lineTo(cx + s * 0.02, cy - s * 0.26);
      ctx.lineTo(cx + s * 0.02, cy + s * 0.26);
      ctx.lineTo(cx - s * 0.16, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + s * 0.06, cy, s * 0.18, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + s * 0.06, cy, s * 0.32, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else if (name === 'soundOff') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.16, cy - s * 0.1);
      ctx.lineTo(cx + s * 0.02, cy - s * 0.26);
      ctx.lineTo(cx + s * 0.02, cy + s * 0.26);
      ctx.lineTo(cx - s * 0.16, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.12, cy - s * 0.14);
      ctx.lineTo(cx + s * 0.36, cy + s * 0.14);
      ctx.moveTo(cx + s * 0.36, cy - s * 0.14);
      ctx.lineTo(cx + s * 0.12, cy + s * 0.14);
      ctx.stroke();
    } else if (name === 'vibrate') {
      roundRectStroke(ctx, cx - s * 0.22, cy - s * 0.34, s * 0.44, s * 0.68, s * 0.08, color, Math.max(1.2, s * 0.09));
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.36, cy - s * 0.16);
      ctx.quadraticCurveTo(cx - s * 0.46, cy, cx - s * 0.36, cy + s * 0.16);
      ctx.moveTo(cx + s * 0.36, cy - s * 0.16);
      ctx.quadraticCurveTo(cx + s * 0.46, cy, cx + s * 0.36, cy + s * 0.16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.2, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
    } else if (name === 'chevron') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.12, cy - s * 0.26);
      ctx.lineTo(cx + s * 0.14, cy);
      ctx.lineTo(cx - s * 0.12, cy + s * 0.26);
      ctx.stroke();
    } else if (name === 'check') {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.28, cy + s * 0.02);
      ctx.lineTo(cx - s * 0.06, cy + s * 0.24);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMineGlyph(ctx, cx, cy, radius, color) {
    const r = radius;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.2, r * 0.2);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i + Math.PI / 8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r * 0.62, cy + Math.sin(angle) * r * 0.62);
      ctx.lineTo(cx + Math.cos(angle) * r * 1.02, cy + Math.sin(angle) * r * 1.02);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.22, r * 0.13, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 248, 226, 0.55)';
    ctx.fill();
    ctx.restore();
  }

  drawFlagGlyph(ctx, cx, cy, size, color) {
    const s = size;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.2, s * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.18, cy - s * 0.34);
    ctx.lineTo(cx - s * 0.18, cy + s * 0.34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.16, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.32, cy - s * 0.16);
    ctx.lineTo(cx - s * 0.16, cy + s * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.32, cy + s * 0.36);
    ctx.lineTo(cx + s * 0.04, cy + s * 0.36);
    ctx.stroke();
    ctx.restore();
  }

  drawLeafGlyph(ctx, cx, cy, size, color, filled) {
    const s = size;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.55);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.5, -s * 0.3, s * 0.36, s * 0.3, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.36, s * 0.3, -s * 0.5, -s * 0.3, 0, -s * 0.5);
    ctx.closePath();
    if (filled === false) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.strokeStyle = filled === false ? color : 'rgba(30, 44, 31, 0.42)';
    ctx.lineWidth = Math.max(0.8, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.lineTo(0, s * 0.42);
    ctx.stroke();
    ctx.restore();
  }

  drawQuestionGlyph(ctx, cx, cy, size, color) {
    ctx.save();
    setFont(ctx, size, '600', FONT_SERIF);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', cx, cy + size * 0.04);
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.46, Math.max(1, size * 0.05), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 菜单
  // ---------------------------------------------------------------------------

  renderMenu(data) {
    this.beginScreen('menu');
    const ctx = this.sctx;
    this.drawMoon(ctx);
    const W = this.W;
    const H = this.H;
    const safeTop = this.safeTop;
    const safeBottom = this.safeBottom;

    const compact = H < 660;
    const titleY = safeTop + (compact ? 92 : 116);
    drawSpaced(ctx, 'MINESWEEPER · IN THE WILDS', W / 2, safeTop + 38, {
      size: 9,
      spacing: 3.4,
      color: 'rgba(217, 192, 138, 0.55)'
    });

    drawSpaced(ctx, '扫雷 · 山林', W / 2, titleY, {
      size: 40,
      spacing: 2,
      family: FONT_SERIF,
      color: COLORS.cream,
      weight: '400'
    });

    // 装饰
    ctx.strokeStyle = 'rgba(217, 192, 138, 0.34)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 82, titleY + 26);
    ctx.lineTo(W / 2 - 10, titleY + 26);
    ctx.moveTo(W / 2 + 10, titleY + 26);
    ctx.lineTo(W / 2 + 82, titleY + 26);
    ctx.stroke();
    ctx.save();
    ctx.translate(W / 2, titleY + 26);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(217, 192, 138, 0.48)';
    ctx.fillRect(-2.4, -2.4, 4.8, 4.8);
    ctx.restore();

    drawSpaced(ctx, '雾起时，听一枚雷在松针下呼吸', W / 2, titleY + 52, {
      size: 11,
      spacing: 1.6,
      color: 'rgba(236, 229, 211, 0.46)',
      family: FONT_SERIF
    });

    let cardsTop = Math.max(titleY + 96, H * 0.335);
    if (data.previewMode) {
      const bannerY = titleY + 74;
      roundRectFill(ctx, W / 2 - 132, bannerY - 11, 264, 24, 12, 'rgba(217, 192, 138, 0.1)');
      roundRectStroke(ctx, W / 2 - 132, bannerY - 11, 264, 24, 12, 'rgba(217, 192, 138, 0.2)', 1);
      drawSpaced(ctx, '朋友圈预览 · 完整体验请打开小游戏', W / 2, bannerY + 0.5, {
        size: 9,
        spacing: 1,
        color: 'rgba(228, 211, 170, 0.82)'
      });
      cardsTop = Math.max(cardsTop, bannerY + 34);
    }

    const cardX = 22;
    const cardW = W - 44;
    const cardGap = 14;
    const footerY = H - safeBottom - 92;
    // 小屏时压缩卡片高度，优先保证底部设置/分享按钮不被遮挡
    const cardH = Math.max(88, Math.min(112, Math.floor((footerY - 8 - cardsTop - cardGap) / 2)));

    this.drawModeCard(ctx, {
      id: 'menu.classic',
      x: cardX,
      y: cardsTop,
      w: cardW,
      h: cardH,
      icon: 'grid',
      title: '经典模式',
      subtitle: '无限局 · 当前难度「' + data.difficultyLabel + '」',
      note: data.bestLabel || ''
    });

    this.drawModeCard(ctx, {
      id: 'menu.levels',
      x: cardX,
      y: cardsTop + cardH + cardGap,
      w: cardW,
      h: cardH,
      icon: 'mountain',
      title: '闯关模式',
      subtitle: data.progressLabel,
      note: data.progressNote || ''
    });

    const cardsEnd = cardsTop + cardH * 2 + cardGap;
    if (footerY - cardsEnd > 110) {
      const quoteY = cardsEnd + (footerY - cardsEnd) * 0.42;
      ctx.strokeStyle = 'rgba(236, 229, 211, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 30, quoteY - 20);
      ctx.lineTo(W / 2 + 30, quoteY - 20);
      ctx.stroke();
      drawSpaced(ctx, '林深见雾，落子听风', W / 2, quoteY, {
        size: 10,
        spacing: 2.4,
        color: 'rgba(236, 229, 211, 0.3)',
        family: FONT_SERIF
      });
    }

    const btnW = (W - 44 - 12) / 2;
    this.drawButton(ctx, {
      id: 'menu.settings',
      x: 22,
      y: footerY,
      w: btnW,
      h: 46,
      label: '设置',
      icon: 'settings',
      variant: 'ghost',
      radius: 14,
      fontSize: 13,
      iconSize: 16
    });
    this.drawButton(ctx, {
      id: 'menu.share',
      x: 22 + btnW + 12,
      y: footerY,
      w: btnW,
      h: 46,
      label: '分享海报',
      icon: 'share',
      variant: 'ghost',
      radius: 14,
      fontSize: 13,
      iconSize: 16
    });

    drawSpaced(ctx, '无需登录 · 进度与纪录保存在本机', W / 2, H - safeBottom - 24, {
      size: 8.5,
      spacing: 1.4,
      color: 'rgba(236, 229, 211, 0.28)'
    });
  }

  drawModeCard(ctx, opts) {
    const pressed = this.pressedId === opts.id;
    const y = opts.y + (pressed ? 1 : 0);
    this.drawWoodPanel(ctx, opts.x, y, opts.w, opts.h, 18, true);
    if (pressed) {
      roundRectFill(ctx, opts.x, y, opts.w, opts.h, 18, 'rgba(255, 255, 255, 0.03)');
    }

    const iconR = 24;
    const iconCx = opts.x + 36;
    const iconCy = y + opts.h / 2;
    const iconGrad = ctx.createLinearGradient(iconCx - iconR, iconCy - iconR, iconCx + iconR, iconCy + iconR);
    iconGrad.addColorStop(0, 'rgba(126, 148, 108, 0.32)');
    iconGrad.addColorStop(1, 'rgba(72, 92, 62, 0.22)');
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
    ctx.fillStyle = iconGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(213, 229, 187, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
    this.drawIcon(ctx, opts.icon, iconCx, iconCy, 30, 'rgba(218, 231, 196, 0.9)');

    // 标题
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    setFont(ctx, 19, '500', FONT_SERIF);
    ctx.fillStyle = COLORS.cream;
    ctx.fillText(opts.title, opts.x + 72, y + 42);
    ctx.restore();

    // 副标题
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    setFont(ctx, 11, '400', FONT_SANS);
    ctx.fillStyle = 'rgba(236, 229, 211, 0.52)';
    ctx.fillText(opts.subtitle, opts.x + 72, y + 70);
    if (opts.note && opts.h >= 100) {
      ctx.fillStyle = 'rgba(217, 192, 138, 0.6)';
      setFont(ctx, 9.5, '400', FONT_SANS);
      ctx.fillText(opts.note, opts.x + 72, y + 90);
    }
    ctx.restore();

    this.drawIcon(ctx, 'chevron', opts.x + opts.w - 26, y + opts.h / 2, 14, 'rgba(236, 229, 211, 0.32)');

    this.addHit(opts.id, opts.x, y, opts.w, opts.h);
  }

  // ---------------------------------------------------------------------------
  // 闯关选关
  // ---------------------------------------------------------------------------

  renderLevels(data) {
    this.beginScreen('levels');
    const ctx = this.sctx;
    const W = this.W;
    const H = this.H;
    const safeTop = this.safeTop;
    const safeBottom = this.safeBottom;

    this.drawIconButton(ctx, 'levels.back', 14, safeTop + 6, 36, 'back');

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    setFont(ctx, 24, '400', FONT_SERIF);
    ctx.fillStyle = COLORS.cream;
    ctx.fillText('闯关 · 山径九重', 62, safeTop + 20);
    setFont(ctx, 9, '400', FONT_SANS);
    ctx.fillStyle = 'rgba(236, 229, 211, 0.4)';
    ctx.fillText('LEVEL JOURNEY', 63, safeTop + 42);
    ctx.restore();

    text(ctx, data.progressLabel, W - 22, safeTop + 48, {
      size: 10,
      color: 'rgba(217, 192, 138, 0.7)',
      align: 'right'
    });

    ctx.strokeStyle = 'rgba(229, 236, 209, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, safeTop + 62);
    ctx.lineTo(W - 22, safeTop + 62);
    ctx.stroke();

    const margin = 20;
    const gap = 10;
    const cols = 3;
    const cardW = (W - margin * 2 - gap * 2) / cols;
    const cardH = Math.min(128, Math.max(104, (H - safeTop - 270) / 3 - gap));
    const gridTop = safeTop + 84;

    for (let i = 0; i < LEVELS.LEVELS.length; i++) {
      const level = LEVELS.LEVELS[i];
      const col = i % cols;
      const rowIndex = Math.floor(i / cols);
      const x = margin + col * (cardW + gap);
      const y = gridTop + rowIndex * (cardH + gap);
      const unlocked = data.progress.unlocked >= level.id;
      const best = data.progress.bestTimes[level.id];
      this.drawLevelCard(ctx, {
        level: level,
        x: x,
        y: y,
        w: cardW,
        h: cardH,
        unlocked: unlocked,
        best: best,
        completed: !!best,
        pressed: this.pressedId === 'level.' + level.id
      });
      if (unlocked) {
        this.addHit('level.' + level.id, x, y, cardW, cardH);
      } else {
        this.addHit('levels.locked', x, y, cardW, cardH);
      }
    }

    const gridBottom = gridTop + Math.ceil(LEVELS.LEVELS.length / cols) * (cardH + gap) - gap;

    // 山径进度点：尽量贴近下半屏，避免高屏留白
    const preferred = H - safeBottom - 210;
    const pathY = Math.min(Math.max(gridBottom + 52, preferred), H - safeBottom - 130);
    if (pathY > gridBottom + 22) {
      const startX = 44;
      const endX = W - 44;
      const step = (endX - startX) / (LEVELS.LEVELS.length - 1);
      ctx.strokeStyle = 'rgba(217, 192, 138, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, pathY);
      ctx.lineTo(endX, pathY);
      ctx.stroke();

      const unlockedCount = Math.min(data.progress.unlocked, LEVELS.LEVELS.length);
      for (let i = 0; i < LEVELS.LEVELS.length; i++) {
        const cx = startX + step * i;
        const active = i < unlockedCount;
        ctx.beginPath();
        ctx.arc(cx, pathY, active ? 4.2 : 3, 0, Math.PI * 2);
        ctx.fillStyle = active ? 'rgba(217, 192, 138, 0.85)' : 'rgba(236, 229, 211, 0.16)';
        ctx.fill();
        if (active) {
          ctx.beginPath();
          ctx.arc(cx, pathY, 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(217, 192, 138, 0.18)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      drawSpaced(ctx, data.pathLabel || '', W / 2, pathY + 30, {
        size: 9,
        spacing: 1.5,
        color: 'rgba(236, 229, 211, 0.34)'
      });

      if (H - safeBottom - 150 > pathY + 54) {
        ctx.strokeStyle = 'rgba(236, 229, 211, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 26, pathY + 72);
        ctx.lineTo(W / 2 + 26, pathY + 72);
        ctx.stroke();
        drawSpaced(ctx, '灯一盏盏亮起，雾一层层退去', W / 2, pathY + 94, {
          size: 9.5,
          spacing: 2,
          color: 'rgba(236, 229, 211, 0.28)',
          family: FONT_SERIF
        });
      }
    }

    drawSpaced(ctx, '通关一关，点亮下一盏灯 · 进度保存在本机', W / 2, H - safeBottom - 22, {
      size: 9,
      spacing: 1,
      color: 'rgba(236, 229, 211, 0.3)'
    });
  }

  drawLevelCard(ctx, opts) {
    const level = opts.level;
    const unlocked = opts.unlocked;
    const pressed = opts.pressed;
    const y = opts.y + (pressed ? 1 : 0);
    const x = opts.x;

    if (unlocked) {
      this.drawWoodPanel(ctx, x, y, opts.w, opts.h, 14, true);
      if (pressed) {
        roundRectFill(ctx, x, y, opts.w, opts.h, 14, 'rgba(255, 255, 255, 0.035)');
      }
      if (opts.completed) {
        ctx.strokeStyle = 'rgba(217, 192, 138, 0.3)';
        ctx.lineWidth = 1;
        roundRectStroke(ctx, x + 0.5, y + 0.5, opts.w - 1, opts.h - 1, 14, 'rgba(217, 192, 138, 0.24)', 1);
      }

      setFont(ctx, 26, '400', FONT_SERIF);
      ctx.fillStyle = opts.completed ? COLORS.gold : COLORS.cream;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(level.id), x + 14, y + 30);

      setFont(ctx, 8.5, '400', FONT_SANS);
      ctx.fillStyle = 'rgba(236, 229, 211, 0.38)';
      ctx.fillText('LEVEL', x + 14, y + 50);

      const compact = opts.h < 112;
      setFont(ctx, 9, '400', FONT_SANS);
      ctx.fillStyle = 'rgba(236, 229, 211, 0.56)';
      ctx.fillText(level.cols + ' × ' + level.rows + ' · ' + level.mines + ' 雷', x + 14, y + 66);
      if (!compact) {
        ctx.fillStyle = 'rgba(236, 229, 211, 0.4)';
        ctx.fillText(level.time + ' 秒', x + 14, y + 80);
      }

      if (opts.best) {
        ctx.fillStyle = 'rgba(217, 192, 138, 0.72)';
        setFont(ctx, 8.5, '400', FONT_SANS);
        ctx.fillText('最佳 ' + LEVELS.formatSeconds(opts.best), x + 14, y + opts.h - 14);
      } else {
        ctx.fillStyle = 'rgba(236, 229, 211, 0.3)';
        setFont(ctx, 8.5, '400', FONT_SANS);
        ctx.fillText(compact ? level.time + ' 秒' : '待挑战', x + 14, y + opts.h - 14);
      }

      if (opts.completed) {
        ctx.beginPath();
        ctx.arc(x + opts.w - 18, y + 18, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217, 192, 138, 0.14)';
        ctx.fill();
        this.drawIcon(ctx, 'check', x + opts.w - 18, y + 18, 11, COLORS.gold);
      }
    } else {
      roundRectFill(ctx, x, y, opts.w, opts.h, 14, 'rgba(19, 26, 20, 0.6)');
      roundRectStroke(ctx, x + 0.5, y + 0.5, opts.w - 1, opts.h - 1, 14, 'rgba(229, 236, 209, 0.07)', 1);
      this.drawIcon(ctx, 'lock', x + opts.w / 2, y + opts.h / 2 - 14, 22, 'rgba(236, 229, 211, 0.24)');
      setFont(ctx, 9, '400', FONT_SANS);
      ctx.fillStyle = 'rgba(236, 229, 211, 0.28)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('第 ' + level.id + ' 关', x + opts.w / 2, y + opts.h / 2 + 12);
      ctx.fillStyle = 'rgba(236, 229, 211, 0.16)';
      ctx.fillText('未解锁', x + opts.w / 2, y + opts.h / 2 + 28);
    }
  }

  // ---------------------------------------------------------------------------
  // 对局
  // ---------------------------------------------------------------------------

  setBoard(board, kind) {
    this.board = board;
    this.kind = kind;
    this.anims = {};
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.computeLayout();
  }

  computeLayout() {
    const board = this.board;
    if (!board) return;
    const W = this.W;
    const H = this.H;
    const safeTop = this.safeTop;
    const safeBottom = this.safeBottom;

    const topY = safeTop + 6;
    const btnSize = 30;
    const statsY = topY + btnSize + 14;
    const statsH = 54;
    const boardTop = statsY + statsH + 12;
    const hintY = H - safeBottom - 14;
    const zoomBarW = 200;
    const zoomBarH = 32;
    const zoomBar = {
      x: (W - zoomBarW) / 2,
      y: hintY - 46,
      w: zoomBarW,
      h: zoomBarH
    };
    const availBottom = zoomBar.y - 8;
    const availH = Math.max(90, availBottom - boardTop);
    const availW = W - (LAYOUT.sideMargin + LAYOUT.boardPadding) * 2;

    const fit = function (gap) {
      const byWidth = (availW - gap * (board.cols - 1)) / board.cols;
      const byHeight = (availH - gap * (board.rows - 1) - LAYOUT.boardPadding * 2) / board.rows;
      return Math.min(byWidth, byHeight);
    };

    let gap = 4;
    let cell = fit(gap);
    if (cell < 24) gap = 2;
    if (cell < 19) gap = 1;
    cell = fit(gap);
    if (cell > LAYOUT.maxCell) cell = LAYOUT.maxCell;
    cell = Math.max(10, cell);
    gap = Math.min(gap, Math.max(1, cell * 0.16));

    const contentW = board.cols * cell + (board.cols - 1) * gap;
    const contentH = board.rows * cell + (board.rows - 1) * gap;
    const frameW = contentW + LAYOUT.boardPadding * 2;
    const frameH = contentH + LAYOUT.boardPadding * 2;
    const frameX = (W - frameW) / 2;
    const frameY = boardTop + Math.max(0, (availH - frameH) / 2);

    this.baseMetrics = {
      cell: cell,
      gap: gap,
      contentW: contentW,
      contentH: contentH,
      frame: { x: frameX, y: frameY, w: frameW, h: frameH },
      cols: board.cols,
      rows: board.rows
    };
    this.viewport = {
      x: frameX + LAYOUT.boardPadding,
      y: frameY + LAYOUT.boardPadding,
      w: contentW,
      h: contentH
    };
    this.maxZoom = Math.max(1, Math.min(3.2, 56 / Math.max(8, cell)));
    this.zoom = clamp(this.zoom || 1, 1, this.maxZoom);
    this.panX = this.panX || 0;
    this.panY = this.panY || 0;
    this.updateZoomMetrics();

    this.layout = {
      topY: topY,
      btnSize: btnSize,
      stats: { x: 14, y: statsY, w: W - 28, h: statsH },
      boardTop: boardTop,
      hintY: hintY,
      availBottom: availBottom,
      zoomBar: zoomBar
    };
  }

  updateZoomMetrics() {
    const b = this.baseMetrics;
    if (!b) return;
    const v = this.viewport;
    const z = clamp(this.zoom, 1, this.maxZoom);
    const cell = b.cell * z;
    const gap = b.gap * z;
    const contentW = b.contentW * z;
    const contentH = b.contentH * z;
    const maxPanX = Math.max(0, contentW - v.w);
    const maxPanY = Math.max(0, contentH - v.h);
    this.zoom = z;
    this.panX = clamp(this.panX, -maxPanX, 0);
    this.panY = clamp(this.panY, -maxPanY, 0);
    this.metrics = {
      cell: cell,
      gap: gap,
      ox: v.x + this.panX,
      oy: v.y + this.panY,
      contentW: contentW,
      contentH: contentH,
      frame: b.frame,
      viewport: v,
      maxPanX: maxPanX,
      maxPanY: maxPanY,
      baseCell: b.cell,
      baseGap: b.gap
    };
  }

  screenToBoardPoint(x, y) {
    const m = this.metrics;
    return {
      x: (x - m.ox) / this.zoom,
      y: (y - m.oy) / this.zoom
    };
  }

  setZoom(newZoom, focalX, focalY) {
    if (!this.baseMetrics) return false;
    const v = this.viewport;
    const oldZoom = this.zoom;
    const fx = focalX === undefined ? v.x + v.w / 2 : focalX;
    const fy = focalY === undefined ? v.y + v.h / 2 : focalY;
    const bx = clamp((fx - this.metrics.ox) / oldZoom, 0, this.baseMetrics.contentW);
    const by = clamp((fy - this.metrics.oy) / oldZoom, 0, this.baseMetrics.contentH);
    const z = clamp(newZoom, 1, this.maxZoom);
    if (Math.abs(z - oldZoom) < 0.0001) return false;
    const maxPanX = Math.max(0, this.baseMetrics.contentW * z - v.w);
    const maxPanY = Math.max(0, this.baseMetrics.contentH * z - v.h);
    this.zoom = z;
    this.panX = clamp(fx - v.x - bx * z, -maxPanX, 0);
    this.panY = clamp(fy - v.y - by * z, -maxPanY, 0);
    this.updateZoomMetrics();
    return true;
  }

  zoomBy(factor, focalX, focalY) {
    return this.setZoom(this.zoom * factor, focalX, focalY);
  }

  zoomToBoardPoint(newZoom, bx, by, screenX, screenY) {
    const v = this.viewport;
    const z = clamp(newZoom, 1, this.maxZoom);
    const maxPanX = Math.max(0, this.baseMetrics.contentW * z - v.w);
    const maxPanY = Math.max(0, this.baseMetrics.contentH * z - v.h);
    this.zoom = z;
    this.panX = clamp(screenX - v.x - bx * z, -maxPanX, 0);
    this.panY = clamp(screenY - v.y - by * z, -maxPanY, 0);
    this.updateZoomMetrics();
    return true;
  }

  panBy(dx, dy) {
    if (!this.metrics) return false;
    const beforeX = this.panX;
    const beforeY = this.panY;
    this.panX = clamp(this.panX + dx, -this.metrics.maxPanX, 0);
    this.panY = clamp(this.panY + dy, -this.metrics.maxPanY, 0);
    if (Math.abs(this.panX - beforeX) < 0.01 && Math.abs(this.panY - beforeY) < 0.01) return false;
    this.updateZoomMetrics();
    return true;
  }

  canPan() {
    if (!this.metrics) return false;
    return this.zoom > 1.001 && (this.metrics.maxPanX > 0.5 || this.metrics.maxPanY > 0.5);
  }

  resetZoom() {
    if (!this.baseMetrics) return false;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomMetrics();
    return true;
  }

  cellRect(col, row) {
    const m = this.metrics;
    return {
      x: m.ox + col * (m.cell + m.gap),
      y: m.oy + row * (m.cell + m.gap),
      w: m.cell,
      h: m.cell
    };
  }

  getCellAt(x, y) {
    if (!this.board || !this.metrics) return null;
    const m = this.metrics;
    const v = m.viewport;
    if (x < v.x - 1 || x > v.x + v.w + 1) return null;
    if (y < v.y - 1 || y > v.y + v.h + 1) return null;
    let col = Math.floor((x - m.ox) / (m.cell + m.gap));
    let row = Math.floor((y - m.oy) / (m.cell + m.gap));
    col = clamp(col, 0, this.board.cols - 1);
    row = clamp(row, 0, this.board.rows - 1);
    const rect = this.cellRect(col, row);
    if (x < rect.x - 2 || x > rect.x + rect.w + 2) return null;
    if (y < rect.y - 2 || y > rect.y + rect.h + 2) return null;
    return { col: col, row: row, rect: rect };
  }

  renderGameFull(meta) {
    this.beginScreen('game');
    this.meta = meta;
    if (this.board) {
      this.computeLayout();
    } else {
      return;
    }
    this.drawTopBar(meta);
    this.drawStats(meta);
    this.drawBoard(true);
    this.drawZoomControl();
    this.drawBoardHint();

    // 顶部按钮命中区域
    const l = this.layout;
    const gap = 4;
    this.addHit('game.back', 14, l.topY, l.btnSize, l.btnSize);
    this.addHit('game.settings', 14 + l.btnSize + gap, l.topY, l.btnSize, l.btnSize);
    this.addHit('game.restart', 14 + (l.btnSize + gap) * 2, l.topY, l.btnSize, l.btnSize);
  }

  drawTopBar(meta) {
    const ctx = this.sctx;
    const W = this.W;
    const l = this.layout;
    const b = l.btnSize;

    // 左上角操作组：避开微信右上角胶囊
    const gap = 4;
    this.drawIconButton(ctx, 'game.back', 14, l.topY, b, 'back');
    this.drawIconButton(ctx, 'game.settings', 14 + b + gap, l.topY, b, 'settings');
    this.drawIconButton(ctx, 'game.restart', 14 + (b + gap) * 2, l.topY, b, 'restart');

    const centerY = l.topY + b / 2;
    drawSpaced(ctx, meta.headerLabel, W / 2, centerY - 6, {
      size: 14,
      spacing: 1.4,
      color: COLORS.cream,
      family: FONT_SERIF
    });
    drawSpaced(ctx, meta.headerSub, W / 2, centerY + 12, {
      size: 7.5,
      spacing: 2,
      color: 'rgba(236, 229, 211, 0.36)'
    });
  }

  drawBoard(withShadow) {
    const ctx = this.sctx;
    const m = this.metrics;
    const f = m.frame;

    ctx.save();
    if (withShadow !== false) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
    }
    const frameGrad = ctx.createLinearGradient(0, f.y, 0, f.y + f.h);
    frameGrad.addColorStop(0, '#2d271c');
    frameGrad.addColorStop(1, '#1b1710');
    pathRoundRect(ctx, f.x, f.y, f.w, f.h, 12);
    ctx.fillStyle = frameGrad;
    ctx.fill();
    ctx.restore();

    roundRectStroke(ctx, f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1, 12, 'rgba(220, 198, 154, 0.2)', 1.2);
    roundRectStroke(ctx, f.x + 3, f.y + 3, f.w - 6, f.h - 6, 9, 'rgba(0, 0, 0, 0.3)', 1);

    // 木框角标
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 192, 138, 0.2)';
    ctx.lineWidth = 1;
    const arm = 10;
    const corners = [
      [f.x + 7, f.y + 7, 1, 1],
      [f.x + f.w - 7, f.y + 7, -1, 1],
      [f.x + 7, f.y + f.h - 7, 1, -1],
      [f.x + f.w - 7, f.y + f.h - 7, -1, -1]
    ];
    for (let i = 0; i < corners.length; i++) {
      const c = corners[i];
      ctx.beginPath();
      ctx.moveTo(c[0], c[1] + arm * c[3]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(c[0] + arm * c[2], c[1]);
      ctx.stroke();
    }
    ctx.restore();

    const v = m.viewport;
    const step = m.cell + m.gap;
    const startCol = Math.max(0, Math.floor((v.x - m.ox) / step));
    const endCol = Math.min(this.board.cols - 1, Math.ceil((v.x + v.w - m.ox) / step));
    const startRow = Math.max(0, Math.floor((v.y - m.oy) / step));
    const endRow = Math.min(this.board.rows - 1, Math.ceil((v.y + v.h - m.oy) / step));

    ctx.save();
    ctx.beginPath();
    ctx.rect(v.x, v.y, v.w, v.h);
    ctx.clip();
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        this.drawCell(col, row, null);
      }
    }
    ctx.restore();
  }

  redrawBoardView() {
    if (!this.board) return;
    this.drawBoard(false);
    this.drawZoomControl();
  }

  drawZoomControl() {
    const m = this.metrics;
    if (!m) return;
    const ctx = this.sctx;
    const b = this.layout.zoomBar;
    if (!b) return;
    const w = b.w;
    const h = b.h;
    const x = b.x;
    const y = b.y;
    const radius = h / 2;
    this.zoomRect = { x: x, y: y, w: w, h: h };

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    roundRectFill(ctx, x, y, w, h, radius, 'rgba(10, 16, 12, 0.8)');
    ctx.restore();
    roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius, 'rgba(229, 236, 209, 0.16)', 1);

    const atMin = this.zoom <= 1.001;
    const atMax = this.zoom >= this.maxZoom - 0.001;
    const plusPressed = this.pressedId === 'zoom.in';
    const minusPressed = this.pressedId === 'zoom.out';
    const resetPressed = this.pressedId === 'zoom.reset';

    if (minusPressed) roundRectFill(ctx, x + 4, y + 4, 34, h - 8, 12, 'rgba(255, 240, 205, 0.08)');
    if (resetPressed) roundRectFill(ctx, x + 42, y + 4, 48, h - 8, 12, 'rgba(255, 240, 205, 0.07)');
    if (plusPressed) roundRectFill(ctx, x + 94, y + 4, 32, h - 8, 12, 'rgba(255, 240, 205, 0.08)');
    if (this.pressedId === 'zoom.fit') roundRectFill(ctx, x + 130, y + 4, 64, h - 8, 12, 'rgba(255, 240, 205, 0.07)');

    // 减号
    ctx.save();
    ctx.strokeStyle = atMin ? 'rgba(236, 229, 211, 0.25)' : 'rgba(236, 229, 211, 0.86)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 15, y + h / 2);
    ctx.lineTo(x + 27, y + h / 2);
    ctx.stroke();
    ctx.restore();

    // 加号
    ctx.save();
    ctx.strokeStyle = atMax ? 'rgba(236, 229, 211, 0.25)' : 'rgba(236, 229, 211, 0.86)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    const px = x + 110;
    const py = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(px - 6, py);
    ctx.lineTo(px + 6, py);
    ctx.moveTo(px, py - 6);
    ctx.lineTo(px, py + 6);
    ctx.stroke();
    ctx.restore();

    // 百分比
    text(ctx, Math.round(this.zoom * 100) + '%', x + 66, y + h / 2 + 0.5, {
      size: 9.5,
      weight: '600',
      family: FONT_MONO,
      color: atMin ? 'rgba(236, 229, 211, 0.5)' : COLORS.cream
    });

    // 适应
    text(ctx, '适应', x + 162, y + h / 2 + 0.5, {
      size: 8,
      family: FONT_SANS,
      color: 'rgba(236, 229, 211, 0.58)'
    });

    ctx.strokeStyle = 'rgba(229, 236, 209, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 38, y + 7);
    ctx.lineTo(x + 38, y + h - 7);
    ctx.moveTo(x + 92, y + 7);
    ctx.lineTo(x + 92, y + h - 7);
    ctx.moveTo(x + 128, y + 7);
    ctx.lineTo(x + 128, y + h - 7);
    ctx.stroke();

    this.addHit('zoom.out', x + 2, y + 2, 36, h - 4);
    this.addHit('zoom.reset', x + 40, y + 2, 50, h - 4);
    this.addHit('zoom.in', x + 92, y + 2, 34, h - 4);
    this.addHit('zoom.fit', x + 128, y + 2, 68, h - 4);
  }

  drawBoardHint() {
    const ctx = this.sctx;
    const m = this.metrics;
    if (!m) return;
    if (m.frame.y + m.frame.h + 14 > this.layout.hintY) return;
    drawSpaced(ctx, '短按翻开 · 长按标记 · 双指缩放 / 拖动', this.W / 2, this.layout.hintY - 4, {
      size: 8.0,
      spacing: 1.4,
      color: 'rgba(236, 229, 211, 0.28)'
    });
  }

  drawCell(col, row, options) {
    if (!this.board) return;
    const cell = this.board.cells[row] && this.board.cells[row][col];
    if (!cell) return;
    const ctx = this.sctx;
    const m = this.metrics;
    const rect = this.cellRect(col, row);
    const s = m.cell;
    const radius = Math.min(7, Math.max(2, s * 0.18));
    const opts = options || {};
    const progress = opts.progress;
    const view = m.viewport;
    if (rect.x + rect.w < view.x || rect.x > view.x + view.w) return;
    if (rect.y + rect.h < view.y || rect.y > view.y + view.h) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(view.x, view.y, view.w, view.h);
    ctx.clip();
    if (progress !== undefined && progress < 1) {
      const p = easeOutCubic(clamp(progress, 0, 1));
      const scale = 0.9 + 0.1 * p;
      const cx = rect.x + s / 2;
      const cy = rect.y + s / 2;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha = 0.35 + 0.65 * p;
    }

    const isLose = this.board.gameOver === 'lose';
    const isWin = this.board.gameOver === 'win';
    const wrongMark = isLose && !cell.isMine && cell.mark === 3;
    const showMine = (isLose || isWin) && cell.isMine;
    const exploded = this.board.exploded && this.board.exploded.col === col && this.board.exploded.row === row;

    if (cell.revealed && !cell.isMine) {
      this.drawOpenTile(ctx, rect, s, radius, cell.adjacentMines);
    } else if (showMine) {
      if (isWin) {
        this.drawMineMarkTile(ctx, rect, s, radius, false);
        this.drawFlagGlyph(ctx, rect.x + s / 2, rect.y + s / 2 + 1, s * 0.8, 'rgba(45, 36, 20, 0.95)');
      } else {
        this.drawExposedMineTile(ctx, rect, s, radius, exploded, cell.mark === 3 || exploded);
      }
    } else if (wrongMark) {
      this.drawMineMarkTile(ctx, rect, s, radius, false);
      this.drawMineGlyph(ctx, rect.x + s / 2, rect.y + s / 2, s * 0.3, 'rgba(36, 31, 22, 0.9)');
      ctx.save();
      ctx.strokeStyle = 'rgba(150, 66, 48, 0.95)';
      ctx.lineWidth = Math.max(1.2, s * 0.07);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rect.x + s * 0.24, rect.y + s * 0.24);
      ctx.lineTo(rect.x + s * 0.76, rect.y + s * 0.76);
      ctx.moveTo(rect.x + s * 0.76, rect.y + s * 0.24);
      ctx.lineTo(rect.x + s * 0.24, rect.y + s * 0.76);
      ctx.stroke();
      ctx.restore();
    } else if (cell.mark === 3) {
      this.drawMineMarkTile(ctx, rect, s, radius, false);
      this.drawMineGlyph(ctx, rect.x + s / 2, rect.y + s / 2, s * 0.3, 'rgba(36, 31, 22, 0.94)');
    } else {
      this.drawHiddenTile(ctx, rect, s, radius, col, row);
      if (cell.mark === 1) {
        this.drawLeafGlyph(ctx, rect.x + s / 2, rect.y + s / 2, s * 0.62, 'rgba(211, 226, 182, 0.82)', true);
      } else if (cell.mark === 2) {
        this.drawQuestionGlyph(ctx, rect.x + s / 2, rect.y + s / 2, s * 0.55, COLORS.question);
      }
    }

    if (this.pressedCell && this.pressedCell.col === col && this.pressedCell.row === row && !cell.revealed) {
      roundRectFill(ctx, rect.x + 1, rect.y + 1, s - 2, s - 2, radius, 'rgba(0, 0, 0, 0.18)');
      roundRectStroke(ctx, rect.x + 1.5, rect.y + 1.5, s - 3, s - 3, radius, 'rgba(236, 229, 211, 0.12)', 1);
    }

    ctx.restore();
  }

  drawHiddenTile(ctx, rect, s, radius, col, row) {
    const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + s);
    grad.addColorStop(0, COLORS.tileTop);
    grad.addColorStop(1, COLORS.tileBottom);
    pathRoundRect(ctx, rect.x, rect.y, s, s, radius);
    ctx.fillStyle = grad;
    ctx.fill();

    // 顶部高光与底部暗边
    ctx.save();
    pathRoundRect(ctx, rect.x, rect.y, s, s, radius);
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, rect.y, 0, rect.y + s * 0.42);
    sheen.addColorStop(0, 'rgba(230, 238, 210, 0.09)');
    sheen.addColorStop(1, 'rgba(230, 238, 210, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(rect.x, rect.y, s, s * 0.5);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rect.x + radius * 0.5, rect.y + s - 0.5);
    ctx.lineTo(rect.x + s - radius * 0.5, rect.y + s - 0.5);
    ctx.stroke();

    // 石片颗粒
    if (s > 16) {
      const seed = hashCell(col, row);
      for (let i = 0; i < 3; i++) {
        const px = rect.x + 4 + ((seed >> (i * 5)) % Math.max(1, Math.floor(s - 8)));
        const py = rect.y + 4 + ((seed >> (i * 7 + 3)) % Math.max(1, Math.floor(s - 8)));
        ctx.beginPath();
        ctx.arc(px, py, (i === 0 ? 0.8 : 0.6), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(228, 236, 210, 0.1)' : 'rgba(0, 0, 0, 0.14)';
        ctx.fill();
      }
    }
    ctx.restore();

    roundRectStroke(ctx, rect.x + 0.5, rect.y + 0.5, s - 1, s - 1, radius, 'rgba(8, 14, 10, 0.4)', 1);
  }

  drawOpenTile(ctx, rect, s, radius, adjacentMines) {
    const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + s);
    grad.addColorStop(0, COLORS.tileOpenTop);
    grad.addColorStop(1, COLORS.tileOpenBottom);
    pathRoundRect(ctx, rect.x + 0.5, rect.y + 0.5, s - 1, s - 1, radius);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.save();
    pathRoundRect(ctx, rect.x + 0.5, rect.y + 0.5, s - 1, s - 1, radius);
    ctx.clip();
    const inner = ctx.createLinearGradient(0, rect.y, 0, rect.y + s * 0.35);
    inner.addColorStop(0, 'rgba(22, 32, 23, 0.24)');
    inner.addColorStop(1, 'rgba(22, 32, 23, 0)');
    ctx.fillStyle = inner;
    ctx.fillRect(rect.x, rect.y, s, s * 0.45);
    // 苔藓颗粒
    const seed = hashCell(Math.round(rect.x), Math.round(rect.y));
    if (s > 15) {
      for (let i = 0; i < 2; i++) {
        const px = rect.x + 3 + ((seed >> (i * 6)) % Math.max(1, Math.floor(s - 6)));
        const py = rect.y + 3 + ((seed >> (i * 4 + 2)) % Math.max(1, Math.floor(s - 6)));
        ctx.beginPath();
        ctx.arc(px, py, 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(32, 45, 31, 0.16)';
        ctx.fill();
      }
    }
    ctx.restore();

    if (adjacentMines > 0) {
      const fontSize = Math.max(8, Math.min(s * 0.62, 22));
      setFont(ctx, fontSize, '600', FONT_SANS);
      ctx.fillStyle = NUMBER_COLORS[adjacentMines] || COLORS.cream;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.shadowColor = 'rgba(20, 30, 20, 0.4)';
      ctx.shadowBlur = 2;
      ctx.fillText(String(adjacentMines), rect.x + s / 2, rect.y + s / 2 + 0.5);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(rect.x + s / 2, rect.y + s / 2, Math.max(0.8, s * 0.045), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(32, 45, 31, 0.14)';
      ctx.fill();
    }
  }

  drawMineMarkTile(ctx, rect, s, radius, highlight) {
    const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + s);
    grad.addColorStop(0, COLORS.tileMineTop);
    grad.addColorStop(1, COLORS.tileMineBottom);
    pathRoundRect(ctx, rect.x, rect.y, s, s, radius);
    ctx.fillStyle = grad;
    ctx.fill();
    roundRectStroke(ctx, rect.x + 0.5, rect.y + 0.5, s - 1, s - 1, radius, COLORS.tileMineEdge, 1);
    if (highlight) {
      roundRectStroke(ctx, rect.x + 1.5, rect.y + 1.5, s - 3, s - 3, radius, 'rgba(248, 226, 178, 0.5)', 1);
    }
  }

  drawExposedMineTile(ctx, rect, s, radius, exploded, flagged) {
    const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + s);
    if (exploded) {
      grad.addColorStop(0, '#9a5b45');
      grad.addColorStop(1, '#7c4736');
    } else {
      grad.addColorStop(0, '#5d5847');
      grad.addColorStop(1, '#49463a');
    }
    pathRoundRect(ctx, rect.x, rect.y, s, s, radius);
    ctx.fillStyle = grad;
    ctx.fill();
    roundRectStroke(ctx, rect.x + 0.5, rect.y + 0.5, s - 1, s - 1, radius, exploded ? 'rgba(240, 205, 160, 0.5)' : 'rgba(18, 24, 18, 0.4)', 1);
    if (exploded) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(rect.x + s / 2, rect.y + s / 2, s * 0.38, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(246, 215, 168, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
    this.drawMineGlyph(ctx, rect.x + s / 2, rect.y + s / 2, s * 0.3, exploded ? '#f4ddb2' : 'rgba(235, 222, 190, 0.9)');
    if (flagged) {
      ctx.beginPath();
      ctx.moveTo(rect.x + 2, rect.y + 2);
      ctx.lineTo(rect.x + 7, rect.y + 7);
      ctx.moveTo(rect.x + 7, rect.y + 2);
      ctx.lineTo(rect.x + 2, rect.y + 7);
      ctx.strokeStyle = 'rgba(244, 221, 178, 0.8)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  addRevealAnimation(cells, now) {
    if (!cells || !cells.length) return;
    const stamp = now || Date.now();
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      this.anims[c.col + ',' + c.row] = stamp;
    }
  }

  updateAnimations(now) {
    const keys = Object.keys(this.anims);
    if (!keys.length) return false;
    let changed = false;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const parts = key.split(',');
      const col = Number(parts[0]);
      const row = Number(parts[1]);
      const start = this.anims[key];
      const progress = (now - start) / TIMING.revealAnim;
      if (progress >= 1) {
        delete this.anims[key];
        this.drawCell(col, row, null);
        changed = true;
      } else {
        this.drawCell(col, row, { progress: progress });
        changed = true;
      }
    }
    return changed;
  }

  drawStats(meta) {
    if (!this.layout || !this.metrics) return;
    const ctx = this.sctx;
    const rect = this.layout.stats;
    this.restoreBgRegion(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);

    roundRectFill(ctx, rect.x, rect.y, rect.w, rect.h, 12, 'rgba(10, 16, 12, 0.74)');
    roundRectStroke(ctx, rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1, 12, 'rgba(229, 236, 209, 0.08)', 1);

    const isLevel = meta.kind === 'level';
    const columns = [rect.x + rect.w / 6, rect.x + rect.w / 2, rect.x + rect.w * 5 / 6];
    ctx.strokeStyle = 'rgba(229, 236, 209, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.w / 3, rect.y + 12);
    ctx.lineTo(rect.x + rect.w / 3, rect.y + rect.h - 12);
    ctx.moveTo(rect.x + rect.w * 2 / 3, rect.y + 12);
    ctx.lineTo(rect.x + rect.w * 2 / 3, rect.y + rect.h - 12);
    ctx.stroke();

    const labels = ['地雷标记', isLevel ? '剩余时间' : '用时', '最佳'];
    for (let i = 0; i < labels.length; i++) {
      drawSpaced(ctx, labels[i], columns[i], rect.y + 15, {
        size: 7.5,
        spacing: 1.2,
        color: 'rgba(236, 229, 211, 0.36)'
      });
    }

    // 地雷标记计数
    this.drawMineGlyph(ctx, columns[0] - 24, rect.y + 37, 4.5, 'rgba(217, 192, 138, 0.7)');
    text(ctx, meta.mineMarks + ' / ' + meta.totalMines, columns[0] + 5, rect.y + 38, {
      size: 15,
      weight: '600',
      color: COLORS.cream,
      align: 'center'
    });

    if (isLevel) {
      const remaining = Math.max(0, meta.remainingSeconds);
      const pulse = !meta.finished && remaining <= 10 && remaining > 0;
      let scale = 1;
      let color = COLORS.cream;
      if (pulse) {
        const phase = (Date.now() % 1000) / 1000;
        scale = 1 + 0.07 * Math.sin(phase * Math.PI * 2);
        color = remaining <= 5 ? '#e2a086' : '#e6c398';
      }
      ctx.save();
      ctx.translate(columns[1], rect.y + 37);
      ctx.scale(scale, scale);
      if (pulse) {
        ctx.shadowColor = 'rgba(224, 168, 130, 0.55)';
        ctx.shadowBlur = 10;
      }
      text(ctx, LEVELS.formatSeconds(remaining), 0, 0.5, {
        size: 24,
        weight: '600',
        family: FONT_MONO,
        color: color
      });
      ctx.restore();
      const best = meta.bestSeconds;
      text(ctx, best ? LEVELS.formatSeconds(best) : '--:--', columns[2], rect.y + 38, {
        size: 15,
        weight: '500',
        family: FONT_MONO,
        color: best ? COLORS.cream : 'rgba(236, 229, 211, 0.3)'
      });
    } else {
      text(ctx, LEVELS.formatSeconds(meta.elapsedSeconds), columns[1], rect.y + 38, {
        size: 20,
        weight: '500',
        family: FONT_MONO,
        color: COLORS.cream
      });
      const best = meta.bestSeconds;
      text(ctx, best ? LEVELS.formatSeconds(best) : '--:--', columns[2], rect.y + 38, {
        size: 15,
        weight: '500',
        family: FONT_MONO,
        color: best ? COLORS.cream : 'rgba(236, 229, 211, 0.3)'
      });
    }
  }

  setPressedCell(cell) {
    if (!cell) {
      if (this.pressedCell) {
        const old = this.pressedCell;
        this.pressedCell = null;
        this.drawCell(old.col, old.row, null);
      }
      return;
    }
    if (this.pressedCell && this.pressedCell.col === cell.col && this.pressedCell.row === cell.row) return;
    if (this.pressedCell) {
      const old = this.pressedCell;
      this.pressedCell = { col: cell.col, row: cell.row };
      this.drawCell(old.col, old.row, null);
      this.drawCell(cell.col, cell.row, null);
    } else {
      this.pressedCell = { col: cell.col, row: cell.row };
      this.drawCell(cell.col, cell.row, null);
    }
  }

  // ---------------------------------------------------------------------------
  // 海报预览
  // ---------------------------------------------------------------------------

  renderPosterScreen(data) {
    this.beginScreen('poster');
    const ctx = this.sctx;
    const W = this.W;
    const H = this.H;
    const safeTop = this.safeTop;
    const safeBottom = this.safeBottom;

    this.drawIconButton(ctx, 'poster.back', 14, safeTop + 6, 36, 'back');
    drawSpaced(ctx, '分享海报', W / 2, safeTop + 22, {
      size: 16,
      spacing: 1.4,
      color: COLORS.cream,
      family: FONT_SERIF
    });
    drawSpaced(ctx, 'SHARE THE WILDS', W / 2, safeTop + 42, {
      size: 7.5,
      spacing: 2.2,
      color: 'rgba(236, 229, 211, 0.32)'
    });

    const buttonsY = H - safeBottom - 64;
    const noteY = buttonsY - 24;
    const areaTop = safeTop + 66;
    const areaBottom = noteY - 12;
    const availW = W - 44;
    const availH = areaBottom - areaTop;
    const scale = Math.min(availW / 750, availH / 1334);
    const posterW = 750 * scale;
    const posterH = 1334 * scale;
    const px = (W - posterW) / 2;
    const py = areaTop + Math.max(0, (availH - posterH) / 2);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    roundRectFill(ctx, px - 4, py - 4, posterW + 8, posterH + 8, 4, 'rgba(28, 24, 17, 0.9)');
    ctx.restore();

    if (data.source) {
      try {
        ctx.drawImage(data.source, px, py, posterW, posterH);
      } catch (err) {
        roundRectFill(ctx, px, py, posterW, posterH, 2, '#18231a');
        text(ctx, '海报加载失败', W / 2, py + posterH / 2, { size: 13, color: COLORS.creamDim });
      }
    } else {
      roundRectFill(ctx, px, py, posterW, posterH, 2, '#18231a');
      setFont(ctx, 13, '400', FONT_SANS);
      ctx.fillStyle = COLORS.creamDim;
      ctx.textAlign = 'center';
      ctx.fillText('正在生成海报…', W / 2, py + posterH / 2);
    }

    roundRectStroke(ctx, px + 0.5, py + 0.5, posterW - 1, posterH - 1, 2, 'rgba(217, 192, 138, 0.28)', 1);

    text(ctx, data.hasQr === false ? '小程序码暂不可用，可保存海报后手动分享' : '长按海报可保存 · 识别小程序码进入山林', W / 2, noteY, {
      size: 9,
      color: 'rgba(236, 229, 211, 0.42)'
    });

    const btnW = (W - 44 - 12) / 2;
    this.drawButton(ctx, {
      id: 'poster.save',
      x: 22,
      y: buttonsY,
      w: btnW,
      h: 48,
      label: '保存到相册',
      icon: 'check',
      variant: 'primary',
      iconSize: 15,
      fontSize: 13,
      radius: 14
    });
    this.drawButton(ctx, {
      id: 'poster.share',
      x: 22 + btnW + 12,
      y: buttonsY,
      w: btnW,
      h: 48,
      label: '分享给好友',
      icon: 'share',
      variant: 'ghost',
      iconSize: 15,
      fontSize: 13,
      radius: 14
    });
  }

  // ---------------------------------------------------------------------------
  // 弹层
  // ---------------------------------------------------------------------------

  drawScrim(ctx) {
    ctx.fillStyle = 'rgba(6, 10, 8, 0.66)';
    ctx.fillRect(0, 0, this.W, this.H);
    this.addHit('overlay.scrim', 0, 0, this.W, this.H);
  }

  drawOverlayTitle(ctx, label, title, subtitle, panelX, panelY, panelW) {
    const cx = panelX + panelW / 2;
    drawSpaced(ctx, label, cx, panelY + 34, {
      size: 8,
      spacing: 2.4,
      color: 'rgba(217, 192, 138, 0.7)'
    });
    setFont(ctx, 28, '400', FONT_SERIF);
    ctx.fillStyle = COLORS.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, cx, panelY + 74);
    if (subtitle) {
      setFont(ctx, 11, '400', FONT_SANS);
      ctx.fillStyle = 'rgba(236, 229, 211, 0.46)';
      ctx.fillText(subtitle, cx, panelY + 104);
    }
  }

  drawSettings(ctx, data) {
    this.beginOverlayHits();
    this.drawScrim(ctx);

    const W = this.W;
    const panelX = 22;
    const panelW = W - 44;
    const panelH = 448;
    const panelY = Math.max(this.safeTop + 16, (this.H - panelH) / 2);
    this.drawWoodPanel(ctx, panelX, panelY, panelW, panelH, 20, true);
    this.addHit('settings.panel', panelX, panelY, panelW, panelH);

    this.drawOverlayTitle(ctx, 'SETTINGS', '山林设置', '风与声，皆由你定', panelX, panelY, panelW);

    this.drawIconButton(ctx, 'settings.close', panelX + panelW - 46, panelY + 16, 32, 'close');

    const rowX = panelX + 18;
    const rowW = panelW - 36;
    let rowY = panelY + 132;

    this.drawSettingRow(ctx, {
      id: 'settings.sound',
      x: rowX,
      y: rowY,
      w: rowW,
      icon: data.sound ? 'sound' : 'soundOff',
      label: '音效',
      hint: data.sound ? '翻开、标记与通关音效均已开启' : '静音模式，仅保留游戏画面',
      on: !!data.sound
    });
    rowY += 62;

    this.drawSettingRow(ctx, {
      id: 'settings.vibrate',
      x: rowX,
      y: rowY,
      w: rowW,
      icon: 'vibrate',
      label: '振动',
      hint: data.vibrate ? '长按标记时轻振一下' : '已关闭触感反馈',
      on: !!data.vibrate
    });

    rowY += 68;
    ctx.strokeStyle = 'rgba(229, 236, 209, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rowX, rowY);
    ctx.lineTo(rowX + rowW, rowY);
    ctx.stroke();

    rowY += 22;
    text(ctx, '经典模式难度', rowX, rowY, {
      size: 12,
      weight: '500',
      color: 'rgba(236, 229, 211, 0.8)',
      align: 'left'
    });
    text(ctx, '下一局生效', rowX + rowW, rowY, {
      size: 9,
      color: 'rgba(236, 229, 211, 0.3)',
      align: 'right'
    });

    const options = [
      { key: 'low', label: '低' },
      { key: 'mid', label: '中' },
      { key: 'high', label: '高' },
      { key: 'random', label: '随机' }
    ];
    const segY = rowY + 18;
    const segGap = 6;
    const segW = (rowW - segGap * 3) / 4;
    for (let i = 0; i < options.length; i++) {
      const item = options[i];
      const selected = data.difficulty === item.key;
      const x = rowX + i * (segW + segGap);
      const pressed = this.pressedId === 'settings.diff.' + item.key;
      roundRectFill(ctx, x, segY + (pressed ? 1 : 0), segW, 38, 10,
        selected ? 'rgba(111, 135, 99, 0.9)' : 'rgba(16, 24, 18, 0.55)');
      roundRectStroke(ctx, x + 0.5, segY + (pressed ? 0.5 : 0.5), segW - 1, 38, 10,
        selected ? 'rgba(235, 243, 218, 0.28)' : 'rgba(229, 236, 209, 0.1)', 1);
      text(ctx, item.label, x + segW / 2, segY + 19.5 + (pressed ? 1 : 0), {
        size: 13,
        weight: selected ? '600' : '400',
        color: selected ? '#f4f0e0' : 'rgba(236, 229, 211, 0.6)'
      });
      this.addHit('settings.diff.' + item.key, x, segY, segW, 38);
    }

    const noteY = segY + 56;
    text(ctx, data.difficulty === 'random' ? '随机：每局开始从低 / 中 / 高等概率抽取。' : '难度会用于下一局经典模式，当前对局不受影响。', rowX, noteY, {
      size: 9,
      color: 'rgba(236, 229, 211, 0.36)',
      align: 'left'
    });

    this.drawButton(ctx, {
      id: 'settings.done',
      x: panelX + 18,
      y: panelY + panelH - 62,
      w: panelW - 36,
      h: 46,
      label: '回到山林',
      variant: 'primary',
      fontSize: 14,
      radius: 12,
      icon: 'leaf',
      iconSize: 15
    });
  }

  drawSettingRow(ctx, opts) {
    const pressed = this.pressedId === opts.id;
    roundRectFill(ctx, opts.x, opts.y + (pressed ? 1 : 0), opts.w, 50, 12, 'rgba(255, 240, 205, 0.035)');
    const cy = opts.y + 25 + (pressed ? 1 : 0);
    this.drawIcon(ctx, opts.icon, opts.x + 22, cy, 17, 'rgba(230, 238, 212, 0.72)');
    text(ctx, opts.label, opts.x + 42, cy - 8, {
      size: 13,
      weight: '500',
      color: COLORS.cream,
      align: 'left'
    });
    text(ctx, opts.hint, opts.x + 42, cy + 10, {
      size: 8.5,
      color: 'rgba(236, 229, 211, 0.36)',
      align: 'left'
    });

    const trackW = 42;
    const trackH = 24;
    const tx = opts.x + opts.w - trackW - 6;
    const ty = cy - trackH / 2;
    roundRectFill(ctx, tx, ty, trackW, trackH, trackH / 2, opts.on ? 'rgba(111, 135, 99, 0.9)' : 'rgba(52, 60, 48, 0.8)');
    roundRectStroke(ctx, tx + 0.5, ty + 0.5, trackW - 1, trackH - 1, trackH / 2, 'rgba(236, 229, 211, 0.12)', 1);
    const knobX = opts.on ? tx + trackW - trackH / 2 - 2 : tx + trackH / 2 + 2;
    ctx.beginPath();
    ctx.arc(knobX, ty + trackH / 2, trackH / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = opts.on ? '#f1eddc' : 'rgba(236, 229, 211, 0.55)';
    ctx.fill();

    this.addHit(opts.id, opts.x, opts.y, opts.w, 50);
  }

  drawStatsRow(ctx, x, y, w, items) {
    const columnW = w / items.length;
    for (let i = 0; i < items.length; i++) {
      const cx = x + columnW * (i + 0.5);
      drawSpaced(ctx, items[i].label, cx, y, {
        size: 8,
        spacing: 1.4,
        color: 'rgba(236, 229, 211, 0.38)'
      });
      setFont(ctx, 20, '500', FONT_MONO);
      ctx.fillStyle = COLORS.cream;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(items[i].value, cx, y + 26);
    }
  }

  drawNewBestBadge(ctx, cx, y, textValue) {
    const w = 58;
    roundRectFill(ctx, cx - w / 2, y - 9, w, 18, 9, 'rgba(217, 192, 138, 0.16)');
    roundRectStroke(ctx, cx - w / 2 + 0.5, y - 8.5, w - 1, 17, 9, 'rgba(217, 192, 138, 0.3)', 1);
    drawSpaced(ctx, textValue || '新纪录', cx, y + 0.5, {
      size: 8,
      spacing: 1,
      color: COLORS.gold
    });
  }

  drawClassicEnd(ctx, data) {
    this.beginOverlayHits();
    this.drawScrim(ctx);

    const W = this.W;
    const H = this.H;
    const panelW = W - 48;
    const panelH = 348;
    const panelX = 24;
    const panelY = Math.max(this.safeTop + 16, (H - panelH) / 2 + 6);
    this.drawWoodPanel(ctx, panelX, panelY, panelW, panelH, 20, true);
    this.drawIconButton(ctx, 'end.close', panelX + panelW - 44, panelY + 14, 30, 'close');

    drawSpaced(ctx, (data.randomMode ? 'CLASSIC · RANDOM · ' : 'CLASSIC · ') + data.difficultyName, panelX + panelW / 2, panelY + 28, {
      size: 8,
      spacing: 1.8,
      color: 'rgba(217, 192, 138, 0.7)'
    });
    setFont(ctx, 29, '400', FONT_SERIF);
    ctx.fillStyle = COLORS.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.win ? '山林已清' : '踩到地雷了', panelX + panelW / 2, panelY + 68);
    setFont(ctx, 10.5, '400', FONT_SANS);
    ctx.fillStyle = 'rgba(236, 229, 211, 0.45)';
    ctx.fillText(data.win ? '雾气散去，你走出了这片林' : '山风掠过，棋子翻在了雷上', panelX + panelW / 2, panelY + 97);

    ctx.strokeStyle = 'rgba(217, 192, 138, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, panelY + 118);
    ctx.lineTo(panelX + panelW - 30, panelY + 118);
    ctx.stroke();

    this.drawStatsRow(ctx, panelX + 22, panelY + 142, panelW - 44, [
      { label: '用时', value: LEVELS.formatSeconds(data.seconds) },
      { label: '最佳', value: data.best ? LEVELS.formatSeconds(data.best) : '--:--' }
    ]);
    if (data.isNewBest && data.win) {
      this.drawNewBestBadge(ctx, panelX + panelW * 0.75, panelY + 192, '新纪录');
    }

    this.drawButton(ctx, {
      id: 'end.again',
      x: panelX + 22,
      y: panelY + 212,
      w: panelW - 44,
      h: 48,
      label: data.win ? '再来一局' : '再试一次',
      variant: 'primary',
      fontSize: 14,
      radius: 12
    });

    const halfW = (panelW - 44 - 10) / 2;
    this.drawButton(ctx, {
      id: 'end.poster',
      x: panelX + 22,
      y: panelY + 272,
      w: halfW,
      h: 44,
      label: '生成海报',
      icon: 'share',
      variant: 'ghost',
      fontSize: 12,
      iconSize: 14,
      radius: 11
    });
    this.drawButton(ctx, {
      id: 'end.home',
      x: panelX + 22 + halfW + 10,
      y: panelY + 272,
      w: halfW,
      h: 44,
      label: '返回山林',
      icon: 'leaf',
      variant: 'ghost',
      fontSize: 12,
      iconSize: 14,
      radius: 11
    });

    this.addHit('overlay.block', 0, 0, W, panelY - 4);
    this.addHit('overlay.block', 0, panelY + panelH + 4, W, H - panelY - panelH);
  }

  drawLevelFail(ctx, data) {
    this.beginOverlayHits();
    this.drawScrim(ctx);

    const W = this.W;
    const H = this.H;
    const panelW = W - 48;
    const panelH = 326;
    const panelX = 24;
    const panelY = Math.max(this.safeTop + 16, (H - panelH) / 2);
    this.drawWoodPanel(ctx, panelX, panelY, panelW, panelH, 20, true);
    this.drawIconButton(ctx, 'fail.close', panelX + panelW - 44, panelY + 14, 30, 'close');

    drawSpaced(ctx, 'LEVEL ' + data.level + ' · FAILED', panelX + panelW / 2, panelY + 30, {
      size: 8,
      spacing: 1.8,
      color: 'rgba(217, 192, 138, 0.66)'
    });
    setFont(ctx, 28, '400', FONT_SERIF);
    ctx.fillStyle = COLORS.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('雾气合拢', panelX + panelW / 2, panelY + 70);
    setFont(ctx, 11, '400', FONT_SANS);
    ctx.fillStyle = 'rgba(236, 229, 211, 0.46)';
    ctx.fillText(data.reason === 'timeout' ? '倒计时归零，山径重新隐入雾中' : '踩到了苔藓下的那枚雷', panelX + panelW / 2, panelY + 100);

    ctx.strokeStyle = 'rgba(217, 192, 138, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, panelY + 122);
    ctx.lineTo(panelX + panelW - 30, panelY + 122);
    ctx.stroke();

    this.drawStatsRow(ctx, panelX + 22, panelY + 146, panelW - 44, [
      { label: '关卡', value: '第 ' + data.level + ' 关' },
      { label: '用时', value: LEVELS.formatSeconds(data.seconds) },
      { label: '最佳', value: data.best ? LEVELS.formatSeconds(data.best) : '--:--' }
    ]);

    this.drawButton(ctx, {
      id: 'fail.retry',
      x: panelX + 22,
      y: panelY + 200,
      w: panelW - 44,
      h: 48,
      label: '再试一次',
      variant: 'primary',
      fontSize: 14,
      radius: 12
    });
    this.drawButton(ctx, {
      id: 'fail.levels',
      x: panelX + 22,
      y: panelY + 260,
      w: panelW - 44,
      h: 42,
      label: '选择关卡',
      variant: 'ghost',
      fontSize: 12,
      radius: 11
    });

    this.addHit('overlay.block', 0, 0, W, panelY - 4);
    this.addHit('overlay.block', 0, panelY + panelH + 4, W, H - panelY - panelH);
  }

  drawLevelSuccess(ctx, data) {
    this.beginOverlayHits();
    this.drawScrim(ctx);

    const W = this.W;
    const H = this.H;
    const panelW = W - 48;
    const panelH = 348;
    const panelX = 24;
    const panelY = Math.max(this.safeTop + 16, (H - panelH) / 2);
    this.drawWoodPanel(ctx, panelX, panelY, panelW, panelH, 20, true);
    this.drawIconButton(ctx, 'success.close', panelX + panelW - 44, panelY + 14, 30, 'close');

    drawSpaced(ctx, 'LEVEL ' + data.level + ' · CLEARED', panelX + panelW / 2, panelY + 30, {
      size: 8,
      spacing: 1.8,
      color: 'rgba(217, 192, 138, 0.75)'
    });
    setFont(ctx, 28, '400', FONT_SERIF);
    ctx.fillStyle = COLORS.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.lastLevel ? '九关尽览' : '第 ' + data.level + ' 关 · 通过', panelX + panelW / 2, panelY + 70);
    setFont(ctx, 10.5, '400', FONT_SANS);
    ctx.fillStyle = 'rgba(236, 229, 211, 0.46)';
    ctx.fillText(data.lastLevel ? '山高水长，九关皆已点亮' : '灯亮了，下一段山径已经出现', panelX + panelW / 2, panelY + 100);

    ctx.strokeStyle = 'rgba(217, 192, 138, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, panelY + 122);
    ctx.lineTo(panelX + panelW - 30, panelY + 122);
    ctx.stroke();

    this.drawStatsRow(ctx, panelX + 22, panelY + 146, panelW - 44, [
      { label: '用时', value: LEVELS.formatSeconds(data.seconds) },
      { label: '最佳', value: data.best ? LEVELS.formatSeconds(data.best) : '--:--' }
    ]);
    if (data.isNewBest) {
      this.drawNewBestBadge(ctx, panelX + panelW * 0.75, panelY + 192, '新纪录');
    }

    this.drawButton(ctx, {
      id: 'success.poster',
      x: panelX + 22,
      y: panelY + 212,
      w: panelW - 44,
      h: 48,
      label: '生成分享海报',
      icon: 'share',
      variant: 'primary',
      fontSize: 14,
      iconSize: 15,
      radius: 12
    });

    if (!data.lastLevel) {
      const halfW = (panelW - 44 - 10) / 2;
      this.drawButton(ctx, {
        id: 'success.next',
        x: panelX + 22,
        y: panelY + 272,
        w: halfW,
        h: 44,
        label: '下一关',
        variant: 'ghost',
        fontSize: 12,
        radius: 11
      });
      this.drawButton(ctx, {
        id: 'success.levels',
        x: panelX + 22 + halfW + 10,
        y: panelY + 272,
        w: halfW,
        h: 44,
        label: '选择关卡',
        variant: 'ghost',
        fontSize: 12,
        radius: 11
      });
    } else {
      this.drawButton(ctx, {
        id: 'success.levels',
        x: panelX + 22,
        y: panelY + 272,
        w: panelW - 44,
        h: 44,
        label: '回到山径',
        variant: 'ghost',
        fontSize: 12,
        radius: 11
      });
    }

    this.addHit('overlay.block', 0, 0, W, panelY - 4);
    this.addHit('overlay.block', 0, panelY + panelH + 4, W, H - panelY - panelH);
  }

  drawLoading(ctx, textValue) {
    this.beginOverlayHits();
    this.drawScrim(ctx);
    const W = this.W;
    const H = this.H;
    const w = 190;
    const h = 88;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    this.drawWoodPanel(ctx, x, y, w, h, 16, true);
    const phase = (Date.now() % 900) / 900;
    ctx.save();
    ctx.translate(x + 32, y + h / 2);
    ctx.rotate(phase * Math.PI * 2);
    ctx.strokeStyle = 'rgba(217, 192, 138, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 1.4);
    ctx.stroke();
    ctx.restore();
    text(ctx, textValue || '正在生成海报…', x + 54, y + h / 2, {
      size: 11,
      color: 'rgba(236, 229, 211, 0.75)',
      align: 'left'
    });
    this.addHit('overlay.block', 0, 0, W, H);
  }

  drawToast(ctx, value) {
    if (!value) return;
    const W = this.W;
    const maxTextWidth = W - 88;
    const lines = wrapLines(ctx, value, maxTextWidth, 11.5, FONT_SANS);
    if (!lines.length) return;
    setFont(ctx, 11.5, '400', FONT_SANS);
    let longest = 0;
    for (let i = 0; i < lines.length; i++) {
      longest = Math.max(longest, ctx.measureText(lines[i]).width);
    }
    const w = Math.min(W - 44, longest + 52);
    const lineHeight = 16;
    const h = Math.max(36, lines.length * lineHeight + 16);
    const x = (W - w) / 2;
    const bottom = this.H - this.safeBottom - 118;
    const y = bottom - h;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    roundRectFill(ctx, x, y, w, h, Math.min(18, h / 2), COLORS.toastBg);
    ctx.restore();
    roundRectStroke(ctx, x + 0.5, y + 0.5, w - 1, h - 1, Math.min(18, h / 2), 'rgba(229, 236, 209, 0.14)', 1);
    ctx.beginPath();
    ctx.arc(x + 18, y + h / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(217, 192, 138, 0.8)';
    ctx.fill();
    for (let i = 0; i < lines.length; i++) {
      text(ctx, lines[i], x + w / 2 + 8, y + h / 2 - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight + 0.5, {
        size: 11.5,
        color: COLORS.cream
      });
    }
  }
}

module.exports = Renderer;
