import type { Game } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

// --- Board constants ---
export const BOARD_SIZE = 8;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const MAX_IDX = BOARD_SIZE - 1;

// --- Mode definitions ---
export const MODES = {
  "3x3": { cols: 3, rows: 3, pieceCount: 9 },
  "3x4": { cols: 3, rows: 4, pieceCount: 12 },
} as const;

export type ModeKey = keyof typeof MODES;

// --- Game state type ---
export interface MukoState {
  cells: (string | null)[];
  mode: ModeKey;
  lastMove: { from: number; to: number } | null;
}

// --- Movement logic ---
// BFS: returns all squares reachable via chain jumps from `from`.
function getJumpMoves(cells: (string | null)[], from: number): number[] {
  const x1 = from % BOARD_SIZE;
  const y1 = Math.floor(from / BOARD_SIZE);
  const reachable = new Set<number>();
  const queue: { x: number; y: number; visited: Set<number> }[] = [
    { x: x1, y: y1, visited: new Set([from]) },
  ];

  while (queue.length > 0) {
    const { x, y, visited } = queue.shift()!;
    for (const [dx, dy] of [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx > MAX_IDX || ny < 0 || ny > MAX_IDX) continue;
      const to = ny * BOARD_SIZE + nx;
      if (cells[to] !== null) continue;
      if (visited.has(to)) continue;
      const mid = (y + dy / 2) * BOARD_SIZE + (x + dx / 2);
      if (cells[mid] === null) continue;
      reachable.add(to);
      queue.push({ x: nx, y: ny, visited: new Set([...visited, to]) });
    }
  }

  return [...reachable];
}

// Returns all valid destination indices for a piece at `from` (slides + chain jumps).
export function getValidMoves(
  cells: (string | null)[],
  from: number,
): number[] {
  const x1 = from % BOARD_SIZE;
  const y1 = Math.floor(from / BOARD_SIZE);
  const valid = new Set<number>();

  // Orthogonal slides (distance 1)
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nx = x1 + dx;
    const ny = y1 + dy;
    if (nx < 0 || nx > MAX_IDX || ny < 0 || ny > MAX_IDX) continue;
    const to = ny * BOARD_SIZE + nx;
    if (cells[to] === null) valid.add(to);
  }

  // Chain jumps (BFS)
  for (const to of getJumpMoves(cells, from)) valid.add(to);

  return [...valid];
}

// --- Win condition helpers ---
// Counts how many pieces of `player` are inside the target zone defined by the mode.
function countInTarget(
  cells: (string | null)[],
  player: string,
  mode: ModeKey,
): number {
  const { cols, rows } = MODES[mode];
  return cells.filter((v, i) => {
    if (v !== player) return false;
    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);
    if (player === "0") {
      // White's target: opponent's starting corner (top-right)
      return x >= BOARD_SIZE - cols && y < rows;
    } else {
      // Black's target: opponent's starting corner (bottom-left)
      return x < cols && y >= BOARD_SIZE - rows;
    }
  }).length;
}

// --- Game definition ---
export const Muko: Game = {
  name: "muko",

  setup: (_, setupData?: { debug?: boolean; mode?: ModeKey }): MukoState => {
    const mode: ModeKey = setupData?.mode ?? "3x3";
    const { cols, rows } = MODES[mode];

    if (setupData?.debug) {
      const cells: (string | null)[] = Array(TOTAL_CELLS).fill(null);
      // 3x3 debug: White: 8 pieces in target (fgh rows 6-8), 1 piece a slide away
      [4, 6, 7, 13, 14, 15, 21, 22, 23].forEach((i) => (cells[i] = "0"));
      // 3x3 debug: Black: 8 pieces in target (abc rows 1-3), 1 piece a slide away
      [32, 41, 42, 48, 49, 50, 56, 57, 58].forEach((i) => (cells[i] = "1"));
      return { cells, mode: "3x3", lastMove: null };
    }

    return {
      mode,
      // null = empty, '0' = Player 0 (White), '1' = Player 1 (Black)
      cells: Array(TOTAL_CELLS)
        .fill(null)
        .map((_, i) => {
          const x = i % BOARD_SIZE;
          const y = Math.floor(i / BOARD_SIZE);
          // White starts bottom-left
          if (x < cols && y >= BOARD_SIZE - rows) return "0";
          // Black starts top-right
          if (x >= BOARD_SIZE - cols && y < rows) return "1";
          return null;
        }),
      lastMove: null,
    };
  },

  endIf: ({ G }) => {
    const { pieceCount } = MODES[G.mode as ModeKey];
    if (countInTarget(G.cells, "0", G.mode as ModeKey) === pieceCount)
      return { winner: "0" };
    if (countInTarget(G.cells, "1", G.mode as ModeKey) === pieceCount)
      return { winner: "1" };
  },

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    movePiece: ({ G, ctx }, from: number, to: number) => {
      if (G.cells[from] !== ctx.currentPlayer) return INVALID_MOVE;
      if (G.cells[to] !== null) return INVALID_MOVE;
      // Valid if `to` is reachable via a slide or any chain of jumps from `from`
      if (!getValidMoves(G.cells, from).includes(to)) return INVALID_MOVE;

      G.cells[to] = G.cells[from];
      G.cells[from] = null;
      G.lastMove = { from, to };
    },
  },
};
