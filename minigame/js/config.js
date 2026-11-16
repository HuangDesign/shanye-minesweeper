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
