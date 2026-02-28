import { useState } from "react";
import { FaBug } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../config";
import whitePiece from "../assets/piece-3d-white.svg";
import blackPiece from "../assets/piece-3d-black.svg";

const LobbyView = () => {
  const navigate = useNavigate();
  const [joinID, setJoinID] = useState("");

  const createMatch = async (mode: "3x3" | "3x4" = "3x3", debug = false) => {
    try {
      const response = await axios.post(`${SERVER_URL}/games/muko/create`, {
        numPlayers: 2,
        setupData: { mode, ...(debug ? { debug: true } : {}) },
      });
      navigate(`/play/${response.data.matchID}`);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const joinMatch = () => {
    if (joinID.trim()) navigate(`/play/${joinID.trim().toUpperCase()}`);
  };

  return (
    <div className="text-center mt-[50px]">
      <button
        onClick={() => createMatch("3x3", true)}
        className="btn-modern absolute top-2.5 right-2.5 text-[0.75rem]! opacity-40 hover:opacity-100 m-0!"
      >
        <FaBug size={14} />
      </button>

      <div className="flex items-center justify-center gap-3 mb-10">
        <img src={whitePiece} className="w-15 h-15" />
        <h1
          className="text-7xl m-0"
          style={{
            fontFamily: "Rakkas",
            background:
              "linear-gradient(to top, var(--primary-btn) 0%, var(--primary-btn) 57%, var(--color-text-bright) 57%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            WebkitTextStroke: "0.5px var(--color-text-bright)",
          }}
        >
          Müko
        </h1>
        <img src={blackPiece} className="w-15 h-15" />
      </div>

      <div className="mb-5 flex gap-3 justify-center">
        <button
          onClick={() => createMatch("3x3")}
          className="btn-modern primary text-[1.2rem]! flex flex-col items-center leading-tight"
        >
          <span>New Game</span>
          <span className="text-[0.75rem] opacity-75">Standard</span>
        </button>
        <button
          onClick={() => createMatch("3x4")}
          className="btn-modern primary text-[1.2rem]! flex flex-col items-center leading-tight"
        >
          <span>New Game</span>
          <span className="text-[0.75rem] opacity-75">Duygu Variant</span>
        </button>
      </div>

      <hr className="w-48 mx-auto border-border" />

      <div className="mt-5">
        <h3>Join a Game</h3>
        <input
          type="text"
          placeholder="Enter Game Code"
          value={joinID}
          onChange={(e) => setJoinID(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && joinMatch()}
          className="px-2 py-2 text-base bg-surface text-text-bright border border-border rounded uppercase"
        />
        <button onClick={joinMatch} className="btn-modern">
          Join
        </button>
      </div>
    </div>
  );
};

export default LobbyView;
