import { useState, useEffect } from "react";
import type { BoardProps } from "boardgame.io/react";
import { Square } from "./components/board/Square";
import { Piece } from "./components/board/Piece";
import "./components/board/Board.css";

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

  const getBoardIndex = (visualIdx: number) =>
    isFlipped ? 63 - visualIdx : visualIdx;

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="grid grid-cols-8 grid-rows-8 border-[5px] border-board-border rounded-sm aspect-square"
        style={{ width: "min(95vw, 90vh, 600px)" }}
      >
        {Array(64)
          .fill(null)
          .map((_, visualIdx) => {
            const id = getBoardIndex(visualIdx);
            const x = visualIdx % 8;
            const y = Math.floor(visualIdx / 8);
            const isDark = (x + y) % 2 === 1;

            // Visual x=7 = right edge (rank), visual y=7 = bottom edge (file).
            // Labels always reflect the square's real board coordinate.
            const rankLabel = x === 7
              ? RANKS[7 - Math.floor(id / 8)]
              : undefined;
            const fileLabel = y === 7
              ? FILES[id % 8]
              : undefined;

            return (
              <Square
                key={visualIdx}
                id={id}
                isDark={isDark}
                isSelected={selected === id}
                onClick={onClick}
                rank={rankLabel}
                file={fileLabel}
              >
                {G.cells[id] && <Piece color={G.cells[id]} />}
              </Square>
            );
          })}
      </div>

      <div className="flex gap-2.5">
        <button className="btn-modern" onClick={() => setIsFlipped(!isFlipped)}>
          Flip Board
        </button>
      </div>
    </div>
  );
};
