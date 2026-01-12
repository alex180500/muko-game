import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// The URL of your Render backend
const SERVER_URL = import.meta.env.VITE_GAME_SERVER || "http://localhost:8000";

const LobbyView = () => {
  const navigate = useNavigate();
  const [joinID, setJoinID] = useState("");

  // 1. CREATE A NEW MATCH
  const createMatch = async () => {
    try {
      // boardgame.io standard API endpoint for creating matches
      const response = await axios.post(`${SERVER_URL}/games/muko/create`, {
        numPlayers: 2,
      });
      // The server returns a matchID
      navigate(`/play/${response.data.matchID}`);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  // 2. JOIN AN EXISTING MATCH
  const joinMatch = () => {
    if (joinID) {
      navigate(`/play/${joinID}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Müko Online</h1>

      <div style={{ marginBottom: "40px" }}>
        <button
          onClick={createMatch}
          style={{
            padding: "10px 20px",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          Create New Game (Host)
        </button>
      </div>

      <hr style={{ width: "200px" }} />

      <div style={{ marginTop: "40px" }}>
        <h3>Join a Game</h3>
        <input
          type="text"
          placeholder="Enter Game Code"
          value={joinID}
          onChange={(e) => setJoinID(e.target.value)}
          style={{ padding: "8px", fontSize: "1rem" }}
        />
        <button
          onClick={joinMatch}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default LobbyView;
