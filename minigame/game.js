'use strict';

/**
 * 小游戏入口。
 * 全部界面由 Canvas 2D 绘制，不使用 WXML / WXSS。
 */

const Game = require('./js/main.js');

const game = new Game();

if (typeof wx !== 'undefined' && wx.__PREVIEW__) {
  wx.__game = game;
  if (typeof window !== 'undefined') {
    window.__game = game;
  }
}

module.exports = game;
