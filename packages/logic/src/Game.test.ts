import { describe, it, expect } from "vitest";
import { Muko, getValidMoves, BOARD_SIZE, MODES } from "./Game";
import { Client } from "boardgame.io/client";

// --- Board setup ---
describe("Board setup", () => {
  it("places the correct number of pieces in 3x3 mode", () => {
    const client = Client({ game: Muko });
    const cells: (string | null)[] = client.getState()!.G.cells;
    expect(cells.filter((c) => c === "0").length).toBe(MODES["3x3"].pieceCount);
    expect(cells.filter((c) => c === "1").length).toBe(MODES["3x3"].pieceCount);
  });

  it("places the correct number of pieces in 3x4 mode", () => {
    // Call setup directly — boardgame.io Client doesn't easily accept setupData in tests
    const state = Muko.setup!({} as never, { mode: "3x4" });
    const cells: (string | null)[] = state.cells;
    expect(cells.filter((c) => c === "0").length).toBe(MODES["3x4"].pieceCount);
    expect(cells.filter((c) => c === "1").length).toBe(MODES["3x4"].pieceCount);
  });

  it("has 64 cells total", () => {
    const client = Client({ game: Muko });
    expect(client.getState()!.G.cells).toHaveLength(BOARD_SIZE * BOARD_SIZE);
  });

  it("starts with no lastMove", () => {
    const client = Client({ game: Muko });
    expect(client.getState()!.G.lastMove).toBeNull();
  });
});

// --- Move validation ---
describe("Move validation", () => {
  it("allows a slide into the adjacent empty square", () => {
    const client = Client({ game: Muko });
    // White piece at (2,5) = index 42 can slide up to (2,4) = index 34
    const from = 2 + 5 * 8; // 42
    const to = 2 + 4 * 8; // 34
    client.moves.movePiece(from, to);
    const { cells } = client.getState()!.G;
    expect(cells[from]).toBeNull();
    expect(cells[to]).toBe("0");
  });

  it("rejects a move to an occupied square", () => {
    const client = Client({ game: Muko });
    const stateBefore = client.getState()!.G.cells.slice();
    // (0,7) = index 56 (white) — try to move to (1,7) = 57 (also white)
    client.moves.movePiece(56, 57);
    expect(client.getState()!.G.cells).toEqual(stateBefore);
  });

  it("rejects moving the opponent's piece", () => {
    const client = Client({ game: Muko });
    const stateBefore = client.getState()!.G.cells.slice();
    // Black piece at index 7 — it's player 0's turn
    client.moves.movePiece(7, 6);
    expect(client.getState()!.G.cells).toEqual(stateBefore);
  });

  it("rejects moving to a non-adjacent non-jump square", () => {
    const client = Client({ game: Muko });
    const stateBefore = client.getState()!.G.cells.slice();
    // Try to "teleport" white piece at 56 to 0 (far corner)
    client.moves.movePiece(56, 0);
    expect(client.getState()!.G.cells).toEqual(stateBefore);
  });

  it("records lastMove after a valid move", () => {
    const client = Client({ game: Muko });
    const from = 2 + 5 * 8; // 42
    const to = 2 + 4 * 8; // 34
    client.moves.movePiece(from, to);
    expect(client.getState()!.G.lastMove).toEqual({ from, to });
  });
});

// --- getValidMoves ---
describe("getValidMoves", () => {
  it("returns adjacent empty squares for an isolated piece", () => {
    // Piece alone in the center of an empty board
    const cells: (string | null)[] = Array(64).fill(null);
    cells[27] = "0"; // position (3,3)
    const moves = getValidMoves(cells, 27);
    // Can slide to (2,3)=26, (4,3)=28, (3,2)=19, (3,4)=35
    expect(new Set(moves)).toEqual(new Set([26, 28, 19, 35]));
  });

  it("includes jump destinations", () => {
    // Piece at (3,3)=27, neighbour at (3,4)=35, empty landing at (3,5)=43
    const cells: (string | null)[] = Array(64).fill(null);
    cells[27] = "0";
    cells[35] = "1"; // piece to jump over
    const moves = getValidMoves(cells, 27);
    expect(moves).toContain(43); // jump destination
  });

  it("does not allow jumping over empty squares", () => {
    const cells: (string | null)[] = Array(64).fill(null);
    cells[27] = "0";
    // No piece at (3,4)=35 — jump to (3,5)=43 should not be valid
    const moves = getValidMoves(cells, 27);
    expect(moves).not.toContain(43);
  });

  it("returns no moves for a fully surrounded piece", () => {
    const cells: (string | null)[] = Array(64).fill(null);
    // Piece at (4,4) = index 36, surrounded on all 4 sides and jump landings blocked
    cells[36] = "0"; // (4,4) — the piece
    cells[35] = "1"; // (3,4) — left neighbour
    cells[37] = "1"; // (5,4) — right neighbour
    cells[28] = "1"; // (4,3) — up neighbour
    cells[44] = "1"; // (4,5) — down neighbour
    cells[34] = "1"; // (2,4) — jump-left landing blocked
    cells[38] = "1"; // (6,4) — jump-right landing blocked
    cells[20] = "1"; // (4,2) — jump-up landing blocked
    cells[52] = "1"; // (4,6) — jump-down landing blocked
    expect(getValidMoves(cells, 36)).toHaveLength(0);
  });
});
