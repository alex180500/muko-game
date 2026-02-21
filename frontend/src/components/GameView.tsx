import { useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { FaHome, FaDice } from "react-icons/fa";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { Muko } from "@muko/logic";
import { MukoBoard } from "../Board";
import { SERVER_URL } from "../config";
import whitePiece from "../assets/piece-white.svg";
import blackPiece from "../assets/piece-black.svg";

const GameView = () => {
  const { matchID } = useParams();
  const [searchParams] = useSearchParams();
  const playerID = searchParams.get("playerID") || undefined;

  const MukoClient = useMemo(
    () =>
      Client({
        game: Muko,
        board: MukoBoard,
        multiplayer: SocketIO({ server: SERVER_URL }),
        debug: false,
      }),
    []
  );

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
          Match Code: <strong className="text-text-bright">{matchID}</strong>
          <br />
          Playing as:{" "}
          <strong className="text-text-bright">
            {playerID ? `Player ${playerID}` : "Spectator"}
          </strong>
        </div>
      </div>

      <div className="mt-[50px]">
        {/* If no ID is provided in URL, show buttons to pick a seat */}
        {!playerID && (
          <div className="text-center flex flex-col my-5 items-center">
            <h2>Choose your side</h2>
            <div className="flex gap-2.5 flex-wrap justify-center">
              <Link
                to={`/play/${matchID}?playerID=0`}
                className="btn-modern bg-player-white! text-surface! border-0! flex items-center gap-2! pl-3!"
              >
                <img src={whitePiece} className="w-8 h-8 shrink-0 my-[-4px]" />
                White
              </Link>

              <Link
                to={`/play/${matchID}?playerID=${Math.random() < 0.5 ? "0" : "1"}`}
                className="btn-modern flex items-center"
              >
                <FaDice size={24} />
              </Link>

              <Link
                to={`/play/${matchID}?playerID=1`}
                className="btn-modern bg-surface-hover! text-text-bright! border! border-border-hover! flex items-center gap-2! pl-3!"
              >
                <img src={blackPiece} className="w-8 h-8 shrink-0 my-[-4px]" />
                Black
              </Link>
            </div>
          </div>
        )}

        {/* Pass the ID to the client */}
        <MukoClient matchID={matchID} playerID={playerID} />
      </div>
    </div>
  );
};

export default GameView;
