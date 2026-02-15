import { memo } from "react";
import whitePiece from "../../assets/piece-white.svg";
import blackPiece from "../../assets/piece-black.svg";

type PieceProps = {
  color: "0" | "1"; // '0' = White, '1' = Black
};

export const Piece = memo(({ color }: PieceProps) => {
  const src = color === "0" ? whitePiece : blackPiece;
  const altText = color === "0" ? "White Piece" : "Black Piece";

  return (
    <div className="piece-container">
      <img src={src} alt={altText} className="piece-image" />
    </div>
  );
});
