import type { Game } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

/** Returns all valid destination indices for a piece at `from`. Mirrors server move validation exactly. */
export function getValidMoves(
  cells: (string | null)[],
  from: number,
): number[] {
  const x1 = from % 8;
  const y1 = Math.floor(from / 8);
  const valid: number[] = [];

  const check = (x2: number, y2: number) => {
    if (x2 < 0 || x2 > 7 || y2 < 0 || y2 > 7) return;
    const to = y2 * 8 + x2;
    if (cells[to] !== null) return;

    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    const isSlide = dx + dy === 1;

    let isJump = false;
    if ((dx === 2 && dy === 0) || (dx === 0 && dy === 2)) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      if (cells[midY * 8 + midX] !== null) isJump = true;
    }

    if (isSlide || isJump) valid.push(to);
  };

  // Slides
  check(x1 + 1, y1);
  check(x1 - 1, y1);
  check(x1, y1 + 1);
  check(x1, y1 - 1);
  // Jumps
  check(x1 + 2, y1);
  check(x1 - 2, y1);
  check(x1, y1 + 2);
  check(x1, y1 - 2);

  return valid;
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

      // Coordinate arithmetic
      const x1 = from % 8;
      const y1 = Math.floor(from / 8);
      const x2 = to % 8;
      const y2 = Math.floor(to / 8);

      const dx = Math.abs(x1 - x2);
      const dy = Math.abs(y1 - y2);

      // Rule 1: Orthogonal move (Slide) - Distance of 1
      const isSlide = dx + dy === 1;

      // Rule 2: Jump logic (Fundamental for Ugolki) - Distance of 2 over a piece
      // TODO: add chain jumps in future iterations
      let isJump = false;
      if ((dx === 2 && dy === 0) || (dx === 0 && dy === 2)) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const midIndex = midY * 8 + midX;
        if (G.cells[midIndex] !== null) {
          isJump = true;
        }
      }

      if (!isSlide && !isJump) return INVALID_MOVE;

      // Execute move
      G.cells[to] = G.cells[from];
      G.cells[from] = null;
      G.lastMove = { from, to };
    },
  },
};
