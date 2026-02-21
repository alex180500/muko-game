import type { Game } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

/** BFS: returns all squares reachable via chain jumps from `from`. */
function getJumpMoves(cells: (string | null)[], from: number): number[] {
  const x1 = from % 8;
  const y1 = Math.floor(from / 8);
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
      if (nx < 0 || nx > 7 || ny < 0 || ny > 7) continue;
      const to = ny * 8 + nx;
      if (cells[to] !== null) continue;
      if (visited.has(to)) continue;
      const mid = (y + dy / 2) * 8 + (x + dx / 2);
      if (cells[mid] === null) continue;
      reachable.add(to);
      queue.push({ x: nx, y: ny, visited: new Set([...visited, to]) });
    }
  }

  return [...reachable];
}

/** Returns all valid destination indices for a piece at `from` (slides + chain jumps). */
export function getValidMoves(
  cells: (string | null)[],
  from: number,
): number[] {
  const x1 = from % 8;
  const y1 = Math.floor(from / 8);
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
    if (nx < 0 || nx > 7 || ny < 0 || ny > 7) continue;
    const to = ny * 8 + nx;
    if (cells[to] === null) valid.add(to);
  }

  // Chain jumps (BFS)
  for (const to of getJumpMoves(cells, from)) valid.add(to);

  return [...valid];
}


export const Muko: Game = {
  name: "muko",

  setup: (_, setupData?: { debug?: boolean }) => {
    // Debug board: both players have 8 pieces in their target zone, 1 piece one slide away from winning
    // White target (x>=5, y<3): 5,6,7,13,14,15,21,22,23 — leave 5 empty, white at 4 (slides to 5)
    // Black target (x<3, y>=5): 40,41,42,48,49,50,56,57,58 — leave 40 empty, black at 32 (slides to 40)
    if (setupData?.debug) {
      const cells: (string | null)[] = Array(64).fill(null);
      [4, 6, 7, 13, 14, 15, 21, 22, 23].forEach((i) => (cells[i] = "0"));
      [32, 41, 42, 48, 49, 50, 56, 57, 58].forEach((i) => (cells[i] = "1"));
      return { cells, lastMove: null as { from: number; to: number } | null };
    }

    return {
      // 8x8 chessboard. null = empty, '0' = Player 0 (White), '1' = Player 1 (Black)
      cells: Array(64)
        .fill(null)
        .map((_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          // 3x3 Muko setup: Player 0 (white) in bottom-left, Player 1 (black) in top-right.
          if (x < 3 && y >= 5) return "0";
          if (x >= 5 && y < 3) return "1";
          return null;
        }),
      lastMove: null as { from: number; to: number } | null,
    };
  },

  // White (0) wins when all 9 pieces reach top-right (x>=5, y<3)
  // Black (1) wins when all 9 pieces reach bottom-left (x<3, y>=5)
  endIf: ({ G }) => {
    const whiteInTarget = G.cells.filter(
      (v: string | null, i: number) =>
        v === "0" && i % 8 >= 5 && Math.floor(i / 8) < 3,
    ).length;
    if (whiteInTarget === 9) return { winner: "0" };
    const blackInTarget = G.cells.filter(
      (v: string | null, i: number) =>
        v === "1" && i % 8 < 3 && Math.floor(i / 8) >= 5,
    ).length;
    if (blackInTarget === 9) return { winner: "1" };
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
