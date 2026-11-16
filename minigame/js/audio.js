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
