import { useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { FaHome, FaDice } from "react-icons/fa";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { Muko } from "@muko/logic";
import { MukoBoard } from "../Board";
import { SERVER_URL } from "../config";

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
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <Link
          to="/"
          className="btn-modern"
          style={{
            padding: "8px",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Home"
        >
          <FaHome size={18} />
        </Link>

        <div>
          Match Code: <strong>{matchID}</strong>
          <br />
          Playing as:{" "}
          <strong>{playerID ? `Player ${playerID}` : "Spectator"}</strong>
        </div>
      </div>

      <div style={{ marginTop: 50 }}>
        {/* If no ID is provided in URL, show buttons to pick a seat */}
        {!playerID && (
          <div
            style={{
              color: "white",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "0px",
              marginTop: "20px",
              marginBottom: "20px",
              alignItems: "center",
            }}
          >
            <h2>Choose your side</h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Link
                to={`/play/${matchID}?playerID=0`}
                className="btn-modern"
                style={{
                  backgroundColor: "#e0e0e0",
                  color: "#333",
                  border: "none",
                }}
              >
                Play as White
              </Link>

              <Link
                to={`/play/${matchID}?playerID=${Math.random() < 0.5 ? "0" : "1"}`}
                className="btn-modern"
                style={{ padding: "10px 15px", display: "flex", alignItems: "center" }}
              >
                <FaDice size={24} />
              </Link>

              <Link
                to={`/play/${matchID}?playerID=1`}
                className="btn-modern"
                style={{
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                }}
              >
                Play as Black
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
