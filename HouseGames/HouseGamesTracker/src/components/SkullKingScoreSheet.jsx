import React, { useState, useEffect } from 'react';

function SkullKingScoreSheet({ players }) {
    const [scores, setScores] = useState({});

    useEffect(() => {
        setScores(prev => {
            const newScores = { ...prev };
            players.forEach(p => {
                if (!newScores[p.id]) {
                    newScores[p.id] = Array.from({ length: 10 }, () => ({
                        bid: '',
                        won: '',
                        bonus: ''
                    }));
                }
            });
            return newScores;
        });
    }, [players]);

    const updateScore = (playerId, roundIndex, field, value) => {
        setScores(prev => {
            const newScores = [...prev[playerId]];
            newScores[roundIndex] = {
                ...newScores[roundIndex],
                [field]: value === '' ? '' : parseInt(value, 10)
            };
            return { ...prev, [playerId]: newScores };
        });
    };

    const calculateRoundScore = (roundObj, roundNumber) => {
        if (roundObj.bid === '' || roundObj.won === '') return 0;
        const bid = roundObj.bid;
        const won = roundObj.won;
        const bonus = roundObj.bonus === '' ? 0 : roundObj.bonus;

        if (bid === won) {
            if (bid === 0) return (10 * roundNumber);
            else return (20 * won) + bonus;
        } else {
            if (bid === 0) return -(10 * roundNumber);
            else return -(10 * Math.abs(bid - won));
        }
    };

    const calculateTotal = (playerId) => {
        if (!scores[playerId]) return 0;
        return scores[playerId].reduce((acc, currentRound, idx) => {
            return acc + calculateRoundScore(currentRound, idx + 1);
        }, 0);
    };

    const saveMatch = () => {
        if (players.length === 0) return;
        let maxScore = -Infinity;
        const playerTotals = players.map(p => {
            const total = calculateTotal(p.id);
            if (total > maxScore) maxScore = total;
            return { name: p.name, score: total };
        });
        const winners = playerTotals.filter(p => p.score === maxScore);
        const match = {
            id: Date.now(),
            game: 'Skull King',
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
            <h2>Skull King Tracker</h2>
            <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>Highest score wins!</p>

            {players.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Add players from the left sidebar to begin.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Round</th>
                                {players.map(p => (
                                    <th key={p.id}>{p.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 10 }).map((_, roundIndex) => (
                                <tr key={roundIndex}>
                                    <td>
                                        <div>Round {roundIndex + 1}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                            Cards: {roundIndex + 1}
                                        </div>
                                    </td>
                                    {players.map(p => {
                                        const roundData = scores[p.id] ? scores[p.id][roundIndex] : { bid: '', won: '', bonus: '' };
                                        return (
                                            <td key={p.id}>
                                                <div className="skull-king-cell">
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', marginRight: '4px' }}>Bid:</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={roundIndex + 1}
                                                            value={roundData.bid}
                                                            onChange={(e) => updateScore(p.id, roundIndex, 'bid', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', marginRight: '4px' }}>Won:</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={roundIndex + 1}
                                                            value={roundData.won}
                                                            onChange={(e) => updateScore(p.id, roundIndex, 'won', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', marginRight: '4px' }}>Pts:</label>
                                                        <input
                                                            type="number"
                                                            title="Bonus Points"
                                                            placeholder="+0"
                                                            value={roundData.bonus}
                                                            onChange={(e) => updateScore(p.id, roundIndex, 'bonus', e.target.value)}
                                                        />
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0ea5e9' }}>
                                                        Score: {calculateRoundScore(roundData, roundIndex + 1)}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td>Total Score</td>
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

export default SkullKingScoreSheet;
