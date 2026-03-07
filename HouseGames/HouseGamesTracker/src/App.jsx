import React, { useState } from 'react';
import Phase10ScoreSheet from './components/Phase10ScoreSheet';
import SkullKingScoreSheet from './components/SkullKingScoreSheet';

function App() {
  const [selectedGame, setSelectedGame] = useState('phase10');

  return (
    <div className="card">
      <h1>Game Score Tracker</h1>
      
      <div className="game-selector">
        <label htmlFor="game-select">Select Game: </label>
        <select 
          id="game-select" 
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
        >
          <option value="phase10">Phase 10</option>
          <option value="skullking">Skull King</option>
        </select>
      </div>

      {selectedGame === 'phase10' && <Phase10ScoreSheet />}
      {selectedGame === 'skullking' && <SkullKingScoreSheet />}
    </div>
  );
}

export default App;
