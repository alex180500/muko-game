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
    <div
      style={{
        width: "80%",
        height: "80%",
        transition: "transform 0.2s",
        pointerEvents: "none", // Let clicks pass through to the square
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={src}
        alt={altText}
        style={{
          width: "100%",
          height: "100%",
          // filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))'
        }}
      />
    </div>
  );
});
