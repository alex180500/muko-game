import {
  FaRetweet,
  FaEye,
  FaEyeSlash,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

interface BoardToolbarProps {
  onFlip: () => void;
  showHints: boolean;
  onToggleHints: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const BoardToolbar = ({
  onFlip,
  showHints,
  onToggleHints,
  isMuted,
  onToggleMute,
}: BoardToolbarProps) => {
  return (
    <div className="flex gap-2.5">
      <button className="btn-modern flex items-center gap-2!" onClick={onFlip}>
        <FaRetweet size={14} />
        Flip Board
      </button>
      <button
        className="btn-modern flex items-center gap-2!"
        onClick={onToggleHints}
      >
        {showHints ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
        Hints
      </button>
      <button
        className="btn-modern flex items-center gap-2!"
        onClick={onToggleMute}
      >
        {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
      </button>
    </div>
  );
};

export default BoardToolbar;
