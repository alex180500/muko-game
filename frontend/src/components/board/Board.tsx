import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { BoardProps } from "boardgame.io/react";
import { getValidMoves } from "@muko/logic";
import { clearSession } from "../../lib/session";
import { useAudio } from "../../hooks/useAudio";
import { useDragDrop } from "../../hooks/useDragDrop";
import { Square } from "./Square";
import { Piece } from "./Piece";
import GameOverOverlay from "./GameOverOverlay";
import BoardToolbar from "./BoardToolbar";
import moveSound from "../../assets/Move.mp3";
import jumpSound from "../../assets/Jump.mp3";
import gameEndSound from "../../assets/GameEnd.mp3";
import "./Board.css";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const MukoBoard = ({
  G,
  ctx,
  moves,
  playerID,
  matchID,
  sendChatMessage,
  chatMessages,
}: BoardProps) => {
  const navigate = useNavigate();
  const boardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // --- Audio ---
  const { playSound, isMuted, toggleMute } = useAudio({
    move: moveSound,
    jump: jumpSound,
    gameEnd: gameEndSound,
  });

  // --- Interaction guards ---
  const canInteract = useCallback(
    (id: number) => {
      if (playerID !== null && ctx.currentPlayer !== playerID) return false;
      return G.cells[id] === ctx.currentPlayer;
    },
    [playerID, ctx.currentPlayer, G.cells],
  );

  const doMove = useCallback(
    (from: number, to: number) => {
      moves.movePiece(from, to);
    },
    [moves],
  );

  const computeValidMoves = useCallback(
    (selectedId: number) => getValidMoves(G.cells, selectedId),
    [G.cells],
  );

  // --- Drag & drop + click ---
  const {
    selected,
    dragFrom,
    dragPos,
    squareSizeRef,
    validMoves,
    onSquarePointerDown,
    onClick,
  } = useDragDrop({
    getValidMoves: computeValidMoves,
    onMove: doMove,
    canInteract,
    boardRef,
    deps: [G.cells],
  });

  // --- Flip board for player 1 ---
  useEffect(() => {
    setIsFlipped(playerID === "1");
  }, [playerID]);

  // --- Auto-navigate on rematch ---
  useEffect(() => {
    const msg = [...(chatMessages ?? [])]
      .reverse()
      .find((m) => m.payload?.type === "rematch");
    if (!msg) return;
    const newMatchID: string = msg.payload.matchID;
    clearSession(matchID);
    navigate(`/play/${newMatchID}`);
  }, [chatMessages, matchID, navigate]);

  // --- Sound effects ---
  const lastPlayedMove = useRef<string | null>(null);

  useEffect(() => {
    if (!G.lastMove) return;
    const { from, to } = G.lastMove;
    const key = `${from}-${to}`;
    if (lastPlayedMove.current === key) return;
    lastPlayedMove.current = key;
    const dx = Math.abs((from % 8) - (to % 8));
    const dy = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
    const isJump = dx > 1 || dy > 1;
    playSound(isJump ? "jump" : "move");
  }, [G.lastMove, playSound]);

  useEffect(() => {
    if (!ctx.gameover) return;
    playSound("gameEnd");
  }, [ctx.gameover, playSound]);

  // --- Rendering ---
  const getBoardIndex = (visualIdx: number) =>
    isFlipped ? 63 - visualIdx : visualIdx;

  const dragColor = dragFrom !== null ? G.cells[dragFrom] : null;
  const winner: string | undefined = ctx.gameover?.winner;

  return (
    <div className="flex flex-col items-center gap-5">
      {winner !== undefined && (
        <GameOverOverlay
          winner={winner}
          matchID={matchID}
          mode={G.mode ?? "3x3"}
          sendChatMessage={sendChatMessage}
        />
      )}

      <div
        ref={boardRef}
        className="grid grid-cols-8 grid-rows-8 rounded-lg overflow-hidden aspect-square"
        style={{ width: "min(98vw, 90vh, 700px)", touchAction: "none" }}
      >
        {Array(64)
          .fill(null)
          .map((_, visualIdx) => {
            const id = getBoardIndex(visualIdx);
            const x = visualIdx % 8;
            const y = Math.floor(visualIdx / 8);
            const isDark = (x + y) % 2 === 1;

            const rankLabel =
              x === 7 ? RANKS[7 - Math.floor(id / 8)] : undefined;
            const fileLabel = y === 7 ? FILES[id % 8] : undefined;

            return (
              <Square
                key={visualIdx}
                id={id}
                isDark={isDark}
                isSelected={selected === id}
                isValidMove={validMoves.has(id)}
                showHints={showHints}
                isLastMove={
                  G.lastMove != null &&
                  (id === G.lastMove.from || id === G.lastMove.to)
                }
                isDragging={dragFrom === id}
                onPointerDown={onSquarePointerDown}
                onClick={onClick}
                rank={rankLabel}
                file={fileLabel}
              >
                {G.cells[id] && (
                  <Piece color={G.cells[id]} isGhost={dragFrom === id} />
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

      <BoardToolbar
        onFlip={() => setIsFlipped(!isFlipped)}
        showHints={showHints}
        onToggleHints={() => setShowHints(!showHints)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </div>
  );
};
