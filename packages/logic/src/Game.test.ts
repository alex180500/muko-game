import { describe, it, expect } from "vitest";
import { Muko } from "./Game";
import { Client } from "boardgame.io/client";

describe("Muko Rules", () => {
  it("should set up the board correctly", () => {
    const client = Client({ game: Muko });
    const state = client.getState();
    if (!state) throw new Error("State is null");

    const { cells } = state.G;

    // White pieces (0): x < 3, y >= 5 — index 56 is (0, 7) bottom left
    expect(cells[56]).toBe("0");

    // Black pieces (1): x >= 5, y < 3 — index 7 is (7, 0) top right
    expect(cells[7]).toBe("1");

    // Empty center — index 35 is (3, 4)
    expect(cells[35]).toBe(null);
  });

  it("should allow sliding into empty square", () => {
    const client = Client({ game: Muko });

    // Move white piece from (2,5) index 42 to (2,4) index 34
    // Initial setup: x < 3 && y >= 5, so (2,5) is occupied and (2,4) is empty
    const from = 2 + 5 * 8; // 42
    const to = 2 + 4 * 8; // 34

    // Player 0 turn by default
    client.moves.movePiece(from, to);

    const state = client.getState();
    if (!state) throw new Error("State is null");

    const { cells } = state.G;
    expect(cells[from]).toBe(null);
    expect(cells[to]).toBe("0");
  });
});
