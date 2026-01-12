import { useState, useEffect } from 'react';
import type { BoardProps } from 'boardgame.io/react';

// Coordinates
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const MukoBoard = ({ G, ctx, moves, playerID }: BoardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  // Default: Flip if playing as Black ('1')
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(playerID === '1');
  }, [playerID]);

  const onClick = (id: number) => {
    // If not my turn, ignore (optional, but good UX)
    if (playerID !== null && ctx.currentPlayer !== playerID) return;

    if (selected === null) {
      // Select a piece
      if (G.cells[id] !== null && G.cells[id] === ctx.currentPlayer) {
        setSelected(id);
      }
    } else {
      // Check if clicking on same piece -> deselect
      if (id === selected) {
        setSelected(null);
      } 
      // Check if clicking on another own piece -> change selection
      else if (G.cells[id] === ctx.currentPlayer) {
        setSelected(id);
      }
      else {
        // Move to target
        moves.movePiece(selected, id);
        setSelected(null);
      }
    }
  };

  // Helper to map visual index (0-63) to actual board index (0-63)
  // Visual 0 is Top-Left of screen.
  const getBoardIndex = (visualIdx: number) => {
    if (!isFlipped) return visualIdx; // 0 is 0 (A8)
    return 63 - visualIdx; // 0 is 63 (H1)
  };

  // Coordinate Helpers
  const getRank = (visualIdx: number) => {
    const boardIdx = getBoardIndex(visualIdx);
    const y = Math.floor(boardIdx / 8);
    // Board Y=0 is Rank 8. Y=7 is Rank 1.
    return RANKS[7 - y];
  };

  const getFile = (visualIdx: number) => {
    const boardIdx = getBoardIndex(visualIdx);
    const x = boardIdx % 8;
    // If flipped, x=0 is visually left but actually H (idx 7)?
    // Wait. getBoardIndex handles the ID mapping.
    // If flipped, visual 0 -> real 63.
    // Real 63 is coordinate (7, 7). File H (idx 7).
    // So getFile(0) -> 'h'.
    return FILES[x];
  };

  return (
    <div className="board-container">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(8, 60px)',
        border: '5px solid #333',
        userSelect: 'none'
      }}>
        {Array(64).fill(null).map((_, visualIdx) => {
          const id = getBoardIndex(visualIdx);
          const cell = G.cells[id];
          
          const x = visualIdx % 8;
          const y = Math.floor(visualIdx / 8);
          // Standard chess coloring depends on x and y
          const isDark = (x + y) % 2 === 1;

          // Coordinate visibility
          // Rank numbers on the Right edge (x=7)
          // File letters on the Bottom edge (y=7)
          const showRank = x === 7; 
          const showFile = y === 7; 

          return (
            <div 
              key={visualIdx} 
              style={{
                width: '60px', height: '60px',
                backgroundColor: isDark ? 'var(--board-dark)' : 'var(--board-light)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer',
                position: 'relative' 
              }}
              onClick={() => onClick(id)}
            >
              {/* Coordinates */}
              {showRank && (
                <span style={{
                  position: 'absolute', top: 2, right: 2, 
                  fontSize: '10px', fontWeight: 'bold',
                  cursor: 'default',
                  color: isDark ? 'var(--board-light)' : 'var(--board-dark)'
                }}>
                  {getRank(visualIdx)}
                </span>
              )}
              {showFile && (
                <span style={{
                  position: 'absolute', bottom: 0, right: 2, 
                  fontSize: '10px', fontWeight: 'bold',
                  cursor: 'default',
                  color: isDark ? 'var(--board-light)' : 'var(--board-dark)'
                }}>
                  {getFile(visualIdx)}
                </span>
              )}

              {/* Selection Highlight */}
              {selected === id && (
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  backgroundColor: 'rgba(20, 85, 30, 0.5)',
                  border: '4px solid rgba(20, 85, 30, 0.8)'
                }} />
              )}
              
              {/* Piece */}
              {cell && (
                <div style={{
                  width: '80%', height: '80%',
                  transition: 'transform 0.2s'
                }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="45" 
                      fill={cell === '0' ? '#f0f0f0' : '#222'}
                      stroke={cell === '0' ? '#ccc' : '#000'}
                      strokeWidth="2"
                    />
                    {/* Inner bevel/shadow effect */}
                    <circle cx="50" cy="50" r="35" 
                      fill="none"
                      stroke={cell === '0' ? '#fff' : '#444'}
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="controls">
        <button className="btn-modern" onClick={() => setIsFlipped(!isFlipped)}>
          Flip Board
        </button>
      </div>
    </div>
  );
};
