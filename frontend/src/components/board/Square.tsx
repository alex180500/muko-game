import type { ReactNode, PointerEvent } from "react";

type SquareProps = {
  id: number;
  isDark: boolean;
  isSelected: boolean;
  isValidMove?: boolean;
  showHints?: boolean;
  isLastMove?: boolean;
  isDragging?: boolean;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>, id: number) => void;
  onClick: (id: number) => void;
  children?: ReactNode;
  rank?: string;
  file?: string;
};

export const Square = ({
  id,
  isDark,
  isSelected,
  isValidMove = false,
  showHints = false,
  isLastMove = false,
  isDragging = false,
  onPointerDown,
  onClick,
  children,
  rank,
  file,
}: SquareProps) => {
  const squareClass = [
    "square",
    isDark ? "dark" : "light",
    isLastMove ? "last-move" : "",
    isSelected ? "selected" : "",
    isValidMove ? "valid-move" : "",
    isDragging ? "dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const coordClass = `square-coord ${isDark ? "light-text" : "dark-text"}`;

  return (
    <div
      className={squareClass}
      data-square-id={id}
      onPointerDown={onPointerDown ? (e) => onPointerDown(e, id) : undefined}
      onClick={() => onClick(id)}
    >
      {rank && <span className={coordClass}>{rank}</span>}
      {file && (
        <span className={`${coordClass} top-auto! bottom-0.5 right-auto! left-0.5`}>
          {file}
        </span>
      )}
      {isValidMove && showHints && !children && <span className="valid-dot" />}
      {isValidMove && showHints && children && <span className="valid-ring" />}
      {children}
    </div>
  );
};
