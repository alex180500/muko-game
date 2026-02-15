import type { ReactNode } from "react";

type SquareProps = {
  id: number;
  isDark: boolean;
  isSelected: boolean;
  isValidMove?: boolean;
  lastMove?: boolean;
  onClick: (id: number) => void;
  children?: ReactNode;
  rank?: string;
  file?: string;
};

export const Square = ({
  id,
  isDark,
  isSelected,
  onClick,
  children,
  rank,
  file,
}: SquareProps) => {
  const squareClass = `square ${isDark ? "dark" : "light"} ${
    isSelected ? "selected" : ""
  }`;
  const coordClass = `square-coord ${isDark ? "light-text" : "dark-text"}`;

  return (
    <div className={squareClass} onClick={() => onClick(id)}>
      {/* Coordinates */}
      {rank && <span className={coordClass}>{rank}</span>}
      {file && (
        <span
          className={coordClass}
          style={{ top: "auto", bottom: 2, right: "auto", left: 2 }}
        >
          {file}
        </span>
      )}

      {children}
    </div>
  );
};
