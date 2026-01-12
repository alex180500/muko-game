import { BrowserRouter, Routes, Route } from "react-router-dom";
import LobbyView from "./components/LobbyView";
import GameView from "./components/GameView";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Menu Screen */}
        <Route path="/" element={<LobbyView />} />

        {/* The Game Screen (URL will be /play/matchID) */}
        <Route path="/play/:matchID" element={<GameView />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
