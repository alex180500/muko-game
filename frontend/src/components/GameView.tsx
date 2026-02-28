import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { FaHome, FaCopy } from "react-icons/fa";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { Muko } from "@muko/logic";
import { MukoBoard } from "./board/Board";
import { SERVER_URL } from "../config";
import { useMatchSession } from "../lib/useMatchSession";
import SidePicker from "./SidePicker";

// --- Sub-components ---
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

// --- Main component ---
const GameView = () => {
  const { matchID } = useParams<{ matchID: string }>();
  const { state, chooseSide } = useMatchSession(matchID!);

  const MukoClient = useMemo(
    () =>
      Client({
        game: Muko,
        board: MukoBoard,
        multiplayer: SocketIO({ server: SERVER_URL }),
        debug: false,
      }),
    [],
  );

  // --- Loading ---
  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-text-bright text-lg animate-pulse">Joining match…</p>
      </div>
    );
  }

  // --- Error ---
  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
        <p className="text-red-400 text-lg">{state.message}</p>
        <Link to="/" className="btn-modern primary">
          Back to Lobby
        </Link>
      </div>
    );
  }

  // --- Choose side ---
  if (state.status === "choose") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="absolute top-2.5 left-2.5">
          <Link
            to="/"
            className="btn-modern p-2! m-0! flex items-center justify-center"
            title="Home"
          >
            <FaHome size={18} />
          </Link>
        </div>

        <h2 className="m-0">Choose your side</h2>
        <SidePicker onChoose={chooseSide} />

        <div className="flex flex-col items-center gap-2 opacity-70 text-sm">
          <p className="m-0">Share this match with your opponent:</p>
          <CopyLinkButton matchID={matchID!} />
        </div>
      </div>
    );
  }

  // --- Spectator ---
  if (state.status === "spectator") {
    return (
      <div>
        <div className="absolute top-2.5 left-2.5 flex items-center gap-4">
          <Link
            to="/"
            className="btn-modern p-2! m-0! flex items-center justify-center"
            title="Home"
          >
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

  // --- Ready (playing) ---
  const { session } = state;
  return (
    <div>
      <div className="absolute top-2.5 left-2.5 flex items-center gap-4">
        <Link
          to="/"
          className="btn-modern p-2! m-0! flex items-center justify-center"
          title="Home"
        >
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
