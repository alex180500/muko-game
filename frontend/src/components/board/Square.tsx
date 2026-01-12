import type { ReactNode } from "react";

type SquareProps = {
  isDark: boolean;
  isSelected: boolean;
  isValidMove?: boolean; // (Optional: for later)
  lastMove?: boolean; // (Optional: for later)
  onClick: () => void;
  children?: ReactNode;
  rank?: string; // Coordinate '1'-'8'
  file?: string; // Coordinate 'a'-'h'
};

export const Square = ({
  isDark,
  isSelected,
  onClick,
  children,
  rank,
  file,
}: SquareProps) => {
  const bg = isDark ? "var(--board-dark)" : "var(--board-light)";
  const coordColor = isDark ? "var(--board-light)" : "var(--board-dark)";

  return (
    <div
      onClick={onClick}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bg,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Coordinates */}
      {rank && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            fontSize: "10px",
            fontWeight: "bold",
            color: coordColor,
          }}
        >
          {rank}
        </span>
      )}
      {file && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: 2, // Lichess style: bottom-left usually, or right
            fontSize: "10px",
            fontWeight: "bold",
            color: coordColor,
          }}
        >
          {file}
        </span>
      )}

      {/* Selection Highlight */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(20, 85, 30, 0.5)",
            boxShadow: "inset 0 0 0 4px rgba(20, 85, 30, 0.8)",
          }}
        />
      )}

      {children}
    </div>
  );
};
