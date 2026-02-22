import { useState, useEffect, useMemo, useRef } from "react";
import {
  FaDice,
  FaEye,
  FaEyeSlash,
  FaRetweet,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { BoardProps } from "boardgame.io/react";
import { Square } from "./components/board/Square";
import { Piece } from "./components/board/Piece";
import { getValidMoves } from "@muko/logic";
import { SERVER_URL } from "./config";
import { clearSession, saveSession } from "./lib/session";
import { getClientID } from "./lib/identity";
import "./components/board/Board.css";
import moveSound from "./assets/Move.mp3";
import jumpSound from "./assets/Jump.mp3";
import gameEndSound from "./assets/GameEnd.mp3";
import whitePiece from "./assets/piece-white.svg";
import blackPiece from "./assets/piece-black.svg";

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

  // Auto-navigate both players when a rematch is signalled via chat
  useEffect(() => {
    const msg = [...(chatMessages ?? [])]
      .reverse()
      .find((m) => m.payload?.type === "rematch");
    if (!msg) return;
    const newMatchID: string = msg.payload.matchID;
    clearSession(matchID); // drop credentials for the finished game
    navigate(`/play/${newMatchID}`);
  }, [chatMessages, matchID, navigate]);
  const [selected, setSelected] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // "idle"    → show Play Again / Back to Lobby
  // "choosing" → show side-picker; picking a side creates the match + broadcasts
  const [rematchPhase, setRematchPhase] = useState<"idle" | "choosing">("idle");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const squareSizeRef = useRef<number>(75);
  const dragStartRef = useRef<{ id: number; x: number; y: number } | null>(
    null,
  );
  const DRAG_THRESHOLD = 6;
  const audioCtx = useRef<AudioContext | null>(null);
  const sfxBuffers = useRef<Record<string, AudioBuffer | null>>({
    move: null,
    jump: null,
    gameEnd: null,
  });

  // Pre-decode all audio on mount for zero-latency playback
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtx.current = ctx;
    const load = (url: string, key: string) =>
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => ctx.decodeAudioData(b))
        .then((b) => (sfxBuffers.current[key] = b));
    load(moveSound, "move");
    load(jumpSound, "jump");
    load(gameEndSound, "gameEnd");
    return () => {
      ctx.close();
    };
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
    () =>
      selected !== null ? new Set(getValidMoves(G.cells, selected)) : new Set(),
    [selected, G.cells],
  );

  useEffect(() => {
    setIsFlipped(playerID === "1");
  }, [playerID]);

  const lastPlayedMove = useRef<string | null>(null);

  // Play sound on each move
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
      const targetId = squareEl
        ? Number(squareEl.getAttribute("data-square-id"))
        : null;

      if (
        targetId !== null &&
        targetId !== dragFrom &&
        validMoves.has(targetId)
      ) {
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
    if (boardRef.current)
      squareSizeRef.current = boardRef.current.offsetWidth / 8;
    // Don't start drag yet — wait for movement past threshold
    dragStartRef.current = { id, x: e.clientX, y: e.clientY };
  };

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
  const winner: string | undefined = ctx.gameover?.winner;

  return (
    <div className="flex flex-col items-center gap-5">
      {winner !== undefined && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-xl px-5 py-5 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="text-4xl">🏆</div>
            <h2 className="text-text-bright text-2xl font-bold m-0">
              {winner === "0" ? "White wins!" : "Black wins!"}
            </h2>

            {rematchPhase === "idle" ? (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setRematchPhase("choosing")}
                  className="btn-modern primary"
                >
                  Play Again
                </button>
                <a href="/" className="btn-modern">
                  Back to Lobby
                </a>
              </div>
            ) : (
              // Side-picker: choosing a side creates the match and broadcasts to the other player
              <div className="flex flex-col items-center gap-3 mt-2">
                <p className="m-0 text-sm opacity-70">Pick your side for the rematch:</p>
                <div className="flex gap-2.5">
                  {([
                    { side: "0" as const, label: "White", img: whitePiece, cls: "btn-modern bg-player-white! text-surface! border-0! flex items-center gap-2! pl-3!" },
                    { side: (Math.random() < 0.5 ? "0" : "1") as "0" | "1", label: null, img: null, cls: "btn-modern flex items-center" },
                    { side: "1" as const, label: "Black", img: blackPiece, cls: "btn-modern bg-surface-hover! text-text-bright! border! border-border-hover! flex items-center gap-2! pl-3!" },
                  ] as const).map(({ side, label, img, cls }, i) => (
                    <button
                      key={i}
                      className={cls}
                      onClick={async () => {
                        try {
                          const mode = G.mode ?? "3x3";
                          // Create new match
                          const { data: created } = await axios.post(
                            `${SERVER_URL}/games/muko/create`,
                            { numPlayers: 2, setupData: { mode } },
                          );
                          const newMatchID: string = created.matchID;
                          // Join the chosen seat so arriving at the new URL skips the picker
                          const clientID = getClientID();
                          const { data: joined } = await axios.post(
                            `${SERVER_URL}/games/muko/${newMatchID}/join`,
                            { playerID: Number(side), playerName: `player-${clientID.slice(0, 6)}` },
                          );
                          saveSession({
                            matchID: newMatchID,
                            playerID: side,
                            playerCredentials: joined.playerCredentials,
                            clientID,
                            mode,
                          });
                          // Broadcast: the other player auto-navigates and auto-joins the open seat
                          sendChatMessage({ type: "rematch", matchID: newMatchID });
                          clearSession(matchID);
                          navigate(`/play/${newMatchID}`);
                        } catch {
                          console.error("Could not create rematch.");
                          setRematchPhase("idle");
                        }
                      }}
                    >
                      {img && <img src={img} className="w-8 h-8 shrink-0 my-[-4px]" />}
                      {label ?? <FaDice size={24} />}
                    </button>
                  ))}
                </div>
                <button
                  className="text-sm opacity-50 hover:opacity-80 underline bg-transparent border-0 cursor-pointer"
                  onClick={() => setRematchPhase("idle")}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
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

      <div className="flex gap-2.5">
        <button
          className="btn-modern flex items-center gap-2!"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <FaRetweet size={14} />
          Flip Board
        </button>
        <button
          className="btn-modern flex items-center gap-2!"
          onClick={() => setShowHints(!showHints)}
        >
          {showHints ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          Hints
        </button>
        <button
          className="btn-modern flex items-center gap-2!"
          onClick={() => {
            const next = !isMuted;
            setIsMuted(next);
            isMutedRef.current = next;
          }}
        >
          {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
        </button>
      </div>
    </div>
  );
};
