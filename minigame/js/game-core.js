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
