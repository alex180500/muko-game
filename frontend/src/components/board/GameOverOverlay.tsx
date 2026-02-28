import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../../config";
import { getClientID } from "../../lib/identity";
import { clearSession, saveSession } from "../../lib/session";
import SidePicker from "../SidePicker";

interface GameOverOverlayProps {
  winner: string;
  matchID: string;
  mode: "3x3" | "3x4";
  sendChatMessage: (payload: Record<string, unknown>) => void;
}

const GameOverOverlay = ({
  winner,
  matchID,
  mode,
  sendChatMessage,
}: GameOverOverlayProps) => {
  const navigate = useNavigate();
  // "idle" → show Play Again / Back to Lobby
  // "choosing" → show side-picker; picking a side creates the match + broadcasts
  const [rematchPhase, setRematchPhase] = useState<"idle" | "choosing">("idle");

  const handleRematch = async (side: "0" | "1") => {
    try {
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
        {
          playerID: Number(side),
          playerName: `player-${clientID.slice(0, 6)}`,
        },
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
  };

  return (
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
          <div className="flex flex-col items-center gap-3 mt-2">
            <p className="m-0 text-sm opacity-70">
              Pick your side for the rematch:
            </p>
            <SidePicker onChoose={handleRematch} />
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
  );
};

export default GameOverOverlay;
