import { FaDice } from "react-icons/fa";
import whitePiece from "../assets/piece-white.svg";
import blackPiece from "../assets/piece-black.svg";

interface SidePickerProps {
  onChoose: (side: "0" | "1") => void;
}

const SidePicker = ({ onChoose }: SidePickerProps) => {
  return (
    <div className="flex gap-2.5 flex-wrap justify-center">
      <button
        onClick={() => onChoose("0")}
        className="btn-modern bg-player-white! text-surface! border-0! flex items-center gap-2! pl-3!"
      >
        <img src={whitePiece} className="w-8 h-8 shrink-0 my-[-4px]" />
        White
      </button>

      <button
        onClick={() => onChoose(Math.random() < 0.5 ? "0" : "1")}
        className="btn-modern flex items-center"
        title="Random side"
      >
        <FaDice size={24} />
      </button>

      <button
        onClick={() => onChoose("1")}
        className="btn-modern bg-surface-hover! text-text-bright! border! border-border-hover! flex items-center gap-2! pl-3!"
      >
        <img src={blackPiece} className="w-8 h-8 shrink-0 my-[-4px]" />
        Black
      </button>
    </div>
  );
};

export default SidePicker;
