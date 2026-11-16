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
