import type { Game } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

export const Muko: Game = {
  name: "muko",

  setup: () => ({
    // 8x8 chessboard. 0 = empty, '0' = Player 0 (White), '1' = Player 1 (Black)
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
  }),

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
    },
  },
};
