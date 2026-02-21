import { memo } from "react";
import whitePiece from "../../assets/piece-white.svg";
import blackPiece from "../../assets/piece-black.svg";
import type { CSSProperties } from "react";

type PieceProps = {
  color: "0" | "1";
  isGhost?: boolean;
  style?: CSSProperties;
};

export const Piece = memo(({ color, isGhost = false, style }: PieceProps) => {
  const src = color === "0" ? whitePiece : blackPiece;
  const altText = color === "0" ? "White Piece" : "Black Piece";

  if (style) {
    // Floating drag piece — rendered directly without the container
    return (
      <div style={style}>
        <img src={src} alt={altText} className="piece-image" draggable={false} />
      </div>
    );
  }

  return (
    <div className="piece-container" style={isGhost ? { opacity: 0.3 } : undefined}>
      <img src={src} alt={altText} className="piece-image" draggable={false} />
    </div>
  );
});
