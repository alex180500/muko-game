import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const DRAG_THRESHOLD = 6;

interface UseDragDropOptions {
  getValidMoves: (selectedId: number) => number[];
  onMove: (from: number, to: number) => void;
  canInteract: (id: number) => boolean;
  boardRef: React.RefObject<HTMLDivElement | null>;
  /** External dependency array for recomputing valid moves (e.g. board cells) */
  deps?: unknown[];
}

export function useDragDrop({
  getValidMoves,
  onMove,
  canInteract,
  boardRef,
  deps = [],
}: UseDragDropOptions) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const squareSizeRef = useRef<number>(75);
  const dragStartRef = useRef<{ id: number; x: number; y: number } | null>(
    null,
  );

  // Compute valid moves from current selection
  const validMoves = useMemo<Set<number>>(
    () => (selected !== null ? new Set(getValidMoves(selected)) : new Set()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, ...deps],
  );

  // --- Global pointer handlers for drag ---
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (dragFrom !== null) {
        // Already dragging — update position
        setDragPos({ x: e.clientX, y: e.clientY });
      } else if (dragStartRef.current !== null) {
        // Pending — check if moved past threshold
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          setSelected(dragStartRef.current.id);
          setDragFrom(dragStartRef.current.id);
          setDragPos({ x: e.clientX, y: e.clientY });
          dragStartRef.current = null;
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      dragStartRef.current = null;
      if (dragFrom === null) return;

      // Find the square element under the cursor (drag piece has pointer-events:none)
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      const squareEl = els.find((el) => el.hasAttribute("data-square-id"));
      const targetId = squareEl
        ? Number(squareEl.getAttribute("data-square-id"))
        : null;

      if (
        targetId !== null &&
        targetId !== dragFrom &&
        validMoves.has(targetId)
      ) {
        onMove(dragFrom, targetId);
        setSelected(null);
      } else if (targetId === dragFrom) {
        // Released on same square — keep selected for click-click workflow
      } else {
        setSelected(null);
      }

      setDragFrom(null);
      setDragPos(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragFrom, validMoves, onMove]);

  const onSquarePointerDown = useCallback(
    (e: React.PointerEvent, id: number) => {
      if (!canInteract(id)) return;
      if (boardRef.current)
        squareSizeRef.current = boardRef.current.offsetWidth / 8;
      // Don't start drag yet — wait for movement past threshold
      dragStartRef.current = { id, x: e.clientX, y: e.clientY };
    },
    [canInteract, boardRef],
  );

  const onClick = useCallback(
    (id: number) => {
      if (selected === null) {
        if (canInteract(id)) setSelected(id);
      } else {
        if (id === selected) {
          setSelected(null);
        } else if (canInteract(id)) {
          setSelected(id);
        } else if (validMoves.has(id)) {
          onMove(selected, id);
          setSelected(null);
        } else {
          setSelected(null);
        }
      }
    },
    [selected, canInteract, validMoves, onMove],
  );

  return {
    selected,
    setSelected,
    dragFrom,
    dragPos,
    squareSizeRef,
    validMoves,
    onSquarePointerDown,
    onClick,
  };
}
