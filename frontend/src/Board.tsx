import { useState, useEffect, useMemo, useRef } from "react";
import { FaEye, FaEyeSlash, FaRetweet, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import type { BoardProps } from "boardgame.io/react";
import { Square } from "./components/board/Square";
import { Piece } from "./components/board/Piece";
import { getValidMoves } from "@muko/logic";
import "./components/board/Board.css";
import moveSound from "./assets/Move.mp3";
import jumpSound from "./assets/Jump.mp3";
import gameEndSound from "./assets/GameEnd.mp3";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const MukoBoard = ({ G, ctx, moves, playerID }: BoardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const squareSizeRef = useRef<number>(75);
  const dragStartRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const DRAG_THRESHOLD = 6;
  const audioCtx = useRef<AudioContext | null>(null);
  const sfxBuffers = useRef<Record<string, AudioBuffer | null>>({
    move: null, jump: null, gameEnd: null,
  });

  // Pre-decode all audio on mount for zero-latency playback
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtx.current = ctx;
    const load = (url: string) =>
      fetch(url).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b));
    load(moveSound).then((b) => (sfxBuffers.current.move = b));
    load(jumpSound).then((b) => (sfxBuffers.current.jump = b));
    load(gameEndSound).then((b) => (sfxBuffers.current.gameEnd = b));
    return () => { ctx.close(); };
  }, []);

  const isMutedRef = useRef(false);
  const playSound = (key: string) => {
    if (isMutedRef.current) return;
    const buf = sfxBuffers.current[key];
    if (!buf || !audioCtx.current) return;
    const src = audioCtx.current.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.current.destination);
    src.start(0);
  };

  const validMoves = useMemo<Set<number>>(
    () => (selected !== null ? new Set(getValidMoves(G.cells, selected)) : new Set()),
    [selected, G.cells]
  );

  useEffect(() => {
    setIsFlipped(playerID === "1");
  }, [playerID]);

  // Play sound on each move
  useEffect(() => {
    if (!G.lastMove) return;
    const { from, to } = G.lastMove;
    const dx = Math.abs((from % 8) - (to % 8));
    const dy = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
    const isJump = (dx === 2 && dy === 0) || (dx === 0 && dy === 2);
    playSound(isJump ? "jump" : "move");
  }, [G.lastMove]);

  // Play game-end sound
  useEffect(() => {
    if (!ctx.gameover) return;
    playSound("gameEnd");
  }, [ctx.gameover]);

  // Global pointer handlers for drag
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragFrom !== null) {
        // Already dragging — update position
        setDragPos({ x: e.clientX, y: e.clientY });
      } else if (dragStartRef.current !== null) {
        // Pending — check if moved past threshold
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          setSelected(dragStartRef.current.id);
          setDragFrom(dragStartRef.current.id);
          setDragPos({ x: e.clientX, y: e.clientY });
          dragStartRef.current = null;
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      dragStartRef.current = null;
      if (dragFrom === null) return;

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
    if (boardRef.current) squareSizeRef.current = boardRef.current.offsetWidth / 8;
    // Don't start drag yet — wait for movement past threshold
    dragStartRef.current = { id, x: e.clientX, y: e.clientY };
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

            const rankLabel = x === 7 ? RANKS[7 - Math.floor(id / 8)] : undefined;
            const fileLabel = y === 7 ? FILES[id % 8] : undefined;

            return (
              <Square
                key={visualIdx}
                id={id}
                isDark={isDark}
                isSelected={selected === id}
                isValidMove={validMoves.has(id)}
                showHints={showHints}
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
        <button className="btn-modern flex items-center gap-2!" onClick={() => setIsFlipped(!isFlipped)}>
          <FaRetweet size={14} />
          Flip Board
        </button>
        <button className="btn-modern flex items-center gap-2!" onClick={() => setShowHints(!showHints)}>
          {showHints ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          Hints
        </button>
        <button className="btn-modern flex items-center gap-2!" onClick={() => {
          const next = !isMuted;
          setIsMuted(next);
          isMutedRef.current = next;
        }}>
          {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
        </button>
      </div>
    </div>
  );
};
