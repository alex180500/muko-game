import { FaDice } from "react-icons/fa";
import whitePiece from "../assets/piece-white.svg";
import blackPiece from "../assets/piece-black.svg";

interface SidePickerProps {
  onChoose: (side: "0" | "1") => void;
  // If a seat is already taken, that button is disabled.
  takenSeat?: "0" | "1";
}

const SidePicker = ({ onChoose, takenSeat }: SidePickerProps) => {
  const whiteTaken = takenSeat === "0";
  const blackTaken = takenSeat === "1";

  const handleRandom = () => {
    // If one seat is taken, always pick the available one.
    if (whiteTaken) { onChoose("1"); return; }
    if (blackTaken) { onChoose("0"); return; }
    onChoose(Math.random() < 0.5 ? "0" : "1");
  };

  return (
    <div className="flex gap-2.5 flex-wrap justify-center">
      <button
        onClick={() => onChoose("0")}
        disabled={whiteTaken}
        className="btn-modern bg-player-white! text-surface! border-0! flex items-center gap-2! pl-3! disabled:opacity-40 disabled:cursor-not-allowed"
        title={whiteTaken ? "This seat is already taken" : undefined}
      >
        <img src={whitePiece} className="w-8 h-8 shrink-0 my-[-4px]" />
        White{whiteTaken && <span className="text-xs opacity-70 ml-1">(taken)</span>}
      </button>

      <button
        onClick={handleRandom}
        disabled={whiteTaken && blackTaken}
        className="btn-modern flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
        title="Random side"
      >
        <FaDice size={24} />
      </button>

      <button
        onClick={() => onChoose("1")}
        disabled={blackTaken}
        className="btn-modern bg-surface-hover! text-text-bright! border! border-border-hover! flex items-center gap-2! pl-3! disabled:opacity-40 disabled:cursor-not-allowed"
        title={blackTaken ? "This seat is already taken" : undefined}
      >
        <img src={blackPiece} className="w-8 h-8 shrink-0 my-[-4px]" />
        Black{blackTaken && <span className="text-xs opacity-70 ml-1">(taken)</span>}
      </button>
    </div>
  );
};

export default SidePicker;
