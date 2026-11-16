/* 自动生成：node tools/build-preview.js —— 请勿手改 */
(function () {
  var __defs = {};
  var __cache = {};
  function __resolve(fromId, request) {
    var base = fromId.indexOf("/") === -1 ? "" : fromId.substring(0, fromId.lastIndexOf("/"));
    var target = request;
    if (request.indexOf(".") === 0) {
      var parts = (base ? base.split("/") : []).concat(request.split("/"));
      var stack = [];
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (!part || part === ".") continue;
        if (part === "..") { stack.pop(); continue; }
        stack.push(part);
      }
      target = stack.join("/");
    }
    if (!/\.js$/.test(target)) target += ".js";
    return target;
  }
  function __require(id, fromId) {
    var resolved = __resolve(fromId || "", id);
    if (__cache[resolved]) return __cache[resolved].exports;
    var factory = __defs[resolved];
    if (!factory) throw new Error("Cannot find module " + id + " (resolved: " + resolved + ")");
    var module = { exports: {} };
    __cache[resolved] = module;
    factory(module, module.exports, function (request) { return __require(request, resolved); });
    return module.exports;
  }

// ---- js/config.js ----
__defs["js/config.js"] = function (module, exports, require) {
'use strict';

/**
 * 全局配置：难度、视觉、时间阈值。
 * 所有可调参数集中在此，便于上线后按真机反馈微调。
 */

const DIFFICULTIES = {
  low: { key: 'low', name: '低', cols: 9, rows: 9, mines: 10 },
  mid: { key: 'mid', name: '中', cols: 16, rows: 16, mines: 40 },
  high: { key: 'high', name: '高', cols: 16, rows: 30, mines: 99 }
};

const DIFFICULTY_ORDER = ['low', 'mid', 'high'];

const DIFFICULTY_LABEL = {
  low: '低',
  mid: '中',
  high: '高',
  random: '随机'
};

const COLORS = {
  bgTop: '#0c1511',
  bgMid: '#152019',
  bgBottom: '#1e2b22',
  bgPhoto: '#101a14',

  cream: '#ece5d3',
  creamDim: 'rgba(236, 229, 211, 0.66)',
  creamFaint: 'rgba(236, 229, 211, 0.34)',
  gold: '#d9c08a',

  moss: '#7d9271',
  mossDeep: '#4a5f45',
  mossLight: '#aebf9b',

  wood: '#2a241b',
  woodLight: '#3b3326',
  woodDark: '#1b1711',
  woodEdge: 'rgba(220, 198, 154, 0.20)',

  scrim: 'rgba(7, 12, 9, 0.72)',
  panel: 'rgba(24, 33, 26, 0.96)',
  panelEdge: 'rgba(196, 213, 170, 0.16)',

  tileTop: '#37473b',
  tileBottom: '#29372e',
  tileEdge: 'rgba(9, 15, 11, 0.62)',
  tileSheen: 'rgba(226, 233, 209, 0.07)',

  tileOpenTop: '#7f8d70',
  tileOpenBottom: '#6e7c61',
  tileOpenEdge: 'rgba(32, 42, 30, 0.42)',

  tileMineTop: '#cbb98d',
  tileMineBottom: '#b6a173',
  tileMineEdge: 'rgba(66, 52, 28, 0.55)',

  mineInk: '#241f16',
  leaf: '#d3e2b6',
  leafDark: '#9bb483',
  question: '#f0e7cf',

  danger: '#c07a63',
  dangerDeep: '#8f4f3e',
  success: '#a9c08a',

  toastBg: 'rgba(12, 19, 14, 0.92)'
};

const NUMBER_COLORS = {
  1: '#4d7397',
  2: '#4f744a',
  3: '#9d5c45',
  4: '#586091',
  5: '#86663a',
  6: '#45796f',
  7: '#575347',
  8: '#66565a'
};

const FONTS = {
  serif: '"Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif',
  sans: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  mono: '"SF Mono", "Menlo", "Consolas", monospace'
};

const TIMING = {
  longPress: 300,
  revealAnim: 220,
  toastDuration: 2400,
  failRevealDelay: 620,
  successDelay: 520,
  pulseWindow: 10,
  menuFade: 260
};

const LAYOUT = {
  maxCell: 42,
  minGap: 1,
  preferredGap: 4,
  boardPadding: 7,
  sideMargin: 14,
  boardBottomGap: 26
};

const CARD_SHARE_TEXT = {
  // 分享卡片图在运行时由 share.createCardImage() 生成，避免额外静态资源
  title: '来山林里扫雷，看看谁先清完这片雾气'
};

const CLOUD = {
  env: '', // 留空使用默认环境；部署后填写云环境 ID
  qrFunction: 'getQrCode',
  envVersion: '' // 可强制 develop / trial / release；留空自动读取
};

module.exports = {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  DIFFICULTY_LABEL,
  COLORS,
  NUMBER_COLORS,
  FONTS,
  TIMING,
  LAYOUT,
  CARD_SHARE_TEXT,
  CLOUD
};

};

// ---- js/levels.js ----
__defs["js/levels.js"] = function (module, exports, require) {
'use strict';

const LEVELS = [
  { id: 1, cols: 8, rows: 8, mines: 8, time: 90 },
  { id: 2, cols: 9, rows: 9, mines: 10, time: 80 },
  { id: 3, cols: 10, rows: 10, mines: 14, time: 75 },
  { id: 4, cols: 12, rows: 12, mines: 22, time: 70 },
  { id: 5, cols: 14, rows: 14, mines: 30, time: 65 },
  { id: 6, cols: 16, rows: 16, mines: 40, time: 60 },
  { id: 7, cols: 16, rows: 20, mines: 55, time: 55 },
  { id: 8, cols: 16, rows: 24, mines: 72, time: 50 },
  { id: 9, cols: 16, rows: 30, mines: 99, time: 45 }
];

function getLevel(id) {
  return LEVELS.find(function (level) { return level.id === id; }) || null;
}

function formatSeconds(seconds) {
  if (seconds === null || seconds === undefined || !isFinite(seconds)) return '--:--';
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return (m < 10 ? '0' + m : String(m)) + ':' + (s < 10 ? '0' + s : String(s));
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return total + ' 秒';
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? m + ' 分' : m + ' 分 ' + s + ' 秒';
}

function defaultProgress() {
  return { unlocked: 1, bestTimes: {} };
}

function normalizeProgress(raw) {
  const base = defaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const unlocked = Math.floor(Number(raw.unlocked));
  if (isFinite(unlocked)) base.unlocked = Math.max(1, Math.min(LEVELS.length + 1, unlocked));
  if (raw.bestTimes && typeof raw.bestTimes === 'object') {
    LEVELS.forEach(function (level) {
      const value = Number(raw.bestTimes[level.id]);
      if (isFinite(value) && value > 0) base.bestTimes[level.id] = Math.round(value);
    });
  }
  return base;
}

function isUnlocked(progress, levelId) {
  return progress.unlocked >= levelId;
}

function isCompleted(progress) {
  return progress.unlocked > LEVELS.length;
}

function recordLevelWin(progress, levelId, seconds) {
  const next = normalizeProgress(progress);
  const rounded = Math.max(1, Math.round(seconds));
  const previous = next.bestTimes[levelId];
  const isNewBest = !previous || rounded < previous;
  if (isNewBest) next.bestTimes[levelId] = rounded;
  if (levelId >= next.unlocked) {
    next.unlocked = Math.min(LEVELS.length + 1, levelId + 1);
  }
  return { progress: next, isNewBest: isNewBest, best: next.bestTimes[levelId] };
}

module.exports = {
  LEVELS,
  getLevel,
  formatSeconds,
  formatDuration,
  defaultProgress,
  normalizeProgress,
  isUnlocked,
  isCompleted,
  recordLevelWin
};

};

// ---- js/storage.js ----
__defs["js/storage.js"] = function (module, exports, require) {
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

};

// ---- js/game-core.js ----
__defs["js/game-core.js"] = function (module, exports, require) {
'use strict';

/**
 * 扫雷核心逻辑：布雷、首点安全、翻开、BFS 展开、标记循环、胜负判断。
 * 纯逻辑、无渲染依赖，可直接在 Node 中单测。
 */

const MARK = {
  HIDDEN: 0,
  SAFE: 1,
  SUSPECT: 2,
  MINE: 3
};

function createBoard(cols, rows, mineCount) {
  const safeCols = Math.max(2, Math.floor(cols));
  const safeRows = Math.max(2, Math.floor(rows));
  const total = safeCols * safeRows;
  const mines = Math.max(1, Math.min(total - 1, Math.floor(mineCount)));
  const cells = [];
  for (let r = 0; r < safeRows; r++) {
    const row = [];
    for (let c = 0; c < safeCols; c++) {
      row.push({ isMine: false, adjacentMines: 0, revealed: false, mark: MARK.HIDDEN });
    }
    cells.push(row);
  }
  return {
    cols: safeCols,
    rows: safeRows,
    mineCount: mines,
    cells: cells,
    minesPlaced: false,
    revealedCount: 0,
    exploded: null,
    gameOver: null, // null | 'win' | 'lose'
    firstReveal: null
  };
}

function inBounds(board, col, row) {
  return col >= 0 && col < board.cols && row >= 0 && row < board.rows;
}

function getCell(board, col, row) {
  if (!inBounds(board, col, row)) return null;
  return board.cells[row][col];
}

function forEachNeighbor(board, col, row, fn) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dc === 0 && dr === 0) continue;
      const nc = col + dc;
      const nr = row + dr;
      if (inBounds(board, nc, nr)) fn(nc, nr, board.cells[nr][nc]);
    }
  }
}

function countAdjacentMines(board, col, row) {
  let count = 0;
  forEachNeighbor(board, col, row, function (nc, nr, cell) {
    if (cell.isMine) count++;
  });
  return count;
}

/**
 * 首次翻开时布雷。排除首点及其 8 邻域；若可布雷格不足，
 * 退化为只排除首点，始终保证首点不是雷。
 */
function placeMines(board, safeCol, safeRow) {
  if (board.minesPlaced) return;
  const total = board.cols * board.rows;
  const excluded = [];
  let candidates = [];

  forEachNeighbor(board, safeCol, safeRow, function (nc, nr) {
    excluded.push(nr * board.cols + nc);
  });
  excluded.push(safeRow * board.cols + safeCol);

  for (let i = 0; i < total; i++) {
    if (excluded.indexOf(i) === -1) candidates.push(i);
  }
  if (candidates.length < board.mineCount) {
    // 可布雷格不足：只保证首点不是雷
    candidates = [];
    for (let i = 0; i < total; i++) {
      if (i !== safeRow * board.cols + safeCol) candidates.push(i);
    }
  }
  if (candidates.length < board.mineCount) {
    // 极端兜底：理论上不会发生（mineCount <= total-1）
    candidates = [];
    for (let i = 0; i < total; i++) candidates.push(i);
  }

  // Fisher–Yates 部分洗牌，取前 mineCount 个
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  for (let k = 0; k < board.mineCount; k++) {
    const index = candidates[k];
    board.cells[Math.floor(index / board.cols)][index % board.cols].isMine = true;
  }

  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      if (!cell.isMine) cell.adjacentMines = countAdjacentMines(board, c, r);
    }
  }

  board.minesPlaced = true;
}

function toggleMark(board, col, row) {
  if (board.gameOver) return { changed: false, mark: 0 };
  const cell = getCell(board, col, row);
  if (!cell || cell.revealed) return { changed: false, mark: cell ? cell.mark : 0 };
  const next = (cell.mark + 1) % 4;
  cell.mark = next;
  return { changed: true, mark: next, cell: cell };
}

function countMineMarks(board) {
  let count = 0;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (board.cells[r][c].mark === MARK.MINE) count++;
    }
  }
  return count;
}

function remainingMines(board) {
  return Math.max(0, board.mineCount - countMineMarks(board));
}

/**
 * 翻开格子。返回：
 * { result: 'noop' | 'mine' | 'revealed', changed: [{col,row}], win, first }
 */
function revealCell(board, col, row) {
  const cell = getCell(board, col, row);
  if (!cell || cell.revealed || board.gameOver) {
    return { result: 'noop', changed: [], win: false };
  }

  if (!board.minesPlaced) {
    placeMines(board, col, row);
  }
  board.firstReveal = { col: col, row: row };

  let clearedMark = false;
  if (cell.mark !== MARK.HIDDEN) {
    cell.mark = MARK.HIDDEN;
    clearedMark = true;
  }

  if (cell.isMine) {
    cell.revealed = true;
    board.exploded = { col: col, row: row };
    board.gameOver = 'lose';
    return {
      result: 'mine',
      changed: [{ col: col, row: row }],
      win: false,
      clearedMark: clearedMark
    };
  }

  const changed = [];
  const queue = [{ col: col, row: row }];
  const visited = {};
  visited[col + ',' + row] = true;

  while (queue.length) {
    const current = queue.shift();
    const currentCell = board.cells[current.row][current.col];
    if (currentCell.revealed || currentCell.isMine) continue;

    currentCell.revealed = true;
    board.revealedCount++;
    changed.push({ col: current.col, row: current.row });

    if (currentCell.adjacentMines === 0) {
      forEachNeighbor(board, current.col, current.row, function (nc, nr, neighbor) {
        const key = nc + ',' + nr;
        if (visited[key]) return;
        if (neighbor.revealed || neighbor.isMine) return;
        if (neighbor.mark !== MARK.HIDDEN) return; // 不吞掉玩家标记
        visited[key] = true;
        queue.push({ col: nc, row: nr });
      });
    }
  }

  const safeCells = board.cols * board.rows - board.mineCount;
  const win = board.revealedCount >= safeCells;
  if (win) board.gameOver = 'win';

  return {
    result: 'revealed',
    changed: changed,
    win: win,
    clearedMark: clearedMark,
    first: changed.length > 0 && board.revealedCount === changed.length
  };
}

/**
 * 失败后展示全部地雷（只影响渲染，不修改 revealedCount）。
 */
function flagAllMines(board) {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (board.cells[r][c].isMine) board.cells[r][c].mark = MARK.MINE;
    }
  }
}

function getMineCells(board) {
  const out = [];
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (board.cells[r][c].isMine) out.push({ col: c, row: r });
    }
  }
  return out;
}

function getWrongMarks(board) {
  const out = [];
  if (board.gameOver !== 'lose') return out;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const cell = board.cells[r][c];
      if (!cell.isMine && cell.mark === MARK.MINE) out.push({ col: c, row: r });
    }
  }
  return out;
}

module.exports = {
  MARK: MARK,
  createBoard: createBoard,
  placeMines: placeMines,
  revealCell: revealCell,
  toggleMark: toggleMark,
  countMineMarks: countMineMarks,
  remainingMines: remainingMines,
  getMineCells: getMineCells,
  getWrongMarks: getWrongMarks,
  flagAllMines: flagAllMines,
  getCell: getCell,
  inBounds: inBounds,
  forEachNeighbor: forEachNeighbor
};

};

// ---- js/launch.js ----
__defs["js/launch.js"] = function (module, exports, require) {
'use strict';

/**
 * 启动参数解析：容错读取 scene / query，解析分享码场景。
 * 任何异常都不应中断启动。
 */

function isObject(value) {
  return !!value && typeof value === 'object';
}

function parseSceneValue(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === 'c') return { code: 'c', type: 'classic', level: 0 };
  const match = /^p([1-9])$/.exec(text);
  if (match) {
    return { code: text, type: 'level', level: Number(match[1]) };
  }
  return null;
}

function buildHint(sceneInfo) {
  if (!sceneInfo) return '';
  if (sceneInfo.type === 'classic') return '好友正在山林里扫雷';
  if (sceneInfo.type === 'level') return '好友通过了第 ' + sceneInfo.level + ' 关';
  return '';
}

/**
 * @param {object} launchOptions wx.getLaunchOptionsSync() 的返回值
 * @returns {{hint:string, scene:object|null, previewMode:boolean, query:object, from:string}}
 */
function parseLaunch(launchOptions) {
  const result = {
    hint: '',
    scene: null,
    previewMode: false,
    query: {},
    from: ''
  };
  try {
    const options = isObject(launchOptions) ? launchOptions : {};
    const query = isObject(options.query) ? options.query : {};
    result.query = query;
    result.from = typeof query.from === 'string' ? query.from : '';

    // 朋友圈单页模式（PRD 约定的场景值 1155）
    if (Number(options.scene) === 1155) {
      result.previewMode = true;
    }

    // 小程序码的 scene 会以 query.scene 传递，部分调试场景会直接放在 query 中
    let rawScene = query.scene;
    if (rawScene === undefined && typeof query.scene_id === 'string') rawScene = query.scene_id;
    result.scene = parseSceneValue(rawScene);
    result.hint = buildHint(result.scene);
  } catch (err) {
    // 忽略解析异常
  }
  return result;
}

module.exports = {
  parseLaunch: parseLaunch,
  parseSceneValue: parseSceneValue,
  buildHint: buildHint
};

};

// ---- js/audio.js ----
__defs["js/audio.js"] = function (module, exports, require) {
'use strict';

/**
 * 音效管理：
 * - 每种音效只创建一个 InnerAudioContext 实例并复用。
 * - 首次播放尝试在 touchstart 手势中解锁。
 * - 支持总开关、静音、音频中断恢复。
 */

const SOUNDS = {
  reveal: { src: 'audio/reveal.wav', volume: 0.55 },
  mark: { src: 'audio/mark.wav', volume: 0.5 },
  unmark: { src: 'audio/unmark.wav', volume: 0.42 },
  boom: { src: 'audio/boom.wav', volume: 0.72 },
  win: { src: 'audio/win.wav', volume: 0.62 },
  tick: { src: 'audio/tick.wav', volume: 0.32 },
  unlock: { src: 'audio/unlock.wav', volume: 0.001 }
};

const SOUND_NAMES = Object.keys(SOUNDS);

function getWx() {
  return typeof wx !== 'undefined' ? wx : null;
}

class AudioManager {
  constructor(settings, options) {
    this.options = options || {};
    this.assetPrefix = this.options.assetPrefix || '';
    this.enabled = !settings || settings.sound !== false;
    this.unlocked = false;
    this.suspended = false;
    this.contexts = {};
    this.broken = false;
    this.init();
    this.bindInterruption();
  }

  init() {
    const w = getWx();
    if (!w || typeof w.createInnerAudioContext !== 'function') {
      this.broken = true;
      return;
    }
    for (let i = 0; i < SOUND_NAMES.length; i++) {
      const name = SOUND_NAMES[i];
      const config = SOUNDS[name];
      try {
        const ctx = w.createInnerAudioContext({ useWebAudioImplement: true });
        ctx.src = this.assetPrefix + config.src;
        ctx.volume = config.volume;
        ctx.loop = false;
        if ('obeyMuteSwitch' in ctx) ctx.obeyMuteSwitch = true;
        this.contexts[name] = ctx;
      } catch (err) {
        // 单个音效创建失败不影响其他音效
      }
    }
    try {
      if (w.setInnerAudioOption) {
        w.setInnerAudioOption({ obeyMuteSwitch: true, mixWithOther: true, success: function () {} });
      }
    } catch (err) { /* ignore */ }
  }

  bindInterruption() {
    const w = getWx();
    if (!w) return;
    const self = this;
    try {
      if (w.onAudioInterruptionBegin) {
        w.onAudioInterruptionBegin(function () {
          self.suspended = true;
        });
      }
      if (w.onAudioInterruptionEnd) {
        w.onAudioInterruptionEnd(function () {
          self.suspended = false;
          self.reviveContexts();
        });
      }
    } catch (err) { /* ignore */ }
  }

  /** 中断结束后确认实例仍可播放，必要时重建。 */
  reviveContexts() {
    if (this.broken) {
      this.broken = false;
      this.init();
      return;
    }
    for (let i = 0; i < SOUND_NAMES.length; i++) {
      const name = SOUND_NAMES[i];
      const ctx = this.contexts[name];
      if (!ctx) continue;
      try {
        if (ctx.duration === 0 || ctx.src === '') {
          ctx.src = this.assetPrefix + SOUNDS[name].src;
        }
      } catch (err) { /* ignore */ }
    }
  }

  /** 必须在用户 touchstart 等手势回调中调用。 */
  unlock() {
    if (this.unlocked || this.broken) return;
    this.unlocked = true;
    const ctx = this.contexts.unlock;
    if (!ctx) return;
    try {
      ctx.volume = 0.001;
      ctx.play();
    } catch (err) { /* ignore */ }
  }

  play(name) {
    if (!this.enabled || this.suspended) return;
    const ctx = this.contexts[name];
    if (!ctx) return;
    try {
      ctx.stop();
      if (typeof ctx.seek === 'function') ctx.seek(0);
      ctx.play();
    } catch (err) { /* ignore */ }
  }

  setEnabled(value) {
    this.enabled = !!value;
    if (!this.enabled) this.stopAll();
  }

  stopAll() {
    for (let i = 0; i < SOUND_NAMES.length; i++) {
      const ctx = this.contexts[SOUND_NAMES[i]];
      if (!ctx) continue;
      try { ctx.stop(); } catch (err) { /* ignore */ }
    }
  }

  suspend() {
    this.suspended = true;
    this.stopAll();
  }

  resume() {
    this.suspended = false;
  }
}

module.exports = AudioManager;
module.exports.SOUNDS = SOUNDS;

};

// ---- js/share.js ----
__defs["js/share.js"] = function (module, exports, require) {
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

};

// ---- js/renderer.js ----
__defs["js/renderer.js"] = function (module, exports, require) {
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

};

// ---- js/input.js ----
__defs["js/input.js"] = function (module, exports, require) {
'use strict';

/**
 * 触摸输入：
 * - 短按 <300ms 且手指未移出格子 → 翻开
 * - 长按 >=300ms → 标记循环（由 main 处理具体逻辑）
 * - 单指拖动（仅在棋盘已放大时）→ 平移棋盘
 * - 双指捏合 → 缩放棋盘；双指移动 → 同时平移
 * - 移出格子（未放大时）/ 取消 → 丢弃本次判定
 * - 按钮、棋盘、缩放控件分开处理
 */

const TIMING = require('./config.js').TIMING;
const PAN_THRESHOLD = 7;

function pointOf(touch) {
  if (!touch) return null;
  return {
    x: typeof touch.clientX === 'number' ? touch.clientX : (typeof touch.x === 'number' ? touch.x : touch.pageX),
    y: typeof touch.clientY === 'number' ? touch.clientY : (typeof touch.y === 'number' ? touch.y : touch.pageY)
  };
}

function inside(rect, x, y, padding) {
  if (!rect) return false;
  const p = padding || 0;
  return x >= rect.x - p && x <= rect.x + rect.w + p && y >= rect.y - p && y <= rect.y + rect.h + p;
}

function twoTouches(event) {
  const touches = event && event.touches;
  if (!touches || touches.length < 2) return null;
  const a = pointOf(touches[0]);
  const b = pointOf(touches[1]);
  if (!a || !b) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return {
    a: a,
    b: b,
    midX: (a.x + b.x) / 2,
    midY: (a.y + b.y) / 2,
    distance: Math.max(1, Math.sqrt(dx * dx + dy * dy))
  };
}

class Input {
  constructor(options) {
    this.options = options || {};
    this.gesture = null;
    this.button = null;
    this.timer = null;
    this.pinch = null;
    this.panning = null;
    this.ignoreUntilEnd = false;
    if (this.options.bind !== false) this.bind();
  }

  bind() {
    if (typeof wx === 'undefined') return;
    const self = this;
    if (wx.onTouchStart) {
      wx.onTouchStart(function (event) { self.onStart(event); });
    }
    if (wx.onTouchMove) {
      wx.onTouchMove(function (event) { self.onMove(event); });
    }
    if (wx.onTouchEnd) {
      wx.onTouchEnd(function (event) { self.onEnd(event); });
    }
    if (wx.onTouchCancel) {
      wx.onTouchCancel(function () { self.cancel(); });
    }
  }

  touchCount(event) {
    if (event && event.touches && typeof event.touches.length === 'number') return event.touches.length;
    return 1;
  }

  remainingTouches(event) {
    if (event && event.touches && typeof event.touches.length === 'number') return event.touches.length;
    return 0;
  }

  canPan() {
    return !!(this.options.canPan && this.options.canPan());
  }

  startPinch(event) {
    const two = twoTouches(event);
    if (!two) return;
    this.clearTimer();
    if (this.gesture) {
      this.gesture = null;
      if (this.options.onCellRelease) this.options.onCellRelease();
    }
    if (this.button) {
      const id = this.button.id;
      this.button = null;
      if (this.options.onButtonCancel) this.options.onButtonCancel(id);
    }
    if (this.panning) {
      this.panning = null;
      if (this.options.onPanEnd) this.options.onPanEnd();
    }
    this.ignoreUntilEnd = true;
    this.pinch = {
      distance: two.distance,
      midX: two.midX,
      midY: two.midY
    };
    if (this.options.onPinchStart) {
      this.options.onPinchStart({ midX: two.midX, midY: two.midY, distance: two.distance });
    }
  }

  onStart(event) {
    const count = this.touchCount(event);
    if (count > 1) {
      this.startPinch(event);
      return;
    }
    if (this.ignoreUntilEnd || this.pinch) return;

    const touch = event && event.touches ? event.touches[0] : null;
    const point = pointOf(touch) || pointOf(event && event.changedTouches && event.changedTouches[0]);
    if (!point) return;

    if (this.options.onInteractionStart) this.options.onInteractionStart();

    const hit = this.options.hitTest ? this.options.hitTest(point.x, point.y) : null;
    if (hit) {
      this.button = { id: hit.id, rect: hit, x: point.x, y: point.y };
      if (this.options.onButtonPress) this.options.onButtonPress(hit.id);
      return;
    }

    const cell = this.options.cellAt ? this.options.cellAt(point.x, point.y) : null;
    if (!cell) return;

    this.gesture = {
      col: cell.col,
      row: cell.row,
      rect: cell.rect,
      startX: point.x,
      startY: point.y,
      startTime: Date.now(),
      longFired: false,
      cancelled: false
    };
    if (this.options.onCellPress) this.options.onCellPress(cell);

    const self = this;
    this.clearTimer();
    this.timer = setTimeout(function () { self.fireLongPress(); }, TIMING.longPress);
  }

  onMove(event) {
    if (this.pinch) {
      const two = twoTouches(event);
      if (!two) return;
      const scale = two.distance / this.pinch.distance;
      if (this.options.onPinchMove) {
        this.options.onPinchMove({
          scale: scale,
          midX: two.midX,
          midY: two.midY,
          dx: two.midX - this.pinch.midX,
          dy: two.midY - this.pinch.midY
        });
      }
      return;
    }
    if (this.ignoreUntilEnd) return;
    if (this.touchCount(event) > 1) {
      this.startPinch(event);
      return;
    }

    const touch = event && event.touches ? event.touches[0] : null;
    const point = pointOf(touch);
    if (!point) return;

    if (this.button) {
      if (!inside(this.button.rect, point.x, point.y, 12)) {
        const id = this.button.id;
        this.button = null;
        if (this.options.onButtonCancel) this.options.onButtonCancel(id);
      }
      return;
    }

    if (this.panning) {
      const dx = point.x - this.panning.lastX;
      const dy = point.y - this.panning.lastY;
      this.panning.lastX = point.x;
      this.panning.lastY = point.y;
      if (this.options.onPanMove) this.options.onPanMove(dx, dy);
      return;
    }

    if (!this.gesture || this.gesture.cancelled) return;
    const gesture = this.gesture;
    const dx = point.x - gesture.startX;
    const dy = point.y - gesture.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > PAN_THRESHOLD && this.canPan()) {
      this.clearTimer();
      gesture.cancelled = true;
      this.panning = { lastX: point.x, lastY: point.y };
      if (this.options.onCellRelease) this.options.onCellRelease();
      if (this.options.onPanStart) this.options.onPanStart({ x: point.x, y: point.y });
      if (this.options.onPanMove) this.options.onPanMove(dx, dy);
      return;
    }

    if (!inside(gesture.rect, point.x, point.y, 1)) {
      gesture.cancelled = true;
      this.clearTimer();
      if (this.options.onCellCancel) this.options.onCellCancel({ col: gesture.col, row: gesture.row });
      if (this.options.onCellRelease) this.options.onCellRelease();
    }
  }

  onEnd(event) {
    const remaining = this.remainingTouches(event);

    if (this.pinch) {
      this.pinch = null;
      if (this.options.onPinchEnd) this.options.onPinchEnd();
      if (remaining === 0) this.ignoreUntilEnd = false;
      return;
    }
    if (this.ignoreUntilEnd) {
      if (remaining === 0) this.ignoreUntilEnd = false;
      return;
    }

    if (this.panning) {
      this.panning = null;
      if (this.options.onPanEnd) this.options.onPanEnd();
      if (this.gesture) {
        this.gesture = null;
        if (this.options.onCellRelease) this.options.onCellRelease();
      }
      this.clearTimer();
      return;
    }

    const touch = event && event.changedTouches ? event.changedTouches[0] : null;
    const point = pointOf(touch) || pointOf(event && event.touches && event.touches[0]);

    if (this.button) {
      const button = this.button;
      this.button = null;
      if (this.options.onButtonRelease) this.options.onButtonRelease(button.id);
      if (point && inside(button.rect, point.x, point.y, 12)) {
        if (this.options.onButtonTap) this.options.onButtonTap(button.id);
      } else if (this.options.onButtonCancel) {
        this.options.onButtonCancel(button.id);
      }
      return;
    }

    if (!this.gesture) return;
    const gesture = this.gesture;
    this.gesture = null;
    this.clearTimer();
    if (this.options.onCellRelease) this.options.onCellRelease();

    if (gesture.cancelled || gesture.longFired) return;
    const elapsed = Date.now() - gesture.startTime;
    if (elapsed >= TIMING.longPress) {
      // 定时器可能因主线程繁忙延迟，这里兜底按长按处理
      this.fireLongPressOn(gesture);
      return;
    }
    if (point && inside(gesture.rect, point.x, point.y, 1)) {
      if (this.options.onCellTap) this.options.onCellTap({ col: gesture.col, row: gesture.row });
    }
  }

  fireLongPress() {
    if (!this.gesture || this.gesture.cancelled || this.gesture.longFired) return;
    const gesture = this.gesture;
    gesture.longFired = true;
    this.clearTimer();
    this.fireLongPressOn(gesture);
  }

  fireLongPressOn(gesture) {
    if (this.options.onCellRelease) this.options.onCellRelease();
    if (this.options.onLongPress) {
      this.options.onLongPress({ col: gesture.col, row: gesture.row });
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  cancel() {
    this.clearTimer();
    if (this.pinch) {
      this.pinch = null;
      if (this.options.onPinchEnd) this.options.onPinchEnd();
    }
    if (this.panning) {
      this.panning = null;
      if (this.options.onPanEnd) this.options.onPanEnd();
    }
    this.ignoreUntilEnd = false;
    if (this.gesture) {
      this.gesture = null;
      if (this.options.onCellRelease) this.options.onCellRelease();
    }
    if (this.button) {
      const id = this.button.id;
      this.button = null;
      if (this.options.onButtonCancel) this.options.onButtonCancel(id);
    }
  }

  reset() {
    this.multi = false;
    this.ignoreUntilEnd = false;
    this.pinch = null;
    this.panning = null;
    this.cancel();
  }
}

module.exports = Input;

};

// ---- js/main.js ----
__defs["js/main.js"] = function (module, exports, require) {
'use strict';

/**
 * 游戏主状态机与页面流转。
 */

const config = require('./config.js');
const storage = require('./storage.js');
const core = require('./game-core.js');
const levels = require('./levels.js');
const launch = require('./launch.js');
const Renderer = require('./renderer.js');
const Input = require('./input.js');
const AudioManager = require('./audio.js');
const Share = require('./share.js');

const STATE = {
  MENU: 'menu',
  LEVELS: 'levels',
  CLASSIC: 'classic',
  LEVEL: 'level',
  POSTER: 'poster'
};

const OVERLAY = {
  SETTINGS: 'settings',
  CLASSIC_END: 'classicEnd',
  LEVEL_FAIL: 'levelFail',
  LEVEL_SUCCESS: 'levelSuccess'
};

const DIFFICULTIES = config.DIFFICULTIES;
const DIFFICULTY_LABEL = config.DIFFICULTY_LABEL;
const TIMING = config.TIMING;

function randomDifficultyKey() {
  const order = config.DIFFICULTY_ORDER;
  return order[Math.floor(Math.random() * order.length)];
}

function pad2(value) {
  return value < 10 ? '0' + value : String(value);
}

class Game {
  constructor(options) {
    this.options = options || {};
    this.isMiniProgram = !!this.options.miniProgram;
    this.canvas = this.options.canvas || wx.createCanvas();
    this.renderer = new Renderer(this.canvas, {
      createCanvas: this.options.createOffscreenCanvas
    });
    this.launch = launch.parseLaunch(this.readLaunchOptions());
    this.previewMode = !!this.launch.previewMode;
    if (this.previewMode) storage.setVolatile(true);

    this.settings = storage.loadSettings();
    this.difficulty = storage.loadDifficulty();
    this.best = storage.loadClassicBest();
    this.progress = storage.loadProgress();

    this.audio = new AudioManager(this.settings, {
      assetPrefix: this.options.assetPrefix || ''
    });
    this.share = new Share({
      createCanvas: this.options.createOffscreenCanvas
    });

    this.state = STATE.MENU;
    this.overlay = null;
    this.game = null;
    this.lastClassic = null;
    this.lastLevelWin = null;
    this.toast = null;
    this.toastUntil = 0;
    this.appHidden = false;
    this.lastFrame = Date.now();
    this.lastPulseAt = 0;
    this.displayedSecond = -1;
    this.lastTickSecond = -1;
    this.pendingTimer = null;
    this.pendingResultOverlay = null;
    this.posterView = null;
    this.posterReturn = null;
    this.generatingPoster = false;
    this.shareCardImage = null;
    this.pinchState = null;
    this.zoomHintShown = false;

    this.setupInput();
    this.bindLifecycle();
    this.setupShare();
    this.openMenu();
    this.initializePreview();
    this.startLoop();
    if (this.launch.hint) this.showToast(this.launch.hint);
    this.prepareShareCard();
  }

  readLaunchOptions() {
    try {
      if (wx.getLaunchOptionsSync) return wx.getLaunchOptionsSync() || {};
    } catch (err) { /* ignore */ }
    return {};
  }

  // ---------------------------------------------------------------------------
  // 生命周期
  // ---------------------------------------------------------------------------

  bindLifecycle() {
    const self = this;
    try {
      if (wx.onShow) {
        wx.onShow(function (res) {
          self.appHidden = false;
          self.lastFrame = Date.now();
          if (self.audio) self.audio.resume();
          const opts = launch.parseLaunch(res || {});
          if (opts.previewMode) {
            self.previewMode = true;
            storage.setVolatile(true);
          }
          if (opts.hint) self.showToast(opts.hint);
          if (self.state === STATE.MENU) self.redrawBase();
          self.refresh();
        });
      }
      if (wx.onHide) {
        wx.onHide(function () {
          self.appHidden = true;
          if (self.audio) self.audio.suspend();
          if (self.input) self.input.reset();
          self.lastFrame = Date.now();
        });
      }
      if (wx.onWindowResize) {
        wx.onWindowResize(function () {
          self.renderer.resize();
          self.lastFrame = Date.now();
          if (self.game) {
            self.renderer.setBoard(self.game.board, self.game.kind);
          }
          self.redrawBase();
          self.refresh();
        });
      }
    } catch (err) { /* ignore */ }
  }

  setupShare() {
    const self = this;
    try {
      if (wx.showShareMenu) {
        wx.showShareMenu({ withShareTicket: true });
      }
    } catch (err) { /* ignore */ }
    if (this.isMiniProgram) {
      // 小程序 shell 由页面 onShareAppMessage 调用 getSharePayload()
      return;
    }
    try {
      if (wx.onShareAppMessage) {
        wx.onShareAppMessage(function () {
          const payload = {
            title: config.CARD_SHARE_TEXT.title,
            query: 'from=card'
          };
          if (self.shareCardImage) payload.imageUrl = self.shareCardImage;
          return payload;
        });
      }
    } catch (err) { /* ignore */ }
  }

  getSharePayload() {
    const payload = {
      title: config.CARD_SHARE_TEXT.title
    };
    if (this.shareCardImage) payload.imageUrl = this.shareCardImage;
    if (this.isMiniProgram) {
      payload.path = 'pages/index/index?from=card';
    } else {
      payload.query = 'from=card';
    }
    return payload;
  }

  prepareShareCard() {
    const self = this;
    this.share.createCardImage().then(function (path) {
      if (path) self.shareCardImage = path;
    }).catch(function () { /* 忽略卡片图失败 */ });
  }

  setupInput() {
    const self = this;
    this.input = new Input({
      bind: !this.isMiniProgram,
      hitTest: function (x, y) { return self.renderer.getHit(x, y); },
      cellAt: function (x, y) { return self.renderer.getCellAt(x, y); },
      onInteractionStart: function () { if (self.audio) self.audio.unlock(); },
      onButtonPress: function (id) { self.pressButton(id); },
      onButtonRelease: function (id) { self.releaseButton(id); },
      onButtonCancel: function (id) { self.releaseButton(id); },
      onButtonTap: function (id) { self.handleTap(id); },
      onCellPress: function (cell) {
        self.renderer.setPressedCell(cell);
        self.refresh();
      },
      onCellRelease: function () {
        self.renderer.setPressedCell(null);
        self.refresh();
      },
      onCellTap: function (cell) { self.handleCellTap(cell); },
      onLongPress: function (cell) { self.handleLongPress(cell); },
      canPan: function () { return self.renderer.canPan(); },
      onPanMove: function (dx, dy) { self.handlePanMove(dx, dy); },
      onPinchStart: function (info) { self.handlePinchStart(info); },
      onPinchMove: function (info) { self.handlePinchMove(info); },
      onPinchEnd: function () { self.pinchState = null; }
    });
  }

  startLoop() {
    const self = this;
    let raf = this.options.requestAnimationFrame;
    if (!raf && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame;
    if (!raf) raf = function (fn) { return setTimeout(fn, 16); };
    const frame = function () { self.frame(); raf(frame); };
    raf(frame);
  }

  frame() {
    const now = Date.now();
    const dt = Math.min(120, Math.max(0, now - this.lastFrame));
    this.lastFrame = now;

    const game = this.game;
    const inPlay = game && (this.state === STATE.CLASSIC || this.state === STATE.LEVEL);

    if (inPlay && game.running && !game.finished && !this.appHidden && !this.overlay) {
      game.elapsedMs += dt;
      if (game.kind === 'level') {
        const total = game.level.time * 1000;
        if (game.elapsedMs >= total) {
          game.elapsedMs = total;
          this.finishLevel('timeout');
        }
      }
    }

    if (inPlay) {
      const meta = this.buildMeta();
      if (this.displayedSecond !== meta.displaySecond) {
        this.displayedSecond = meta.displaySecond;
        this.renderer.drawStats(meta);
        this.refresh();
        if (game.kind === 'level' && game.running && !game.finished) {
          if (meta.remainingSeconds <= 10 && meta.remainingSeconds > 0 && meta.remainingSeconds !== this.lastTickSecond) {
            this.lastTickSecond = meta.remainingSeconds;
            if (this.settings.sound) this.audio.play('tick');
          }
        }
      }

      if (game.kind === 'level' && game.running && !game.finished && !this.overlay) {
        const remaining = game.level.time * 1000 - game.elapsedMs;
        if (remaining <= 10000 && remaining > 0 && now - this.lastPulseAt > 40) {
          this.lastPulseAt = now;
          this.renderer.drawStats(meta);
          this.refresh();
        }
      }

      if (this.renderer.updateAnimations(now)) {
        this.refresh();
      }
    }

    if (this.toast && now >= this.toastUntil) {
      this.toast = null;
      this.refresh();
    }
  }

  // ---------------------------------------------------------------------------
  // 页面数据
  // ---------------------------------------------------------------------------

  buildMenuData() {
    const completed = levels.isCompleted(this.progress);
    const unlocked = Math.min(this.progress.unlocked, levels.LEVELS.length);
    const cleared = Object.keys(this.progress.bestTimes).length;

    const bestParts = [];
    config.DIFFICULTY_ORDER.forEach(function (key) {
      const value = this.best[key];
      if (value) bestParts.push(DIFFICULTY_LABEL[key] + ' ' + levels.formatSeconds(value));
    }, this);

    return {
      difficultyLabel: DIFFICULTY_LABEL[this.difficulty],
      progressLabel: completed ? '九关倒计时 · 已通关' : '九关倒计时 · 第 ' + unlocked + ' 关',
      progressNote: completed ? '九关尽览 · 山高水长' : '已通关 ' + cleared + ' / 9',
      bestLabel: bestParts.length ? '本地最佳 · ' + bestParts.join('  ') : '尚无纪录 · 从第一局开始',
      previewMode: this.previewMode
    };
  }

  buildLevelsData() {
    const cleared = Object.keys(this.progress.bestTimes).length;
    return {
      progress: this.progress,
      progressLabel: levels.isCompleted(this.progress) ? '已通关' : '第 ' + Math.min(this.progress.unlocked, 9) + ' 关',
      pathLabel: cleared > 0 ? '已点亮 ' + cleared + ' / 9 盏灯' : '山径尚在雾中'
    };
  }

  buildMeta() {
    const game = this.game;
    const isLevel = game.kind === 'level';
    let remainingSeconds = 0;
    let displaySecond = 0;
    if (isLevel) {
      const total = game.level.time * 1000;
      const remainingMs = Math.max(0, total - Math.min(game.elapsedMs, total));
      remainingSeconds = Math.ceil(remainingMs / 1000);
      displaySecond = remainingSeconds;
    } else {
      displaySecond = Math.floor(game.elapsedMs / 1000);
    }

    const best = isLevel
      ? (this.progress.bestTimes[game.level.id] || null)
      : (this.best[game.difficultyKey] || null);

    return {
      kind: game.kind,
      difficultyName: DIFFICULTY_LABEL[game.difficultyKey] || '',
      randomMode: !!game.randomMode,
      headerLabel: isLevel ? '第 ' + game.level.id + ' 关' : '经典 · ' + DIFFICULTY_LABEL[game.difficultyKey],
      headerSub: isLevel
        ? 'LEVEL ' + pad2(game.level.id) + ' · ' + game.level.cols + ' × ' + game.level.rows
        : 'CLASSIC · ' + (game.randomMode ? 'RANDOM' : game.difficultyKey.toUpperCase()),
      elapsedSeconds: Math.floor(game.elapsedMs / 1000),
      remainingSeconds: remainingSeconds,
      displaySecond: displaySecond,
      bestSeconds: best,
      mineMarks: core.countMineMarks(game.board),
      totalMines: game.board.mineCount,
      finished: !!game.finished
    };
  }

  // ---------------------------------------------------------------------------
  // 导航
  // ---------------------------------------------------------------------------

  openMenu(renderNow) {
    this.clearPending();
    this.pendingResultOverlay = null;
    this.state = STATE.MENU;
    this.overlay = null;
    this.game = null;
    this.posterView = null;
    this.posterReturn = null;
    this.renderer.pressedId = null;
    this.displayedSecond = -1;
    this.renderer.clearOverlayHits();
    this.renderer.renderMenu(this.buildMenuData());
    if (renderNow !== false) this.refresh();
  }

  openLevels() {
    this.clearPending();
    this.pendingResultOverlay = null;
    this.state = STATE.LEVELS;
    this.overlay = null;
    this.game = null;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.renderer.renderLevels(this.buildLevelsData());
    this.refresh();
  }

  redrawBase(keepPressed) {
    if (!keepPressed) this.renderer.pressedId = null;
    if (this.state === STATE.MENU) {
      this.renderer.renderMenu(this.buildMenuData());
    } else if (this.state === STATE.LEVELS) {
      this.renderer.renderLevels(this.buildLevelsData());
    } else if (this.state === STATE.CLASSIC || this.state === STATE.LEVEL) {
      if (this.game) this.renderer.renderGameFull(this.buildMeta());
    } else if (this.state === STATE.POSTER) {
      if (this.posterView) this.renderer.renderPosterScreen(this.posterView);
    }
  }

  refresh() {
    this.renderer.present();
    if (this.overlay) this.drawOverlay();
    if (this.toast && Date.now() < this.toastUntil) {
      this.renderer.drawToast(this.renderer.ctx, this.toast);
    }
  }

  drawOverlay() {
    this.renderer.beginOverlayHits();
    const ctx = this.renderer.ctx;
    if (this.overlay === OVERLAY.SETTINGS) {
      this.renderer.drawSettings(ctx, {
        sound: this.settings.sound,
        vibrate: this.settings.vibrate,
        difficulty: this.difficulty
      });
    } else if (this.overlay === OVERLAY.CLASSIC_END && this.lastClassic) {
      this.renderer.drawClassicEnd(ctx, this.lastClassic);
    } else if (this.overlay === OVERLAY.LEVEL_FAIL && this.levelFailData) {
      this.renderer.drawLevelFail(ctx, this.levelFailData);
    } else if (this.overlay === OVERLAY.LEVEL_SUCCESS && this.lastLevelWin) {
      this.renderer.drawLevelSuccess(ctx, this.lastLevelWin);
    }
  }

  showToast(value, duration) {
    this.toast = value;
    this.toastUntil = Date.now() + (duration || TIMING.toastDuration);
    this.refresh();
  }

  // ---------------------------------------------------------------------------
  // 对局开始
  // ---------------------------------------------------------------------------

  startClassic() {
    this.clearPending();
    this.pendingResultOverlay = null;
    const key = this.difficulty === 'random' ? randomDifficultyKey() : this.difficulty;
    const difficulty = DIFFICULTIES[key];
    const board = core.createBoard(difficulty.cols, difficulty.rows, difficulty.mines);
    this.game = {
      kind: 'classic',
      difficultyKey: key,
      randomMode: this.difficulty === 'random',
      board: board,
      elapsedMs: 0,
      started: false,
      running: false,
      finished: false
    };
    this.state = STATE.CLASSIC;
    this.overlay = null;
    this.pinchState = null;
    this.zoomHintShown = false;
    this.posterView = null;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.renderer.setBoard(board, 'classic');
    this.renderer.renderGameFull(this.buildMeta());
    this.displayedSecond = 0;
    this.lastTickSecond = -1;
    this.refresh();
  }

  startLevel(levelId) {
    const level = levels.getLevel(levelId);
    if (!level) return;
    if (this.progress.unlocked < levelId) {
      this.showToast('先通过第 ' + (levelId - 1) + ' 关，才能点亮这里');
      return;
    }
    this.clearPending();
    this.pendingResultOverlay = null;
    const board = core.createBoard(level.cols, level.rows, level.mines);
    this.game = {
      kind: 'level',
      level: level,
      difficultyKey: '',
      randomMode: false,
      board: board,
      elapsedMs: 0,
      started: true,
      running: true,
      finished: false
    };
    this.state = STATE.LEVEL;
    this.overlay = null;
    this.pinchState = null;
    this.zoomHintShown = false;
    this.posterView = null;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.renderer.setBoard(board, 'level');
    this.renderer.renderGameFull(this.buildMeta());
    this.displayedSecond = level.time;
    this.lastTickSecond = -1;
    this.refresh();
  }

  // ---------------------------------------------------------------------------
  // 棋盘交互
  // ---------------------------------------------------------------------------

  handleCellTap(cell) {
    if (!this.game) return;
    if (this.game.finished) {
      this.reopenResult();
      return;
    }
    if (this.overlay) return;
    const game = this.game;
    const result = core.revealCell(game.board, cell.col, cell.row);
    if (result.result === 'noop') return;

    if (game.kind === 'classic' && !game.started) {
      game.started = true;
      game.running = true;
    }

    this.renderer.addRevealAnimation(result.changed, Date.now());
    this.renderer.updateAnimations(Date.now());

    if (result.result === 'mine') {
      this.refreshResultStats();
      this.finishClassic('lose');
      return;
    }

    this.audio.play('reveal');

    if (result.win) {
      this.refreshResultStats();
      if (game.kind === 'classic') {
        this.finishClassic('win');
      } else {
        this.finishLevel('win');
      }
      return;
    }

    this.refreshResultStats();
    this.refresh();
  }

  handleLongPress(cell) {
    if (!this.game || this.overlay || this.game.finished) {
      this.renderer.setPressedCell(null);
      return;
    }
    const result = core.toggleMark(this.game.board, cell.col, cell.row);
    this.renderer.setPressedCell(null);
    if (!result.changed) {
      this.refresh();
      return;
    }

    if (this.settings.vibrate && wx.vibrateShort) {
      try { wx.vibrateShort({ type: 'light' }); } catch (err) { /* ignore */ }
    }
    this.audio.play(result.mark === 0 ? 'unmark' : 'mark');
    this.renderer.drawCell(cell.col, cell.row, null);
    this.refreshResultStats();
    this.refresh();
  }

  refreshResultStats() {
    if (!this.game) return;
    this.renderer.drawStats(this.buildMeta());
  }

  // ---------------------------------------------------------------------------
  // 棋盘缩放 / 平移
  // ---------------------------------------------------------------------------

  afterZoom() {
    if (!this.game) return;
    this.renderer.redrawBoardView();
    if (this.renderer.zoom > 1 && !this.zoomHintShown) {
      this.zoomHintShown = true;
      this.showToast('拖动棋盘查看 · 双指缩放', 2600);
      return;
    }
    this.refresh();
  }

  zoomIn() {
    if (!this.game) return;
    this.renderer.zoomBy(1.25);
    this.afterZoom();
  }

  zoomOut() {
    if (!this.game) return;
    this.renderer.zoomBy(1 / 1.25);
    this.afterZoom();
  }

  zoomReset() {
    if (!this.game) return;
    this.renderer.resetZoom();
    this.renderer.redrawBoardView();
    this.refresh();
  }

  handlePanMove(dx, dy) {
    if (!this.game) return;
    if (!this.renderer.canPan()) return;
    if (this.renderer.panBy(dx, dy)) {
      this.renderer.redrawBoardView();
      this.refresh();
    }
  }

  handlePinchStart(info) {
    if (!this.game || !this.renderer.baseMetrics) return;
    const point = this.renderer.screenToBoardPoint(info.midX, info.midY);
    this.pinchState = {
      startZoom: this.renderer.zoom,
      boardX: point.x,
      boardY: point.y
    };
  }

  handlePinchMove(info) {
    if (!this.game || !this.pinchState) return;
    const zoom = this.pinchState.startZoom * info.scale;
    this.renderer.zoomToBoardPoint(
      zoom,
      this.pinchState.boardX,
      this.pinchState.boardY,
      info.midX,
      info.midY
    );
    this.renderer.redrawBoardView();
    this.refresh();
    if (this.renderer.zoom > 1 && !this.zoomHintShown) {
      this.zoomHintShown = true;
      this.showToast('拖动棋盘查看 · 双指缩放', 2600);
    }
  }

  redrawBoardCells() {
    if (!this.game) return;
    const board = this.game.board;
    for (let row = 0; row < board.rows; row++) {
      for (let col = 0; col < board.cols; col++) {
        this.renderer.drawCell(col, row, null);
      }
    }
    this.refreshResultStats();
  }

  // ---------------------------------------------------------------------------
  // 结算
  // ---------------------------------------------------------------------------

  finishClassic(result) {
    const game = this.game;
    if (!game || game.finished) return;
    game.finished = true;
    game.running = false;
    const seconds = Math.max(1, Math.round(game.elapsedMs / 1000));
    const key = game.difficultyKey;
    let best = this.best[key] || null;
    let isNewBest = false;

    if (result === 'win') {
      core.flagAllMines(game.board);
      const record = storage.recordClassicBest(key, seconds);
      this.best = storage.loadClassicBest();
      best = record.best;
      isNewBest = record.isNewBest;
    }

    game.outcome = result;
    this.lastClassic = {
      win: result === 'win',
      seconds: seconds,
      best: best,
      isNewBest: isNewBest,
      difficultyKey: key,
      difficultyName: DIFFICULTY_LABEL[key],
      randomMode: !!game.randomMode
    };

    this.redrawBoardCells();
    this.refresh();

    if (result === 'win') {
      this.audio.play('win');
    } else {
      this.audio.play('boom');
    }

    const self = this;
    const delay = result === 'win' ? TIMING.successDelay : TIMING.failRevealDelay;
    this.pendingTimer = setTimeout(function () {
      if (self.game !== game || self.state !== STATE.CLASSIC) return;
      if (self.overlay === OVERLAY.SETTINGS) {
        self.pendingResultOverlay = OVERLAY.CLASSIC_END;
        return;
      }
      if (self.overlay) return;
      self.pendingResultOverlay = null;
      self.overlay = OVERLAY.CLASSIC_END;
      self.renderer.pressedId = null;
      self.refresh();
    }, delay);
  }

  finishLevel(reason) {
    const game = this.game;
    if (!game || game.finished) return;
    game.finished = true;
    game.running = false;

    const level = game.level;
    game.outcome = reason === 'win' ? 'win' : 'lose';
    let seconds;
    if (reason === 'win') {
      seconds = Math.max(1, Math.min(level.time, Math.round(game.elapsedMs / 1000)));
    } else {
      seconds = Math.min(level.time, Math.max(1, Math.round(game.elapsedMs / 1000)));
    }

    if (reason === 'win') {
      core.flagAllMines(game.board);
      const record = levels.recordLevelWin(this.progress, level.id, seconds);
      this.progress = record.progress;
      storage.saveProgress(this.progress);
      const best = this.progress.bestTimes[level.id] || seconds;
      this.lastLevelWin = {
        level: level.id,
        seconds: seconds,
        best: best,
        isNewBest: record.isNewBest,
        lastLevel: level.id >= levels.LEVELS.length
      };
      this.audio.play('win');
    } else {
      const best = this.progress.bestTimes[level.id] || null;
      this.levelFailData = {
        level: level.id,
        seconds: seconds,
        best: best,
        reason: reason
      };
      this.audio.play('boom');
    }

    this.redrawBoardCells();
    this.refresh();

    const self = this;
    this.pendingTimer = setTimeout(function () {
      if (self.game !== game || self.state !== STATE.LEVEL) return;
      if (self.overlay === OVERLAY.SETTINGS) {
        self.pendingResultOverlay = reason === 'win' ? OVERLAY.LEVEL_SUCCESS : OVERLAY.LEVEL_FAIL;
        return;
      }
      if (self.overlay) return;
      self.pendingResultOverlay = null;
      self.overlay = reason === 'win' ? OVERLAY.LEVEL_SUCCESS : OVERLAY.LEVEL_FAIL;
      self.renderer.pressedId = null;
      self.refresh();
    }, reason === 'win' ? TIMING.successDelay : TIMING.failRevealDelay);
  }

  // ---------------------------------------------------------------------------
  // 按钮
  // ---------------------------------------------------------------------------

  pressButton(id) {
    this.renderer.pressedId = id;
    if (this.overlay) {
      this.drawOverlay();
      this.refresh();
    } else {
      this.redrawBase(true);
      this.refresh();
    }
  }

  releaseButton(id) {
    if (this.renderer.pressedId !== id) return;
    this.renderer.pressedId = null;
    if (this.overlay) {
      this.drawOverlay();
      this.refresh();
    } else {
      this.redrawBase();
      this.refresh();
    }
  }

  handleTap(id) {
    this.renderer.pressedId = null;

    if (id === 'overlay.block' || id === 'settings.panel') return;

    if (this.overlay === OVERLAY.SETTINGS) {
      if (id === 'overlay.scrim' || id === 'settings.close' || id === 'settings.done') {
        this.closeSettings();
        return;
      }
      if (id === 'settings.sound') {
        this.settings.sound = !this.settings.sound;
        storage.saveSettings(this.settings);
        this.audio.setEnabled(this.settings.sound);
        if (this.settings.sound) this.audio.play('mark');
        this.drawOverlay();
        this.refresh();
        return;
      }
      if (id === 'settings.vibrate') {
        this.settings.vibrate = !this.settings.vibrate;
        storage.saveSettings(this.settings);
        this.drawOverlay();
        this.refresh();
        return;
      }
      if (id.indexOf('settings.diff.') === 0) {
        const key = id.substring('settings.diff.'.length);
        if (DIFFICULTY_LABEL[key]) {
          this.difficulty = key;
          storage.saveDifficulty(key);
          this.showToast('经典难度已设为「' + DIFFICULTY_LABEL[key] + '」，下一局生效');
          this.drawOverlay();
          this.refresh();
        }
        return;
      }
      return;
    }

    if (this.overlay) {
      this.handleOverlayTap(id);
      return;
    }

    if (id === 'menu.classic') {
      this.startClassic();
      return;
    }
    if (id === 'menu.levels') {
      this.openLevels();
      return;
    }
    if (id === 'menu.settings') {
      this.openSettings();
      return;
    }
    if (id === 'menu.share') {
      this.shareCurrentStatus();
      return;
    }
    if (id === 'levels.back') {
      this.openMenu();
      return;
    }
    if (id === 'levels.locked') {
      this.showToast('先通过上一关，才能点亮这里');
      return;
    }
    if (id.indexOf('level.') === 0) {
      const levelId = Number(id.substring('level.'.length));
      if (levelId) this.startLevel(levelId);
      return;
    }
    if (id === 'game.back') {
      if (this.state === STATE.LEVEL) this.openLevels();
      else this.openMenu();
      return;
    }
    if (id === 'game.settings') {
      this.openSettings();
      return;
    }
    if (id === 'game.restart') {
      if (!this.game) return;
      if (this.game.kind === 'classic') this.startClassic();
      else this.startLevel(this.game.level.id);
      return;
    }
    if (id === 'zoom.in') {
      this.zoomIn();
      return;
    }
    if (id === 'zoom.out') {
      this.zoomOut();
      return;
    }
    if (id === 'zoom.reset' || id === 'zoom.fit') {
      this.zoomReset();
      return;
    }
    if (id === 'poster.back') {
      this.closePoster();
      return;
    }
    if (id === 'poster.save') {
      this.savePoster();
      return;
    }
    if (id === 'poster.share') {
      this.sharePoster();
    }
  }

  handleOverlayTap(id) {
    if (this.overlay === OVERLAY.CLASSIC_END) {
      if (id === 'end.close') {
        this.closeResultOverlay();
      } else if (id === 'end.again') {
        this.startClassic();
      } else if (id === 'end.poster') {
        if (this.lastClassic) this.generateClassicPoster(this.lastClassic);
      } else if (id === 'end.home') {
        this.openMenu();
      }
      return;
    }
    if (this.overlay === OVERLAY.LEVEL_FAIL) {
      if (id === 'fail.close') {
        this.closeResultOverlay();
      } else if (id === 'fail.retry') {
        this.startLevel(this.levelFailData.level);
      } else if (id === 'fail.levels') {
        this.openLevels();
      }
      return;
    }
    if (this.overlay === OVERLAY.LEVEL_SUCCESS) {
      if (id === 'success.close') {
        this.closeResultOverlay();
      } else if (id === 'success.poster') {
        if (this.lastLevelWin) this.generateLevelPoster(this.lastLevelWin);
      } else if (id === 'success.next') {
        this.startLevel(Math.min(levels.LEVELS.length, this.lastLevelWin.level + 1));
      } else if (id === 'success.levels') {
        this.openLevels();
      }
    }
  }

  closeResultOverlay() {
    this.overlay = null;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.refresh();
    this.showToast('点击棋盘任意位置，可重新打开结算');
  }

  reopenResult() {
    if (!this.game || !this.game.finished) return;
    if (this.game.kind === 'classic') {
      this.overlay = OVERLAY.CLASSIC_END;
    } else {
      this.overlay = this.game.outcome === 'win' ? OVERLAY.LEVEL_SUCCESS : OVERLAY.LEVEL_FAIL;
    }
    this.renderer.pressedId = null;
    this.drawOverlay();
    this.refresh();
  }

  openSettings() {
    if (!this.game && this.state !== STATE.MENU && this.state !== STATE.LEVELS) return;
    this.overlay = OVERLAY.SETTINGS;
    this.renderer.pressedId = null;
    this.drawOverlay();
    this.refresh();
  }

  closeSettings() {
    this.overlay = null;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.redrawBase();
    if (this.pendingResultOverlay) {
      this.overlay = this.pendingResultOverlay;
      this.pendingResultOverlay = null;
      this.drawOverlay();
    }
    this.refresh();
  }

  // ---------------------------------------------------------------------------
  // 海报
  // ---------------------------------------------------------------------------

  shareCurrentStatus() {
    if (this.game && this.game.kind === 'classic' && !this.game.finished) {
      this.generateClassicPoster({
        win: false,
        seconds: Math.round(this.game.elapsedMs / 1000),
        difficultyKey: this.game.difficultyKey,
        randomMode: this.game.randomMode,
        ongoing: true
      });
      return;
    }
    if (this.lastClassic) {
      this.generateClassicPoster(this.lastClassic);
      return;
    }
    this.generateGenericPoster();
  }

  generateClassicPoster(data) {
    const difficultyName = DIFFICULTY_LABEL[data.difficultyKey];
    const seconds = data.seconds;
    let stateText;
    if (data.ongoing) {
      stateText = '正在山林里扫雷，【' + difficultyName + '】难度进行中';
    } else if (data.win) {
      stateText = '我刚在【' + difficultyName + '】难度用了 ' + seconds + ' 秒，来挑战我';
    } else {
      stateText = '我在【' + difficultyName + '】难度的山林里踩了雷，来替我清雾';
    }
    const best = this.best[data.difficultyKey] || null;
    this.generatePoster({
      stateText: stateText,
      qrScene: 'c',
      stats: [
        { label: '难度', value: difficultyName },
        { label: '用时', value: data.ongoing ? '进行中' : levels.formatSeconds(seconds) },
        { label: '最佳', value: best ? levels.formatSeconds(best) : '--:--' }
      ]
    });
  }

  generateLevelPoster(data) {
    const stateText = '通过了第 ' + data.level + ' 关，用时 ' + data.seconds + ' 秒';
    const best = this.progress.bestTimes[data.level] || data.best || null;
    this.generatePoster({
      stateText: stateText,
      qrScene: 'p' + data.level,
      stats: [
        { label: '关卡', value: '第 ' + data.level + ' 关' },
        { label: '用时', value: levels.formatSeconds(data.seconds) },
        { label: '最佳', value: best ? levels.formatSeconds(best) : '--:--' }
      ]
    });
  }

  generateGenericPoster() {
    const difficultyName = DIFFICULTY_LABEL[this.difficulty];
    const stateText = '山林里起雾了，【' + difficultyName + '】难度等你来扫';
    const best = this.difficulty === 'random' ? null : (this.best[this.difficulty] || null);
    this.generatePoster({
      stateText: stateText,
      qrScene: 'c',
      stats: [
        { label: '模式', value: '经典' },
        { label: '难度', value: difficultyName },
        { label: '最佳', value: best ? levels.formatSeconds(best) : '--:--' }
      ]
    });
  }

  generatePoster(data) {
    if (this.generatingPoster) return;
    const self = this;
    const origin = { state: this.state, overlay: this.overlay };
    this.generatingPoster = true;
    this.showToast('正在生成海报…', 8000);

    this.share.createPoster(data).then(function (res) {
      self.generatingPoster = false;
      if (self.state !== origin.state || self.overlay !== origin.overlay) {
        self.toast = null;
        self.refresh();
        return;
      }
      self.toast = null;
      self.posterReturn = origin;
      self.posterView = {
        source: res.source,
        hasQr: res.hasQr,
        tempFilePath: res.tempFilePath
      };
      self.state = STATE.POSTER;
      self.overlay = null;
      self.renderer.pressedId = null;
      self.renderer.clearOverlayHits();
      self.renderer.renderPosterScreen(self.posterView);
      self.refresh();
    }).catch(function () {
      self.generatingPoster = false;
      self.toast = null;
      self.showToast('海报生成失败，请稍后再试');
    });
  }

  closePoster() {
    const origin = this.posterReturn;
    this.posterView = null;
    this.posterReturn = null;
    if (!origin) {
      this.openMenu();
      return;
    }
    this.state = origin.state;
    this.overlay = origin.overlay;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.redrawBase();
    this.refresh();
  }

  savePoster() {
    if (!this.posterView || !this.posterView.tempFilePath) {
      this.showToast('海报尚未准备好，请稍候');
      return;
    }
    const self = this;
    this.share.saveImage(this.posterView.tempFilePath).then(function (res) {
      if (res.ok) {
        self.showToast('已保存到相册，去朋友圈发布吧');
      } else if (res.reason === 'auth') {
        self.showToast('需要相册权限，请在小程序设置中开启');
      } else {
        self.showToast('保存失败，请稍后再试');
      }
    });
  }

  sharePoster() {
    if (!this.posterView || !this.posterView.tempFilePath) {
      this.showToast('海报尚未准备好，请稍候');
      return;
    }
    const self = this;
    this.share.shareImage(this.posterView.tempFilePath).then(function (res) {
      if (res.ok) {
        self.showToast('已打开分享面板');
      } else if (res.fallbackSaved) {
        self.showToast('当前版本不支持图片分享，已保存到相册，请手动发送');
      } else {
        self.showToast('分享不可用，请保存海报后手动发送');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 调试 / 预览
  // ---------------------------------------------------------------------------

  initializePreview() {
    if (typeof wx === 'undefined' || !wx.__PREVIEW__) return;
    const debug = this.launch.query && this.launch.query.debug;
    if (!debug) return;
    const self = this;
    this.debugSetup();
    setTimeout(function () {
      self.debugJump(debug);
    }, 30);
  }

  debugSetup() {
    this.difficulty = 'mid';
    this.best = { low: 52, mid: 83, high: null };
    this.progress = { unlocked: 6, bestTimes: { 1: 44, 2: 51, 3: 63, 4: 58, 5: 49 } };
    this.renderer.renderMenu(this.buildMenuData());
    this.refresh();
  }

  debugJump(type) {
    if (typeof wx === 'undefined' || !wx.__PREVIEW__) return;
    this.clearPending();
    this.overlay = null;
    this.renderer.pressedId = null;
    this.renderer.clearOverlayHits();
    this.toast = null;

    if (!type || type === 'mode') {
      this.openMenu();
      return;
    }
    if (type === 'levels') {
      this.openLevels();
      return;
    }
    if (type === 'classic') {
      this.startClassic();
      this.demoPlay();
      return;
    }
    if (type.indexOf('level:') === 0) {
      const id = Number(type.substring('level:'.length));
      if (id > this.progress.unlocked) {
        this.progress.unlocked = id;
        this.progress = levels.normalizeProgress(this.progress);
      }
      this.startLevel(id);
      this.demoPlay();
      return;
    }
    if (type === 'classicHigh') {
      this.difficulty = 'high';
      this.startClassic();
      this.demoPlay();
      return;
    }
    if (type === 'classicZoom') {
      this.difficulty = 'mid';
      this.startClassic();
      this.demoPlay();
      this.renderer.zoomBy(1.7);
      this.renderer.panBy(-26, -22);
      this.renderer.redrawBoardView();
      this.refresh();
      return;
    }
    if (type === 'settings') {
      this.openMenu();
      this.openSettings();
      return;
    }
    if (type === 'classicEnd') {
      this.demoWinClassic();
      return;
    }
    if (type === 'classicLose') {
      this.demoLoseClassic();
      return;
    }
    if (type === 'levelFail') {
      if (this.progress.unlocked < 3) this.progress.unlocked = 3;
      this.startLevel(3);
      this.game.elapsedMs = this.game.level.time * 1000;
      this.finishLevel('timeout');
      return;
    }
    if (type === 'levelPulse') {
      if (this.progress.unlocked < 3) this.progress.unlocked = 3;
      this.startLevel(3);
      this.demoPlay();
      this.game.elapsedMs = this.game.level.time * 1000 - 8000;
      this.game.running = true;
      this.displayedSecond = 8;
      this.renderer.renderGameFull(this.buildMeta());
      this.refresh();
      return;
    }
    if (type === 'levelSuccess') {
      this.demoWinLevel();
      return;
    }
    if (type === 'poster') {
      this.openMenu();
      this.demoWinLevelPoster();
      return;
    }
    if (type === 'posterClassic') {
      this.openMenu();
      this.generateClassicPoster({
        win: true,
        seconds: 42,
        difficultyKey: 'mid',
        isNewBest: true
      });
    }
  }

  demoPlay() {
    const game = this.game;
    if (!game) return;
    const board = game.board;
    const col = Math.floor(board.cols / 2);
    const row = Math.floor(board.rows / 2);
    core.revealCell(board, col, row);
    const marks = [1, 2, 3];
    let markIndex = 0;
    for (let r = 0; r < board.rows && markIndex < 6; r++) {
      for (let c = 0; c < board.cols && markIndex < 6; c++) {
        const cell = board.cells[r][c];
        if (cell.revealed || cell.isMine) continue;
        if ((c + r) % 4 !== 0) continue;
        cell.mark = marks[markIndex % 3];
        markIndex++;
      }
    }
    game.elapsedMs = game.kind === 'level' ? 30000 : 41500;
    game.started = true;
    game.running = true;
    this.displayedSecond = game.kind === 'level'
      ? Math.ceil((game.level.time * 1000 - game.elapsedMs) / 1000)
      : Math.floor(game.elapsedMs / 1000);
    this.renderer.renderGameFull(this.buildMeta());
    this.refresh();
  }

  revealAllSafe() {
    const game = this.game;
    const board = game.board;
    const startCol = Math.floor(board.cols / 2);
    const startRow = Math.floor(board.rows / 2);
    core.revealCell(board, startCol, startRow);
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.cells[r][c];
        if (cell.isMine || cell.revealed) continue;
        core.revealCell(board, c, r);
      }
    }
  }

  demoWinClassic() {
    this.startClassic();
    this.game.elapsedMs = 42300;
    this.revealAllSafe();
    this.finishClassic('win');
  }

  demoLoseClassic() {
    this.startClassic();
    const board = this.game.board;
    core.revealCell(board, Math.floor(board.cols / 2), Math.floor(board.rows / 2));
    let target = null;
    for (let r = 0; r < board.rows && !target; r++) {
      for (let c = 0; c < board.cols && !target; c++) {
        if (board.cells[r][c].isMine) target = { col: c, row: r };
      }
    }
    this.game.elapsedMs = 18700;
    if (target) core.revealCell(board, target.col, target.row);
    this.finishClassic('lose');
  }

  demoWinLevel() {
    this.startLevel(5);
    this.game.elapsedMs = 38100;
    this.revealAllSafe();
    this.finishLevel('win');
  }

  demoWinLevelPoster() {
    this.lastLevelWin = {
      level: 5,
      seconds: 38,
      best: 38,
      isNewBest: true,
      lastLevel: false
    };
    this.progress.bestTimes[5] = 38;
    this.generateLevelPoster(this.lastLevelWin);
  }

  clearPending() {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }
}

module.exports = Game;

};

// ---- game.js ----
__defs["game.js"] = function (module, exports, require) {
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

};

  window.__previewRequire = function (id) { return __require(id, ""); };
  __require("game.js", "");
})();
