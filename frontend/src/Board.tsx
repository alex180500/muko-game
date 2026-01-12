import { useState, useEffect } from "react";
import type { BoardProps } from "boardgame.io/react";
import { Square } from "./components/board/Square";
import { Piece } from "./components/board/Piece";

// Coordinates
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const MukoBoard = ({ G, ctx, moves, playerID }: BoardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(playerID === "1");
  }, [playerID]);

  const onClick = (id: number) => {
    if (playerID !== null && ctx.currentPlayer !== playerID) return;

    if (selected === null) {
      if (G.cells[id] !== null && G.cells[id] === ctx.currentPlayer) {
        setSelected(id);
      }
    } else {
      if (id === selected) {
        setSelected(null);
      } else if (G.cells[id] === ctx.currentPlayer) {
        setSelected(id);
      } else {
        moves.movePiece(selected, id);
        setSelected(null);
      }
    }
  };

  const getBoardIndex = (visualIdx: number) => {
    return isFlipped ? 63 - visualIdx : visualIdx;
  };

  return (
    <div className="board-container">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)", // Fixed size for now, can be responsive later
          gridTemplateRows: "repeat(8, 60px)",
          border: "5px solid #333",
          borderRadius: "3px",
        }}
      >
        {Array(64)
          .fill(null)
          .map((_, visualIdx) => {
            const id = getBoardIndex(visualIdx);
            const cell = G.cells[id];

            const x = visualIdx % 8;
            const y = Math.floor(visualIdx / 8);
            const isDark = (x + y) % 2 === 1;

            // Coordinate visibility
            const showRank = x === 7;
            const showFile = y === 7;
            const rankLabel = showRank
              ? RANKS[7 - Math.floor(getBoardIndex(visualIdx) / 8)]
              : undefined;
            const fileLabel = showFile
              ? FILES[getBoardIndex(visualIdx) % 8]
              : undefined;

            // SPECIAL FIX: When flipped, rank/file logic needs specific care IF we want them to stay on the same screen edges.
            // Visual x=7 is always Right Edge.
            // Visual y=7 is always Bottom Edge.
            // The label needs to match the Square's REAL coordinate.

            return (
              <Square
                key={visualIdx}
                isDark={isDark}
                isSelected={selected === id}
                onClick={() => onClick(id)}
                rank={rankLabel}
                file={fileLabel}
              >
                {cell && <Piece color={cell} />}
              </Square>
            );
          })}
      </div>

      <div className="controls">
        <button className="btn-modern" onClick={() => setIsFlipped(!isFlipped)}>
          Flip Board
        </button>
      </div>
    </div>
  );
};
