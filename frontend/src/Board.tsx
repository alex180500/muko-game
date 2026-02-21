import { useState, useEffect, useMemo, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import { Square } from "./components/board/Square";
import { Piece } from "./components/board/Piece";
import { getValidMoves } from "@muko/logic";
import "./components/board/Board.css";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const MukoBoard = ({ G, ctx, moves, playerID }: BoardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const squareSizeRef = useRef<number>(75);

  const validMoves = useMemo<Set<number>>(
    () => (selected !== null ? new Set(getValidMoves(G.cells, selected)) : new Set()),
    [selected, G.cells]
  );

  useEffect(() => {
    setIsFlipped(playerID === "1");
  }, [playerID]);

  // Global pointer handlers for drag
  useEffect(() => {
    if (dragFrom === null) return;

    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
    };

    const onUp = (e: PointerEvent) => {
      // Find the square element under the cursor (drag piece has pointer-events:none)
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      const squareEl = els.find((el) => el.hasAttribute("data-square-id"));
      const targetId = squareEl ? Number(squareEl.getAttribute("data-square-id")) : null;

      if (targetId !== null && targetId !== dragFrom && validMoves.has(targetId)) {
        moves.movePiece(dragFrom, targetId);
        setSelected(null);
      } else if (targetId === dragFrom) {
        // Released on same square — keep selected for click-click workflow
      } else {
        setSelected(null);
      }

      setDragFrom(null);
      setDragPos(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragFrom, validMoves, moves]);

  const onSquarePointerDown = (e: React.PointerEvent, id: number) => {
    if (playerID !== null && ctx.currentPlayer !== playerID) return;
    if (G.cells[id] !== ctx.currentPlayer) return;
    e.preventDefault();
    if (boardRef.current) squareSizeRef.current = boardRef.current.offsetWidth / 8;
    setSelected(id);
    setDragFrom(id);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const onClick = (id: number) => {
    // Ignore clicks that were the end of a drag (dragFrom was just cleared)
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
      } else if (validMoves.has(id)) {
        moves.movePiece(selected, id);
        setSelected(null);
      } else {
        setSelected(null);
      }
    }
  };

  const getBoardIndex = (visualIdx: number) =>
    isFlipped ? 63 - visualIdx : visualIdx;

  const dragColor = dragFrom !== null ? G.cells[dragFrom] : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={boardRef}
        className="grid grid-cols-8 grid-rows-8 border-[5px] border-board-border rounded-sm aspect-square"
        style={{ width: "min(95vw, 90vh, 600px)", touchAction: "none" }}
      >
        {Array(64)
          .fill(null)
          .map((_, visualIdx) => {
            const id = getBoardIndex(visualIdx);
            const x = visualIdx % 8;
            const y = Math.floor(visualIdx / 8);
            const isDark = (x + y) % 2 === 1;

            const rankLabel = x === 7 ? RANKS[7 - Math.floor(id / 8)] : undefined;
            const fileLabel = y === 7 ? FILES[id % 8] : undefined;

            return (
              <Square
                key={visualIdx}
                id={id}
                isDark={isDark}
                isSelected={selected === id}
                isValidMove={validMoves.has(id)}
                isLastMove={G.lastMove != null && (id === G.lastMove.from || id === G.lastMove.to)}
                isDragging={dragFrom === id}
                onPointerDown={onSquarePointerDown}
                onClick={onClick}
                rank={rankLabel}
                file={fileLabel}
              >
                {G.cells[id] && (
                  <Piece
                    color={G.cells[id]}
                    isGhost={dragFrom === id}
                  />
                )}
              </Square>
            );
          })}
      </div>

      {/* Floating drag piece */}
      {dragFrom !== null && dragPos !== null && dragColor && (
        <Piece
          color={dragColor as "0" | "1"}
          style={{
            position: "fixed",
            left: dragPos.x - squareSizeRef.current / 2,
            top: dragPos.y - squareSizeRef.current / 2,
            width: squareSizeRef.current,
            height: squareSizeRef.current,
            pointerEvents: "none",
            zIndex: 1000,
            cursor: "grabbing",
          }}
        />
      )}

      <div className="flex gap-2.5">
        <button className="btn-modern" onClick={() => setIsFlipped(!isFlipped)}>
          Flip Board
        </button>
      </div>
    </div>
  );
};
