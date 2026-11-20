'use strict';

/**
 * 根目录小游戏入口（兼容微信开发者工具“小游戏模式”）。
 * 游戏内核仍在 minigame/js/；这里只负责传入资源前缀并启动。
 */

const Game = require('./minigame/js/main.js');

const game = new Game({ assetPrefix: 'minigame/' });

if (typeof wx !== 'undefined') {
  wx.__game = game;
}

module.exports = game;
