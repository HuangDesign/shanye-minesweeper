'use strict';

const Game = require('../../minigame/js/main.js');

function windowInfo() {
  try {
    if (wx.getWindowInfo) return wx.getWindowInfo();
    return wx.getSystemInfoSync();
  } catch (err) {
    return { windowWidth: 375, windowHeight: 667, pixelRatio: 2, safeArea: { top: 20, bottom: 667 } };
  }
}

Page({
  data: {
    width: 375,
    height: 667
  },

  onLoad: function () {
    const info = windowInfo();
    this.setData({
      width: info.windowWidth || 375,
      height: info.windowHeight || 667
    });
  },

  onReady: function () {
    const self = this;
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas').fields({ node: true, size: true }).exec(function (res) {
      const item = res && res[0];
      if (!item || !item.node) {
        console.error('[扫雷·山林] canvas node not found');
        return;
      }
      const canvas = item.node;
      const info = windowInfo();
      const dpr = info.pixelRatio || 1;
      canvas.width = Math.round((info.windowWidth || 375) * dpr);
      canvas.height = Math.round((info.windowHeight || 667) * dpr);

      const raf = function (cb) {
        if (canvas.requestAnimationFrame) {
          canvas.requestAnimationFrame(cb);
        } else {
          setTimeout(cb, 16);
        }
      };

      const createOffscreenCanvas = function (width, height) {
        if (typeof wx.createOffscreenCanvas !== 'function') return null;
        try {
          return wx.createOffscreenCanvas({
            type: '2d',
            width: Math.max(1, width || 1),
            height: Math.max(1, height || 1)
          });
        } catch (err) {
          return null;
        }
      };

      const game = new Game({
        canvas: canvas,
        miniProgram: true,
        requestAnimationFrame: raf,
        createOffscreenCanvas: createOffscreenCanvas,
        assetPrefix: 'minigame/'
      });
      self.game = game;
      wx.__game = game;
    });
  },

  touchStart: function (event) {
    if (this.game) this.game.input.onStart(event);
  },

  touchMove: function (event) {
    if (this.game) this.game.input.onMove(event);
  },

  touchEnd: function (event) {
    if (this.game) this.game.input.onEnd(event);
  },

  touchCancel: function (event) {
    if (this.game) this.game.input.cancel(event);
  },

  onShareAppMessage: function () {
    if (this.game && this.game.getSharePayload) {
      return this.game.getSharePayload();
    }
    return {
      title: '来山林里扫雷',
      path: 'pages/index/index?from=card'
    };
  }
});
