import React, { useState, useEffect } from 'react';
import './LeastCountScoreSheet.css';

function LeastCountScoreSheet({ players }) {
    const targetScore = 100;
    const wrongCallPenalty = 40;

    const [scores, setScores] = useState({});
    const [roundCount, setRoundCount] = useState(1);

    useEffect(() => {
        setScores(prev => {
            const newScores = { ...prev };
            players.forEach(p => {
                if (!newScores[p.id]) {
                    newScores[p.id] = Array(roundCount).fill('');
                }
            });
            return newScores;
        });
    }, [players]);

    const updateScore = (playerId, roundIndex, value) => {
        setScores(prevScores => {
            const newPlayerScores = [...prevScores[playerId]];
            newPlayerScores[roundIndex] = value;
            return { ...prevScores, [playerId]: newPlayerScores };
        });
    };

    const calculateTotal = (playerId) => {
        if (!scores[playerId]) return 0;
        return scores[playerId].reduce((acc, curr) => {
            const num = parseInt(curr, 10);
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    };

    const isEliminated = (playerId) => calculateTotal(playerId) >= targetScore;

    const addRound = () => {
        setRoundCount(prev => prev + 1);
        const newScores = { ...scores };
        players.forEach(p => {
            if (newScores[p.id]) {
                newScores[p.id] = [...newScores[p.id], ''];
            }
        });
        setScores(newScores);
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
            game: 'Least Count (7 Cards)',
            date: new Date().toLocaleDateString(),
            players: playerTotals,
            winners: winners
        };
        const existing = JSON.parse(localStorage.getItem('houseGamesHistory') || '[]');
        localStorage.setItem('houseGamesHistory', JSON.stringify([...existing, match]));
        alert("Match saved successfully to the Leaderboard!");
    };

    return (
        <div className="lc-container">
            <h2>Least Count (7 Cards)</h2>
            <div className="lc-rules">
                <span>🎯 Elimination: {targetScore} Points</span>
                <span>🚨 Wrong Call: {wrongCallPenalty} Points</span>
            </div>

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
                                    <th key={p.id} className={isEliminated(p.id) ? 'eliminated-header' : ''}>
                                        {p.name}
                                        {isEliminated(p.id) && <span className="eliminated-badge">OUT</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: roundCount }).map((_, roundIndex) => (
                                <tr key={roundIndex}>
                                    <td>Round {roundIndex + 1}</td>
                                    {players.map(p => {
                                        const eliminated = isEliminated(p.id);
                                        const prevTotal = scores[p.id] ? scores[p.id].slice(0, roundIndex).reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0) : 0;
                                        const isAlreadyOut = prevTotal >= targetScore;

                                        return (
                                            <td key={p.id} className={eliminated ? 'eliminated-cell' : ''}>
                                                {!isAlreadyOut ? (
                                                    <div className="lc-input-group">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="score-input lc-score-input"
                                                            value={scores[p.id] && scores[p.id][roundIndex] !== undefined ? scores[p.id][roundIndex] : ''}
                                                            onChange={(e) => updateScore(p.id, roundIndex, e.target.value)}
                                                            disabled={isAlreadyOut}
                                                        />
                                                        <div className="lc-quick-actions">
                                                            <button className="micro-btn show-btn" title="Show (0)"
                                                                onClick={() => updateScore(p.id, roundIndex, 0)}>Show (0)</button>
                                                            <button className="micro-btn wrong-btn" title={`Wrong Call (${wrongCallPenalty})`}
                                                                onClick={() => updateScore(p.id, roundIndex, wrongCallPenalty)}>Wrong ({wrongCallPenalty})</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="out-text">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td>Total</td>
                                {players.map(p => (
                                    <td key={p.id} className={isEliminated(p.id) ? 'eliminated-total' : ''}>
                                        {calculateTotal(p.id)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '1rem' }}>
                        <button onClick={addRound} className="add-round-btn">+ Add Next Round</button>
                        <button onClick={saveMatch} className="add-round-btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>🏆 Finish & Save Match</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeastCountScoreSheet;
