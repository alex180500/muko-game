import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../config";

const LobbyView = () => {
  const navigate = useNavigate();
  const [joinID, setJoinID] = useState("");

  const createMatch = async () => {
    try {
      const response = await axios.post(`${SERVER_URL}/games/muko/create`, {
        numPlayers: 2,
      });
      navigate(`/play/${response.data.matchID}`);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const joinMatch = () => {
    if (joinID) navigate(`/play/${joinID}`);
  };

  return (
    <div className="text-center mt-[50px]">
      <h1>Müko Online</h1>

      <div className="mb-10">
        <button onClick={createMatch} className="btn-modern primary text-[1.2rem]!">
          Create New Game (Host)
        </button>
      </div>

      <hr className="w-48 mx-auto border-border" />

      <div className="mt-10">
        <h3>Join a Game</h3>
        <input
          type="text"
          placeholder="Enter Game Code"
          value={joinID}
          onChange={(e) => setJoinID(e.target.value)}
          className="px-2 py-2 text-base bg-surface text-text-bright border border-border rounded"
        />
        <button onClick={joinMatch} className="btn-modern">
          Join
        </button>
      </div>
    </div>
  );
};

export default LobbyView;
