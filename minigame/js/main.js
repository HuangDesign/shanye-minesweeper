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
