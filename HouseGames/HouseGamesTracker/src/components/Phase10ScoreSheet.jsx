import React, { useState } from 'react';

function Phase10ScoreSheet() {
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');

    // scores is an object where key is playerId and value is an array of 10 numbers (for phases 1-10)
    const [scores, setScores] = useState({});

    const addPlayer = () => {
        if (newPlayerName.trim() === '') return;

        const newPlayerId = Date.now().toString();
        setPlayers([...players, { id: newPlayerId, name: newPlayerName.trim() }]);

        // Initialize their scores array with 0s for all 10 phases
        setScores({
            ...scores,
            [newPlayerId]: Array(10).fill(0)
        });

        setNewPlayerName('');
    };

    const resetGame = () => {
        if (window.confirm("Are you sure you want to clear all players and start a new game?")) {
            setPlayers([]);
            setScores({});
        }
    };

    const updateScore = (playerId, phaseIndex, value) => {
        const numValue = value === '' ? 0 : parseInt(value, 10);

        setScores(prevScores => {
            const newPlayerScores = [...prevScores[playerId]];
            newPlayerScores[phaseIndex] = isNaN(numValue) ? 0 : numValue;
            return {
                ...prevScores,
                [playerId]: newPlayerScores
            };
        });
    };

    const calculateTotal = (playerId) => {
        return scores[playerId].reduce((acc, curr) => acc + curr, 0);
    };

    const randomizeSeating = () => {
        setPlayers([...players].sort(() => Math.random() - 0.5));
    };

    const saveMatch = () => {
        if (players.length === 0) return;

        let minScore = Infinity;
        const playerTotals = players.map(p => {
            const total = calculateTotal(p.id);
            if (total < minScore) minScore = total;
            return { name: p.name, score: total };
        });

        const winners = playerTotals.filter(p => p.score === minScore);

        const match = {
            id: Date.now(),
            game: 'Phase 10',
            date: new Date().toLocaleDateString(),
            players: playerTotals,
            winners: winners
        };

        const existing = JSON.parse(localStorage.getItem('houseGamesHistory') || '[]');
        localStorage.setItem('houseGamesHistory', JSON.stringify([...existing, match]));

        alert("Match saved successfully to the Leaderboard!");
    };

    return (
        <div>
            <h2>Phase 10 Tracker</h2>
            <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>Lowest score wins!</p>

            <div className="player-setup">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="New Player Name..."
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                />
                <button onClick={addPlayer}>Add Player</button>
                {players.length > 0 && (
                    <>
                        <button onClick={randomizeSeating} style={{ backgroundColor: '#10b981', marginLeft: '1rem' }}>🎲 Randomize Seating</button>
                        <button onClick={resetGame} style={{ backgroundColor: '#ef4444', marginLeft: '1rem' }}>Reset Game</button>
                    </>
                )}
            </div>

            {players.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Phase</th>
                                {players.map(p => (
                                    <th key={p.id}>{p.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 10 }).map((_, phaseIndex) => (
                                <tr key={phaseIndex}>
                                    <td>Phase {phaseIndex + 1}</td>
                                    {players.map(p => (
                                        <td key={p.id}>
                                            <input
                                                type="number"
                                                min="0"
                                                className="score-input"
                                                value={scores[p.id][phaseIndex] || ''}
                                                onChange={(e) => updateScore(p.id, phaseIndex, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td>Total Points</td>
                                {players.map(p => (
                                    <td key={p.id}>{calculateTotal(p.id)}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <button onClick={saveMatch} className="add-round-btn">🏆 Finish & Save Match</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Phase10ScoreSheet;
