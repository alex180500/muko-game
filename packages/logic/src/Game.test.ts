import { describe, it, expect } from "vitest";
import { Muko } from "./Game";
import { Client } from "boardgame.io/client";

describe("Muko Rules", () => {
  it("should set up the board correctly", () => {
    const client = Client({ game: Muko });
    // client.start(); // Ensure client is started (synchronous for local)
    const state = client.getState();
    if (!state) throw new Error("State is null");
    
    const { cells } = state.G;

    // Check White pieces (0)
    // x < 3, y >= 5
    // index 56 is (0, 7) bottom left
    expect(cells[56]).toBe("0");

    // Check Black pieces (1)
    // x >= 5, y < 3
    // index 7 is (7, 0) top right
    expect(cells[7]).toBe("1");

    // Check empty center
    // index 35 (3, 4)
    expect(cells[35]).toBe(null);
  });

  it("should allow sliding into empty square", () => {
    const client = Client({ game: Muko });
    
    // Attempt move a white piece from (2,5) -> index 42 to (2,4) -> index 34
    // Wait, initial Setup: x < 3 && y >= 5.
    // (2,5) matches.
    // (2,4) is empty.
    const from = 2 + 5 * 8; // 42
    const to = 2 + 4 * 8;   // 34
    
    // Player 0 turn by default
    client.moves.movePiece(from, to);

    const state = client.getState();
    if (!state) throw new Error("State is null");
    
    const { cells } = state.G;
    expect(cells[from]).toBe(null);
    expect(cells[to]).toBe("0");
  });
});
