'use strict';

/**
 * 核心逻辑与持久化单元测试。
 * 运行：node tests/run.js
 */

const assert = require('assert');
const path = require('path');

const config = require('../minigame/js/config.js');
const core = require('../minigame/js/game-core.js');
const levels = require('../minigame/js/levels.js');
const launch = require('../minigame/js/launch.js');

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (err) {
    console.error('  ✗ ' + name);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

function forEachCell(board, fn) {
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) fn(board.cells[r][c], c, r);
  }
}

function countMines(board) {
  let count = 0;
  forEachCell(board, function (cell) { if (cell.isMine) count++; });
  return count;
}

function recomputeAdjacency(board) {
  forEachCell(board, function (cell, c, r) {
    if (cell.isMine) return;
    let count = 0;
    core.forEachNeighbor(board, c, r, function (nc, nr, neighbor) {
      if (neighbor.isMine) count++;
    });
    cell.adjacentMines = count;
  });
}

function findMine(board) {
  let result = null;
  forEachCell(board, function (cell, c, r) {
    if (!result && cell.isMine) result = { col: c, row: r };
  });
  return result;
}

console.log('\n[配置]');
test('经典难度参数与 PRD 一致', function () {
  assert.deepStrictEqual(config.DIFFICULTIES.low, { key: 'low', name: '低', cols: 9, rows: 9, mines: 10 });
  assert.deepStrictEqual(config.DIFFICULTIES.mid, { key: 'mid', name: '中', cols: 16, rows: 16, mines: 40 });
  assert.deepStrictEqual(config.DIFFICULTIES.high, { key: 'high', name: '高', cols: 16, rows: 30, mines: 99 });
});

test('闯关 9 关参数与 PRD 一致', function () {
  assert.strictEqual(levels.LEVELS.length, 9);
  const expected = [
    [8, 8, 8, 90], [9, 9, 10, 80], [10, 10, 14, 75],
    [12, 12, 22, 70], [14, 14, 30, 65], [16, 16, 40, 60],
    [16, 20, 55, 55], [16, 24, 72, 50], [16, 30, 99, 45]
  ];
  levels.LEVELS.forEach(function (level, index) {
    assert.deepStrictEqual(
      [level.cols, level.rows, level.mines, level.time],
      expected[index],
      'level ' + level.id
    );
  });
});

console.log('\n[棋盘生成与首点安全]');
test('初始棋盘结构与雷数', function () {
  const board = core.createBoard(9, 9, 10);
  assert.strictEqual(board.cols, 9);
  assert.strictEqual(board.rows, 9);
  assert.strictEqual(board.mineCount, 10);
  assert.strictEqual(board.minesPlaced, false);
  assert.strictEqual(board.revealedCount, 0);
  assert.strictEqual(board.cells.length, 9);
  assert.strictEqual(board.cells[0].length, 9);
  assert.deepStrictEqual(board.cells[0][0], { isMine: false, adjacentMines: 0, revealed: false, mark: 0 });
});

test('首点安全：首点及 8 邻域无雷（经典 + 闯关全关卡，多次随机）', function () {
  const cases = [];
  Object.keys(config.DIFFICULTIES).forEach(function (key) {
    cases.push(config.DIFFICULTIES[key]);
  });
  levels.LEVELS.forEach(function (level) { cases.push(level); });

  for (let trial = 0; trial < 6; trial++) {
    cases.forEach(function (item) {
      const board = core.createBoard(item.cols, item.rows, item.mines);
      const col = Math.floor(Math.random() * board.cols);
      const row = Math.floor(Math.random() * board.rows);
      const result = core.revealCell(board, col, row);
      assert.strictEqual(result.result, 'revealed');
      assert.strictEqual(board.cells[row][col].isMine, false);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nc = col + dc;
          const nr = row + dr;
          if (nc < 0 || nr < 0 || nc >= board.cols || nr >= board.rows) continue;
          assert.strictEqual(board.cells[nr][nc].isMine, false, item.cols + 'x' + item.rows + ' 首点邻域有雷');
        }
      }
      assert.strictEqual(countMines(board), board.mineCount);
      assert.strictEqual(board.minesPlaced, true);
    });
  }
});

test('邻域雷数计算正确', function () {
  const board = core.createBoard(9, 9, 10);
  core.placeMines(board, 4, 4);
  forEachCell(board, function (cell, c, r) {
    if (cell.isMine) return;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dc && !dr) continue;
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= board.cols || nr >= board.rows) continue;
        if (board.cells[nr][nc].isMine) count++;
      }
    }
    assert.strictEqual(cell.adjacentMines, count);
  });
});

test('首次翻开前不布雷，布雷不重复', function () {
  const board = core.createBoard(16, 30, 99);
  assert.strictEqual(countMines(board), 0);
  core.placeMines(board, 3, 3);
  core.placeMines(board, 10, 10);
  assert.strictEqual(countMines(board), 99);
});

console.log('\n[翻开与胜负]');
test('翻开零雷格使用 BFS 展开且不翻雷', function () {
  const board = core.createBoard(9, 9, 10);
  const result = core.revealCell(board, 4, 4);
  assert.ok(result.changed.length > 1);
  for (let i = 0; i < result.changed.length; i++) {
    const cell = board.cells[result.changed[i].row][result.changed[i].col];
    assert.strictEqual(cell.revealed, true);
    assert.strictEqual(cell.isMine, false);
  }
  assert.strictEqual(result.win, false);
});

test('翻开全部非雷格后判胜', function () {
  const board = core.createBoard(9, 9, 10);
  core.revealCell(board, 4, 4);
  let win = false;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (board.cells[r][c].isMine || board.cells[r][c].revealed) continue;
      const result = core.revealCell(board, c, r);
      if (result.win) win = true;
    }
  }
  assert.strictEqual(board.revealedCount, board.cols * board.rows - board.mineCount);
  assert.strictEqual(win, true);
  assert.strictEqual(board.gameOver, 'win');
});

test('翻开地雷立即失败并记录位置', function () {
  const board = core.createBoard(9, 9, 10);
  core.revealCell(board, 4, 4);
  const mine = findMine(board);
  const result = core.revealCell(board, mine.col, mine.row);
  assert.strictEqual(result.result, 'mine');
  assert.strictEqual(board.gameOver, 'lose');
  assert.deepStrictEqual(board.exploded, mine);
});

test('已翻开的格子重复点击为空操作', function () {
  const board = core.createBoard(9, 9, 10);
  core.revealCell(board, 4, 4);
  const before = board.revealedCount;
  const result = core.revealCell(board, 4, 4);
  assert.strictEqual(result.result, 'noop');
  assert.strictEqual(board.revealedCount, before);
});

test('BFS 展开跳过已标记格', function () {
  const board = core.createBoard(6, 6, 1);
  board.minesPlaced = true;
  board.cells[0][0].isMine = true;
  recomputeAdjacency(board);
  board.cells[4][4].mark = core.MARK.SAFE;
  const result = core.revealCell(board, 5, 5);
  assert.ok(result.changed.length > 0);
  assert.strictEqual(board.cells[4][4].revealed, false);
  assert.strictEqual(board.cells[4][4].mark, core.MARK.SAFE);
  assert.strictEqual(board.cells[0][0].revealed, false);
});

console.log('\n[标记]');
test('标记状态四态循环', function () {
  const board = core.createBoard(9, 9, 10);
  assert.strictEqual(board.cells[2][2].mark, 0);
  assert.strictEqual(core.toggleMark(board, 2, 2).mark, 1);
  assert.strictEqual(core.toggleMark(board, 2, 2).mark, 2);
  assert.strictEqual(core.toggleMark(board, 2, 2).mark, 3);
  assert.strictEqual(core.toggleMark(board, 2, 2).mark, 0);
});

test('标记计数只统计地雷标记', function () {
  const board = core.createBoard(9, 9, 10);
  board.cells[0][0].mark = core.MARK.SAFE;
  board.cells[0][1].mark = core.MARK.SUSPECT;
  board.cells[0][2].mark = core.MARK.MINE;
  board.cells[0][3].mark = core.MARK.MINE;
  assert.strictEqual(core.countMineMarks(board), 2);
  assert.strictEqual(core.toggleMark(board, 2, 0).mark, 0);
  assert.strictEqual(core.countMineMarks(board), 1);
});

test('短按已标记格会清除标记并翻开', function () {
  const board = core.createBoard(9, 9, 10);
  core.revealCell(board, 4, 4);
  let target = null;
  forEachCell(board, function (cell, c, r) {
    if (!target && !cell.revealed && !cell.isMine) target = { col: c, row: r };
  });
  board.cells[target.row][target.col].mark = core.MARK.MINE;
  const result = core.revealCell(board, target.col, target.row);
  assert.strictEqual(result.result, 'revealed');
  assert.strictEqual(board.cells[target.row][target.col].mark, 0);
  assert.strictEqual(board.cells[target.row][target.col].revealed, true);
});

test('胜利后可为全部地雷补旗', function () {
  const board = core.createBoard(9, 9, 10);
  core.revealCell(board, 4, 4);
  core.flagAllMines(board);
  assert.strictEqual(core.countMineMarks(board), board.mineCount);
  let mines = 0;
  forEachCell(board, function (cell) {
    if (cell.isMine) {
      mines++;
      assert.strictEqual(cell.mark, core.MARK.MINE);
    }
  });
  assert.strictEqual(mines, board.mineCount);
});

test('已标记地雷格短按翻开后判负并清标记', function () {
  const board = core.createBoard(9, 9, 10);
  core.revealCell(board, 4, 4);
  const mine = findMine(board);
  board.cells[mine.row][mine.col].mark = core.MARK.MINE;
  const result = core.revealCell(board, mine.col, mine.row);
  assert.strictEqual(result.result, 'mine');
  assert.strictEqual(board.cells[mine.row][mine.col].mark, 0);
  assert.strictEqual(board.gameOver, 'lose');
});

console.log('\n[闯关进度]');
test('通关解锁下一关并记录最佳', function () {
  let progress = levels.defaultProgress();
  let record = levels.recordLevelWin(progress, 1, 44);
  assert.strictEqual(record.progress.unlocked, 2);
  assert.strictEqual(record.progress.bestTimes[1], 44);
  assert.strictEqual(record.isNewBest, true);

  record = levels.recordLevelWin(record.progress, 2, 55);
  assert.strictEqual(record.progress.unlocked, 3);

  record = levels.recordLevelWin(record.progress, 1, 60);
  assert.strictEqual(record.progress.bestTimes[1], 44);
  assert.strictEqual(record.isNewBest, false);

  record = levels.recordLevelWin(record.progress, 1, 30);
  assert.strictEqual(record.progress.bestTimes[1], 30);
  assert.strictEqual(record.isNewBest, true);
});

test('九关全通后标记已通关', function () {
  let progress = levels.defaultProgress();
  levels.LEVELS.forEach(function (level) {
    progress = levels.recordLevelWin(progress, level.id, 30).progress;
  });
  assert.strictEqual(progress.unlocked, 10);
  assert.strictEqual(levels.isCompleted(progress), true);
});

test('进度数据容错', function () {
  const progress = levels.normalizeProgress({ unlocked: 99, bestTimes: { 1: 'abc', 2: 50, 10: 10 } });
  assert.strictEqual(progress.unlocked, 10);
  assert.strictEqual(progress.bestTimes[1], undefined);
  assert.strictEqual(progress.bestTimes[2], 50);
  assert.strictEqual(levels.normalizeProgress(null).unlocked, 1);
});

console.log('\n[启动参数]');
test('解析经典码与闯关码场景', function () {
  const classic = launch.parseLaunch({ scene: 1001, query: { scene: 'c' } });
  assert.strictEqual(classic.scene.type, 'classic');
  assert.ok(classic.hint.indexOf('好友') === 0);

  const level = launch.parseLaunch({ scene: 1011, query: { scene: 'p5' } });
  assert.strictEqual(level.scene.level, 5);
  assert.ok(level.hint.indexOf('第 5 关') > 0);
});

test('朋友圈预览场景值 1155', function () {
  const preview = launch.parseLaunch({ scene: 1155, query: {} });
  assert.strictEqual(preview.previewMode, true);
});

test('非法参数不抛错', function () {
  assert.doesNotThrow(function () {
    launch.parseLaunch({ scene: 'oops', query: { scene: 'p10' } });
    launch.parseLaunch(null);
    launch.parseLaunch({ query: { scene: { x: 1 } } });
  });
  assert.strictEqual(launch.parseSceneValue('p10'), null);
  assert.strictEqual(launch.parseSceneValue('p0'), null);
});

console.log('\n[本地持久化]');
test('设置、难度、最佳、进度持久化与容错', function () {
  const fake = new Map();
  global.wx = {
    getStorageSync: function (key) { return fake.has(key) ? fake.get(key) : ''; },
    setStorageSync: function (key, value) { fake.set(key, value); },
    removeStorageSync: function (key) { fake.delete(key); }
  };

  const storagePath = require.resolve('../minigame/js/storage.js');
  delete require.cache[storagePath];
  const storage = require(storagePath);

  assert.deepStrictEqual(storage.loadSettings(), { sound: true, vibrate: true });
  assert.strictEqual(storage.loadDifficulty(), 'mid');
  assert.deepStrictEqual(storage.loadClassicBest(), { low: null, mid: null, high: null });
  assert.deepStrictEqual(storage.loadProgress(), { unlocked: 1, bestTimes: {} });

  storage.saveSettings({ sound: false, vibrate: false });
  assert.deepStrictEqual(storage.loadSettings(), { sound: false, vibrate: false });

  storage.saveDifficulty('high');
  assert.strictEqual(storage.loadDifficulty(), 'high');
  storage.saveDifficulty('bogus');
  assert.strictEqual(storage.loadDifficulty(), 'high');

  let record = storage.recordClassicBest('mid', 83);
  assert.strictEqual(record.best, 83);
  assert.strictEqual(record.isNewBest, true);
  record = storage.recordClassicBest('mid', 90);
  assert.strictEqual(record.best, 83);
  assert.strictEqual(record.isNewBest, false);

  storage.saveProgress({ unlocked: 4, bestTimes: { 1: 40, 2: 50, 3: 60 } });
  assert.strictEqual(storage.loadProgress().unlocked, 4);

  // 模拟存储损坏
  fake.set('settings', 'broken');
  fake.set('classicBest', { mid: -5, low: 'x' });
  fake.set('levelProgress', { unlocked: 'bad', bestTimes: 5 });
  assert.deepStrictEqual(storage.loadSettings(), { sound: true, vibrate: true });
  assert.deepStrictEqual(storage.loadClassicBest(), { low: null, mid: null, high: null });
  assert.deepStrictEqual(storage.loadProgress(), { unlocked: 1, bestTimes: {} });

  // 清空缓存后回到默认
  storage.clearAll();
  assert.strictEqual(storage.loadDifficulty(), 'mid');
  assert.deepStrictEqual(storage.loadSettings(), { sound: true, vibrate: true });
});

test('朋友圈预览使用内存存储，不写入本地', function () {
  const fake = new Map();
  global.wx = {
    getStorageSync: function (key) { return fake.has(key) ? fake.get(key) : ''; },
    setStorageSync: function (key, value) { fake.set(key, value); },
    removeStorageSync: function (key) { fake.delete(key); }
  };
  const storagePath = require.resolve('../minigame/js/storage.js');
  delete require.cache[storagePath];
  const storage = require(storagePath);

  storage.setVolatile(true);
  storage.saveDifficulty('low');
  storage.saveSettings({ sound: false, vibrate: true });
  assert.strictEqual(storage.loadDifficulty(), 'low');
  assert.strictEqual(fake.has('classicDifficulty'), false);
  assert.strictEqual(fake.has('settings'), false);
  storage.setVolatile(false);
  delete global.wx;
});

console.log('\n' + passed + ' tests passed');
