import { useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';

// Simple checkerboard styling
const cellStyle = {
  width: '50px', height: '50px', border: '1px solid #333',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  cursor: 'pointer'
};

export const MukoBoard = ({ G, moves }: BoardProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  const onClick = (id: number) => {
    if (selected === null) {
      // Select a piece
      if (G.cells[id] !== null) setSelected(id);
    } else {
      // Move to target
      moves.movePiece(selected, id);
      setSelected(null);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 50px)' }}>
      {G.cells.map((cell: string | null, id: number) => (
        <div 
          key={id} 
          style={{
            ...cellStyle,
            backgroundColor: (Math.floor(id / 8) + id) % 2 === 0 ? '#f0d9b5' : '#b58863', // Chess colors
            border: selected === id ? '4px solid lime' : '1px solid #333'
          }}
          onClick={() => onClick(id)}
        >
          {cell && <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            // '0' is White, '1' is Black
            backgroundColor: cell === '0' ? 'white' : 'black',
            border: '2px solid grey',
            boxShadow: '0 0 2px black'
          }} />}
        </div>
      ))}
    </div>
  );
};