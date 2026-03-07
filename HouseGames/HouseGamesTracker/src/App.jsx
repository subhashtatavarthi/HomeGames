import React, { useState } from 'react';
import Phase10ScoreSheet from './components/Phase10ScoreSheet';
import SkullKingScoreSheet from './components/SkullKingScoreSheet';
import RummyScoreSheet from './components/RummyScoreSheet';

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
          <option value="rummy201">Rummy (201 Points)</option>
          <option value="rummy251">Rummy (251 Points)</option>
        </select>
      </div>

      {selectedGame === 'phase10' && <Phase10ScoreSheet />}
      {selectedGame === 'skullking' && <SkullKingScoreSheet />}
      {selectedGame === 'rummy201' && <RummyScoreSheet targetScore={201} initialDrop={20} middleDrop={40} />}
      {selectedGame === 'rummy251' && <RummyScoreSheet targetScore={251} initialDrop={25} middleDrop={50} />}
    </div>
  );
}

export default App;
