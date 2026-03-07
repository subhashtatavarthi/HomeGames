import React, { useState } from 'react';
import Phase10ScoreSheet from './components/Phase10ScoreSheet';
import SkullKingScoreSheet from './components/SkullKingScoreSheet';
import RummyScoreSheet from './components/RummyScoreSheet';
import LeastCountScoreSheet from './components/LeastCountScoreSheet';
import PokerLedger from './components/PokerLedger';
import HistoryDashboard from './components/HistoryDashboard';

function App() {
  const [selectedGame, setSelectedGame] = useState('phase10');

  // GLOBAL PLAYER STATE
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim() === '') return;
    const newPlayerId = Date.now().toString();
    setPlayers([...players, { id: newPlayerId, name: newPlayerName.trim() }]);
    setNewPlayerName('');
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const randomizeSeating = () => {
    setPlayers([...players].sort(() => Math.random() - 0.5));
  };

  const clearPlayers = () => {
    if (window.confirm("Are you sure you want to clear all players? Current game scores will be lost.")) {
      setPlayers([]);
    }
  };

  return (
    <div className="app-container">

      {/* LEFT COLUMN: GLOBAL PLAYER SETUP */}
      <aside className="left-sidebar">
        <h2>🎲 Player Toss</h2>
        <p className="sidebar-subtext">Add players and randomize seating order.</p>

        <div className="global-player-setup">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="New Player Name..."
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            className="global-player-input"
          />
          <button onClick={addPlayer} className="global-add-btn">Add Player</button>
        </div>

        <div className="global-player-list">
          {players.map((p, index) => (
            <div key={p.id} className="global-player-item">
              <span className="player-order-badge">{index + 1}</span>
              <span className="player-name-text">{p.name}</span>
              <button onClick={() => removePlayer(p.id)} className="remove-player-btn">×</button>
            </div>
          ))}
        </div>

        {players.length > 0 && (
          <div className="global-player-actions">
            <button onClick={randomizeSeating} className="global-randomize-btn">🎲 Randomize Seating</button>
            <button onClick={clearPlayers} className="global-clear-btn">Clear All</button>
          </div>
        )}
      </aside>

      {/* CENTER COLUMN: ACTIVE GAME */}
      <main className="center-panel card">
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
            <option value="leastcount">Least Count (7 Cards)</option>
            <option value="rummy201">Rummy (201 Points)</option>
            <option value="rummy251">Rummy (251 Points)</option>
            <option value="poker">Poker Ledger</option>
          </select>
        </div>

        <div className="active-game-container">
          {selectedGame === 'phase10' && <Phase10ScoreSheet players={players} />}
          {selectedGame === 'skullking' && <SkullKingScoreSheet players={players} />}
          {selectedGame === 'leastcount' && <LeastCountScoreSheet players={players} />}
          {selectedGame === 'rummy201' && <RummyScoreSheet players={players} targetScore={201} initialDrop={20} middleDrop={40} />}
          {selectedGame === 'rummy251' && <RummyScoreSheet players={players} targetScore={251} initialDrop={25} middleDrop={50} />}
          {selectedGame === 'poker' && <PokerLedger players={players} />}
        </div>
      </main>

      {/* RIGHT COLUMN: LEADERBOARD */}
      <aside className="right-sidebar">
        <HistoryDashboard />
      </aside>

    </div>
  );
}

export default App;
