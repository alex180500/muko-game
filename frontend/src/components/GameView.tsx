import { useParams, useSearchParams } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Muko } from '../Game';      // Your rules
import { MukoBoard } from '../Board'; // Your board UI

const SERVER_URL = import.meta.env.VITE_GAME_SERVER || 'http://localhost:8000';

// We create a "GameClient" component dynamically based on the match ID
const GameView = () => {
  const { matchID } = useParams();
  const [searchParams] = useSearchParams();
  
  // Default to spectator check, but for MVP allow overriding via URL
  // Usage: /play/matchID?playerID=0
  const playerID = searchParams.get("playerID") || undefined;

  // We define the Client inside the component so we can pass the specific matchID
  // In a real app, you might want to memoize this, but for simplicity:
  const MukoClient = Client({
    game: Muko,
    board: MukoBoard,
    multiplayer: SocketIO({ 
      server: SERVER_URL 
    }),
    debug: false, // Turn off the debug panel for production
  });

  return (
    <div>
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
         Match Code: <strong>{matchID}</strong>
         <br/>
         Playing as: {playerID ? `Player ${playerID}` : "Spectator"}
      </div>

      <div style={{ marginTop: 50 }}>
        {/* If no ID is provided in URL, show buttons to pick a seat */}
        {!playerID && (
           <div style={{color: 'white', textAlign: 'center'}}>
              <p>Who are you?</p>
              <a href={`/play/${matchID}?playerID=0`} style={{color: '#aaf', marginRight: 20}}>Play as White</a>
              <a href={`/play/${matchID}?playerID=1`} style={{color: '#aaf'}}>Play as Black</a>
           </div>
        )}

        {/* Pass the ID to the client */}
        <MukoClient matchID={matchID} playerID={playerID} />
      </div>
    </div>
  );
};

export default GameView;