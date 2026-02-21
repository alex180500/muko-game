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
  const squareClass = ["square", isDark ? "dark" : "light", isSelected ? "selected" : ""]
    .filter(Boolean)
    .join(" ");
  const coordClass = `square-coord ${isDark ? "light-text" : "dark-text"}`;

  return (
    <div className={squareClass} onClick={() => onClick(id)}>
      {rank && <span className={coordClass}>{rank}</span>}
      {file && (
        <span className={`${coordClass} top-auto! bottom-0.5 right-auto! left-0.5`}>
          {file}
        </span>
      )}
      {children}
    </div>
  );
};
