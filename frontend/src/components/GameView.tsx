import { useMemo, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaHome, FaCopy, FaDice } from "react-icons/fa";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import type { BoardProps } from "boardgame.io/react";
import { Muko } from "@muko/logic";
import { MukoBoard } from "../Board";
import { SERVER_URL } from "../config";
import { useMatchSession } from "../lib/useMatchSession";
import axios from "axios";
import whitePiece from "../assets/piece-white.svg";
import blackPiece from "../assets/piece-black.svg";

// ─── Sub-components ──────────────────────────────────────────────────────────

const playerLabel = (id: "0" | "1") => (id === "0" ? "White" : "Black");

function CopyLinkButton({ matchID }: { matchID: string }) {
  const url = `${window.location.origin}/play/${matchID}`;
  const copy = () => navigator.clipboard.writeText(url);
  return (
    <button
      onClick={copy}
      className="btn-modern flex items-center gap-2! text-sm!"
      title="Copy invite link"
    >
      <FaCopy size={13} />
      Copy Invite Link
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const GameView = () => {
  const { matchID } = useParams<{ matchID: string }>();
  const navigate = useNavigate();
  const { state, chooseSide } = useMatchSession(matchID!);

  // Stable ref so the board wrapper (created once in useMemo) can call
  // the latest onPlayAgain without capturing a stale closure.
  const onPlayAgainRef = useRef<() => void>(() => {});

  const onPlayAgain = useCallback(async () => {
    const mode =
      state.status === "ready" ? (state.session.mode ?? "3x3") : "3x3";
    try {
      const { data } = await axios.post(`${SERVER_URL}/games/muko/create`, {
        numPlayers: 2,
        setupData: { mode },
      });
      navigate(`/play/${data.matchID}`);
    } catch {
      console.error("Could not create new match for Play Again.");
    }
  }, [state, navigate]);

  onPlayAgainRef.current = onPlayAgain;

  // Create the boardgame.io Client once — wraps MukoBoard so onPlayAgain stays current
  const MukoClient = useMemo(() => {
    const WrappedBoard = (props: BoardProps) => (
      <MukoBoard {...props} onPlayAgain={() => onPlayAgainRef.current()} />
    );
    return Client({
      game: Muko,
      board: WrappedBoard,
      multiplayer: SocketIO({ server: SERVER_URL }),
      debug: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-text-bright text-lg animate-pulse">Joining match…</p>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
        <p className="text-red-400 text-lg">{state.message}</p>
        <Link to="/" className="btn-modern primary">Back to Lobby</Link>
      </div>
    );
  }

  // ─── Choose side ───────────────────────────────────────────────────────────
  if (state.status === "choose") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="absolute top-2.5 left-2.5">
          <Link to="/" className="btn-modern p-2! m-0! flex items-center justify-center" title="Home">
            <FaHome size={18} />
          </Link>
        </div>

        <h2 className="m-0">Choose your side</h2>
        <div className="flex gap-2.5 flex-wrap justify-center">
          <button
            onClick={() => chooseSide("0")}
            className="btn-modern bg-player-white! text-surface! border-0! flex items-center gap-2! pl-3!"
          >
            <img src={whitePiece} className="w-8 h-8 shrink-0 my-[-4px]" />
            White
          </button>

          <button
            onClick={() => chooseSide(Math.random() < 0.5 ? "0" : "1")}
            className="btn-modern flex items-center"
            title="Random side"
          >
            <FaDice size={24} />
          </button>

          <button
            onClick={() => chooseSide("1")}
            className="btn-modern bg-surface-hover! text-text-bright! border! border-border-hover! flex items-center gap-2! pl-3!"
          >
            <img src={blackPiece} className="w-8 h-8 shrink-0 my-[-4px]" />
            Black
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 opacity-70 text-sm">
          <p className="m-0">Share this match with your opponent:</p>
          <CopyLinkButton matchID={matchID!} />
        </div>
      </div>
    );
  }

  // ─── Spectator ─────────────────────────────────────────────────────────────
  if (state.status === "spectator") {
    return (
      <div>
        <div className="absolute top-2.5 left-2.5 flex items-center gap-4">
          <Link to="/" className="btn-modern p-2! m-0! flex items-center justify-center" title="Home">
            <FaHome size={18} />
          </Link>
          <div className="text-text text-sm">
            Match: <strong className="text-text-bright">{matchID}</strong>
            <br />
            <span className="opacity-60">Spectator</span>
          </div>
        </div>
        <div className="mt-[50px]">
          <MukoClient matchID={matchID} playerID={undefined} />
        </div>
      </div>
    );
  }

  // ─── Ready (playing) ───────────────────────────────────────────────────────
  const { session } = state;
  return (
    <div>
      <div className="absolute top-2.5 left-2.5 flex items-center gap-4">
        <Link to="/" className="btn-modern p-2! m-0! flex items-center justify-center" title="Home">
          <FaHome size={18} />
        </Link>
        <div className="text-text text-sm">
          Match: <strong className="text-text-bright">{matchID}</strong>
          <br />
          Playing as:{" "}
          <strong className="text-text-bright">
            {playerLabel(session.playerID)}
          </strong>
        </div>
        <CopyLinkButton matchID={matchID!} />
      </div>

      <div className="mt-[50px]">
        <MukoClient
          matchID={session.matchID}
          playerID={session.playerID}
          credentials={session.playerCredentials}
        />
      </div>
    </div>
  );
};

export default GameView;
