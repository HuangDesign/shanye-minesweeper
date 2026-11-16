'use strict';

/**
 * 本地持久化封装。
 * - 所有读写都做容错，存储损坏时回退默认值。
 * - 朋友圈单页模式（scene 1155）通过 setVolatile(true) 改用内存存储，
 *   不依赖完整本地存储，也不会污染玩家纪录。
 * - 在浏览器预览 / Node 测试环境下自动切换为内存存储。
 */

const levels = require('./levels.js');

const KEY = {
  settings: 'settings',
  classicDifficulty: 'classicDifficulty',
  classicBest: 'classicBest',
  levelProgress: 'levelProgress'
};

const DEFAULT_SETTINGS = { sound: true, vibrate: true };
const DEFAULT_BEST = { low: null, mid: null, high: null };

let volatile = false;
let available = null;
const memory = {};

function getWx() {
  if (typeof wx !== 'undefined' && wx) return wx;
  return null;
}

function checkAvailable() {
  if (available !== null) return available;
  const w = getWx();
  if (!w || typeof w.getStorageSync !== 'function' || typeof w.setStorageSync !== 'function') {
    available = false;
    return available;
  }
  try {
    const probe = '__shanye_probe__';
    w.setStorageSync(probe, 1);
    w.removeStorageSync(probe);
    available = true;
  } catch (err) {
    available = false;
  }
  return available;
}

function setVolatile(value) {
  volatile = !!value;
}

function isVolatile() {
  return volatile;
}

function readRaw(key) {
  if (!volatile && checkAvailable()) {
    try {
      return getWx().getStorageSync(key);
    } catch (err) {
      return memory[key];
    }
  }
  return memory[key];
}

function writeRaw(key, value) {
  memory[key] = value;
  if (volatile || !checkAvailable()) return false;
  try {
    getWx().setStorageSync(key, value);
    return true;
  } catch (err) {
    return false;
  }
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeSettings(raw) {
  if (!isPlainObject(raw)) return { sound: true, vibrate: true };
  return {
    sound: typeof raw.sound === 'boolean' ? raw.sound : true,
    vibrate: typeof raw.vibrate === 'boolean' ? raw.vibrate : true
  };
}

function loadSettings() {
  return normalizeSettings(readRaw(KEY.settings));
}

function saveSettings(settings) {
  return writeRaw(KEY.settings, normalizeSettings(settings));
}

function loadDifficulty() {
  const raw = readRaw(KEY.classicDifficulty);
  if (raw === 'low' || raw === 'mid' || raw === 'high' || raw === 'random') return raw;
  return 'mid';
}

function saveDifficulty(value) {
  if (['low', 'mid', 'high', 'random'].indexOf(value) === -1) return false;
  return writeRaw(KEY.classicDifficulty, value);
}

function normalizeBest(raw) {
  const out = { low: null, mid: null, high: null };
  if (!isPlainObject(raw)) return out;
  ['low', 'mid', 'high'].forEach(function (key) {
    const value = Number(raw[key]);
    if (isFinite(value) && value > 0) out[key] = Math.max(1, Math.round(value));
  });
  return out;
}

function loadClassicBest() {
  return normalizeBest(readRaw(KEY.classicBest));
}

function saveClassicBest(best) {
  return writeRaw(KEY.classicBest, normalizeBest(best));
}

/**
 * 记录经典模式最佳成绩，返回 { best, isNewBest }。
 */
function recordClassicBest(difficulty, seconds) {
  const best = loadClassicBest();
  const value = Math.max(1, Math.round(seconds));
  const previous = best[difficulty];
  const isNewBest = !previous || value < previous;
  if (isNewBest) {
    best[difficulty] = value;
    saveClassicBest(best);
  }
  return { best: best[difficulty], isNewBest: isNewBest };
}

function loadProgress() {
  const raw = readRaw(KEY.levelProgress);
  return levels.normalizeProgress(raw);
}

function saveProgress(progress) {
  const normalized = levels.normalizeProgress(progress);
  writeRaw(KEY.levelProgress, normalized);
  return normalized;
}

function clearAll() {
  Object.keys(KEY).forEach(function (name) {
    const key = KEY[name];
    delete memory[key];
    if (checkAvailable()) {
      try { getWx().removeStorageSync(key); } catch (err) { /* ignore */ }
    }
  });
}

module.exports = {
  KEY,
  DEFAULT_SETTINGS,
  DEFAULT_BEST,
  setVolatile,
  isVolatile,
  loadSettings,
  saveSettings,
  loadDifficulty,
  saveDifficulty,
  loadClassicBest,
  saveClassicBest,
  recordClassicBest,
  loadProgress,
  saveProgress,
  clearAll
};
