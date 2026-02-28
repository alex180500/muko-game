import type { Game } from "boardgame.io";
import { INVALID_MOVE } from "boardgame.io/core";

// BFS: returns all squares reachable via chain jumps from `from`.
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

// Returns all valid destination indices for a piece at `from` (slides + chain jumps).
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

  setup: (_, setupData?: { debug?: boolean; mode?: "3x3" | "3x4" }) => {
    const mode: "3x3" | "3x4" = setupData?.mode ?? "3x3";

    if (setupData?.debug) {
      const cells: (string | null)[] = Array(64).fill(null);
      // 3x3 debug: White: 8 pieces in target (fgh rows 6-8), 1 piece a slide away
      [4, 6, 7, 13, 14, 15, 21, 22, 23].forEach((i) => (cells[i] = "0"));
      // 3x3 debug: Black: 8 pieces in target (abc rows 1-3), 1 piece a slide away
      [32, 41, 42, 48, 49, 50, 56, 57, 58].forEach((i) => (cells[i] = "1"));
      return {
        cells,
        mode: "3x3" as const,
        lastMove: null as { from: number; to: number } | null,
      };
    }

    return {
      mode,
      // 8x8 board: null = empty, '0' = Player 0 (White), '1' = Player 1 (Black)
      cells: Array(64)
        .fill(null)
        .map((_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          if (mode === "3x4") {
            // 3x4: White in bottom-left (abc rows 1-4: x<3, y>=4), Black in top-right (fgh rows 5-8: x>=5, y<4)
            if (x < 3 && y >= 4) return "0";
            if (x >= 5 && y < 4) return "1";
          } else {
            // 3x3: White in bottom-left (abc rows 6-8: x<3, y>=5), Black in top-right (fgh rows 1-3: x>=5, y<3)
            if (x < 3 && y >= 5) return "0";
            if (x >= 5 && y < 3) return "1";
          }
          return null;
        }),
      lastMove: null as { from: number; to: number } | null,
    };
  },

  endIf: ({ G }) => {
    if (G.mode === "3x4") {
      // White wins when all 12 pieces reach fgh rows 5-8 (x>=5, y<4)
      const whiteInTarget = G.cells.filter(
        (v: string | null, i: number) =>
          v === "0" && i % 8 >= 5 && Math.floor(i / 8) < 4,
      ).length;
      if (whiteInTarget === 12) return { winner: "0" };
      // Black wins when all 12 pieces reach abc rows 1-4 (x<3, y>=4)
      const blackInTarget = G.cells.filter(
        (v: string | null, i: number) =>
          v === "1" && i % 8 < 3 && Math.floor(i / 8) >= 4,
      ).length;
      if (blackInTarget === 12) return { winner: "1" };
    } else {
      // White wins when all 9 pieces reach fgh rows 1-3 (x>=5, y<3)
      const whiteInTarget = G.cells.filter(
        (v: string | null, i: number) =>
          v === "0" && i % 8 >= 5 && Math.floor(i / 8) < 3,
      ).length;
      if (whiteInTarget === 9) return { winner: "0" };
      // Black wins when all 9 pieces reach abc rows 6-8 (x<3, y>=5)
      const blackInTarget = G.cells.filter(
        (v: string | null, i: number) =>
          v === "1" && i % 8 < 3 && Math.floor(i / 8) >= 5,
      ).length;
      if (blackInTarget === 9) return { winner: "1" };
    }
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
