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
