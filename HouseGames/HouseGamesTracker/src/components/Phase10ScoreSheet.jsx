import React, { useState, useEffect } from 'react';

function Phase10ScoreSheet({ players }) {
    const [scores, setScores] = useState({});

    useEffect(() => {
        setScores(prev => {
            const newScores = { ...prev };
            players.forEach(p => {
                if (!newScores[p.id]) {
                    newScores[p.id] = Array(10).fill(0);
                }
            });
            return newScores;
        });
    }, [players]);

    const updateScore = (playerId, phaseIndex, value) => {
        const numValue = value === '' ? 0 : parseInt(value, 10);
        setScores(prevScores => {
            const newPlayerScores = [...prevScores[playerId]];
            newPlayerScores[phaseIndex] = isNaN(numValue) ? 0 : numValue;
            return { ...prevScores, [playerId]: newPlayerScores };
        });
    };

    const calculateTotal = (playerId) => {
        if (!scores[playerId]) return 0;
        return scores[playerId].reduce((acc, curr) => acc + curr, 0);
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

            {players.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Add players from the left sidebar to begin.
                </div>
            ) : (
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
                                                value={scores[p.id] ? (scores[p.id][phaseIndex] || '') : ''}
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
