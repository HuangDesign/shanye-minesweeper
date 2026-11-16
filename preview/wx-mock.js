'use strict';

/**
 * 本地浏览器预览用的 wx API 模拟层。
 * 仅用于开发验收，不参与小游戏构建。
 */

(function () {
  const params = new URLSearchParams(window.location.search);
  const W = Number(params.get('w') || 390);
  const H = Number(params.get('h') || 844);
  const dpr = window.devicePixelRatio || 2;
  const safeTop = params.has('safeTop') ? Number(params.get('safeTop')) : (H >= 800 ? 47 : 20);
  const safeBottom = params.has('safeBottom') ? Number(params.get('safeBottom')) : (H >= 800 ? 34 : 0);

  let mainCanvas = null;
  const touchHandlers = { start: [], move: [], end: [], cancel: [] };
  const showHandlers = [];
  const hideHandlers = [];
  const audioContexts = [];

  function storageKey(key) {
    return 'shanye:' + key;
  }

  function getMainCanvas() {
    const el = document.getElementById('game');
    el.style.width = W + 'px';
    el.style.height = H + 'px';
    return el;
  }

  function makeTouchEvent(x, y) {
    const touch = { clientX: x, clientY: y, pageX: x, pageY: y, identifier: 1 };
    return {
      touches: [touch],
      changedTouches: [touch]
    };
  }

  function bindPointerEvents() {
    if (!mainCanvas) return;
    const canvas = mainCanvas;
    let active = false;

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    }

    function fire(name, event) {
      const p = point(event);
      const list = touchHandlers[name];
      for (let i = 0; i < list.length; i++) {
        try {
          list[i](makeTouchEvent(p.x, p.y));
        } catch (err) {
          console.error(err);
        }
      }
    }

    canvas.addEventListener('pointerdown', function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      active = true;
      try { canvas.setPointerCapture(event.pointerId); } catch (err) { /* ignore */ }
      fire('start', event);
      event.preventDefault();
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!active) return;
      fire('move', event);
      event.preventDefault();
    });
    canvas.addEventListener('pointerup', function (event) {
      if (!active) return;
      active = false;
      fire('end', event);
      event.preventDefault();
    });
    canvas.addEventListener('pointercancel', function () {
      active = false;
      for (let i = 0; i < touchHandlers.cancel.length; i++) touchHandlers.cancel[i]({});
    });
    canvas.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = reject;
      image.crossOrigin = 'anonymous';
      image.src = src;
    });
  }

  function fakeQrBase64() {
    const size = 300;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f7f2e6';
    ctx.fillRect(0, 0, size, size);
    const modules = 29;
    const cell = Math.floor((size - 40) / modules);
    const offset = (size - modules * cell) / 2;
    let seed = 20261105;
    const rand = function () {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    ctx.fillStyle = '#1d2a20';
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c >= modules - 8) ||
          (r >= modules - 8 && c < 8);
        if (inFinder) continue;
        if ((r + c) % 2 === 0 && rand() > 0.35) {
          ctx.fillRect(offset + c * cell, offset + r * cell, cell, cell);
        }
      }
    }
    function finder(cx, cy) {
      ctx.fillStyle = '#1d2a20';
      ctx.fillRect(offset + cx * cell, offset + cy * cell, cell * 7, cell * 7);
      ctx.fillStyle = '#f7f2e6';
      ctx.fillRect(offset + (cx + 1) * cell, offset + (cy + 1) * cell, cell * 5, cell * 5);
      ctx.fillStyle = '#1d2a20';
      ctx.fillRect(offset + (cx + 2) * cell, offset + (cy + 2) * cell, cell * 3, cell * 3);
    }
    finder(0, 0);
    finder(modules - 7, 0);
    finder(0, modules - 7);
    // 中心的小山林标记
    ctx.fillStyle = 'rgba(29, 42, 32, 0.92)';
    ctx.beginPath();
    ctx.moveTo(size / 2 - 26, size / 2 + 18);
    ctx.lineTo(size / 2 - 4, size / 2 - 14);
    ctx.lineTo(size / 2 + 8, size / 2 + 4);
    ctx.lineTo(size / 2 + 26, size / 2 - 18);
    ctx.lineTo(size / 2 + 34, size / 2 + 18);
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL('image/png').split(',')[1];
  }

  function download(dataUrl, filename) {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename || 'shanye-poster.png';
      document.body.appendChild(link);
      link.click();
      setTimeout(function () { link.remove(); }, 120);
    } catch (err) { /* ignore */ }
  }

  const wx = {
    __PREVIEW__: true,
    __download: download,
    getWindowInfo: function () {
      return {
        windowWidth: W,
        windowHeight: H,
        screenWidth: W,
        screenHeight: H,
        pixelRatio: dpr,
        statusBarHeight: safeTop,
        safeArea: {
          top: safeTop,
          bottom: H - safeBottom,
          left: 0,
          right: W,
          width: W,
          height: H - safeTop - safeBottom
        }
      };
    },
    getSystemInfoSync: function () {
      const info = wx.getWindowInfo();
      info.platform = 'devtools';
      info.SDKVersion = '3.5.7';
      return info;
    },
    getLaunchOptionsSync: function () {
      const query = {};
      params.forEach(function (value, key) { query[key] = value; });
      if (params.get('qrscene')) query.scene = params.get('qrscene');
      return {
        scene: Number(params.get('scene') || 1001),
        query: query,
        path: 'game.js',
        referrerInfo: {}
      };
    },
    createCanvas: function () {
      if (!mainCanvas) {
        mainCanvas = getMainCanvas();
        bindPointerEvents();
        return mainCanvas;
      }
      return document.createElement('canvas');
    },
    createImage: function () {
      return new Image();
    },
    onTouchStart: function (fn) { touchHandlers.start.push(fn); },
    onTouchMove: function (fn) { touchHandlers.move.push(fn); },
    onTouchEnd: function (fn) { touchHandlers.end.push(fn); },
    onTouchCancel: function (fn) { touchHandlers.cancel.push(fn); },
    getStorageSync: function (key) {
      const raw = localStorage.getItem(storageKey(key));
      if (raw === null) return '';
      try { return JSON.parse(raw); } catch (err) { return raw; }
    },
    setStorageSync: function (key, value) {
      localStorage.setItem(storageKey(key), JSON.stringify(value));
    },
    removeStorageSync: function (key) {
      localStorage.removeItem(storageKey(key));
    },
    createInnerAudioContext: function () {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0.5;
      const wrapper = {
        _audio: audio,
        _src: '',
        loop: false,
        volume: 0.5,
        set src(value) {
          this._src = value;
          audio.src = '../minigame/' + value;
        },
        get src() { return this._src; },
        play: function () {
          audio.volume = this.volume;
          audio.currentTime = 0;
          const promise = audio.play();
          if (promise && promise.catch) promise.catch(function () {});
        },
        stop: function () {
          try { audio.pause(); audio.currentTime = 0; } catch (err) { /* ignore */ }
        },
        seek: function (time) {
          try { audio.currentTime = time; } catch (err) { /* ignore */ }
        },
        pause: function () {
          try { audio.pause(); } catch (err) { /* ignore */ }
        },
        destroy: function () {
          try { audio.pause(); } catch (err) { /* ignore */ }
        }
      };
      audioContexts.push(wrapper);
      return wrapper;
    },
    setInnerAudioOption: function () {},
    onAudioInterruptionBegin: function () {},
    onAudioInterruptionEnd: function () {},
    vibrateShort: function () {
      if (navigator.vibrate) navigator.vibrate(12);
    },
    showShareMenu: function () {},
    onShareAppMessage: function (fn) {
      wx.__onShareAppMessage = fn;
    },
    showShareImageMenu: function (options) {
      if (params.get('share') === '0') {
        setTimeout(function () { options.fail && options.fail({ errMsg: 'unsupported' }); }, 0);
        return;
      }
      if (options.path && options.path.indexOf('data:') === 0) {
        download(options.path, 'shanye-poster.png');
      }
      setTimeout(function () { options.success && options.success({}); }, 0);
    },
    saveImageToPhotosAlbum: function (options) {
      if (options.filePath && options.filePath.indexOf('data:') === 0) {
        download(options.filePath, 'shanye-poster.png');
      }
      setTimeout(function () { options.success && options.success({}); }, 0);
    },
    getSetting: function (options) {
      setTimeout(function () { options.success && options.success({ authSetting: {} }); }, 0);
    },
    authorize: function (options) {
      setTimeout(function () { options.success && options.success({}); }, 0);
    },
    canvasToTempFilePath: function (options) {
      const canvas = options.canvas;
      if (!canvas) {
        setTimeout(function () { options.fail && options.fail({ errMsg: 'no canvas' }); }, 0);
        return;
      }
      setTimeout(function () {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          options.success && options.success({ tempFilePath: dataUrl });
        } catch (err) {
          options.fail && options.fail({ errMsg: String(err) });
        }
      }, 0);
    },
    onShow: function (fn) { showHandlers.push(fn); },
    onHide: function (fn) { hideHandlers.push(fn); },
    onWindowResize: function () {},
    getUpdateManager: function () {
      return { onCheckForUpdate: function () {}, onUpdateReady: function () {}, applyUpdate: function () {} };
    },
    triggerShow: function (options) {
      for (let i = 0; i < showHandlers.length; i++) showHandlers[i](options || wx.getLaunchOptionsSync());
    }
  };

  if (params.get('qr') === '1') {
    wx.cloud = {
      _ready: false,
      init: function () { this._ready = true; },
      callFunction: function (options) {
        return Promise.resolve({
          result: {
            ok: true,
            scene: options.data && options.data.scene,
            base64: fakeQrBase64()
          }
        });
      }
    };
  }

  window.wx = wx;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      for (let i = 0; i < hideHandlers.length; i++) hideHandlers[i]({});
    } else {
      for (let i = 0; i < showHandlers.length; i++) showHandlers[i](wx.getLaunchOptionsSync());
    }
  });

  // 暴露加载图片工具，便于调试
  wx.__loadImage = loadImage;
})();
