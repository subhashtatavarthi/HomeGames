import React, { useState } from 'react';

function SkullKingScoreSheet() {
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');

    // State structure for scores: [playerId][roundIndex] = { bid: 0, won: 0, bonus: 0 }
    const [scores, setScores] = useState({});

    const addPlayer = () => {
        if (newPlayerName.trim() === '') return;

        const newPlayerId = Date.now().toString();
        setPlayers([...players, { id: newPlayerId, name: newPlayerName.trim() }]);

        const initialScores = Array.from({ length: 10 }, () => ({
            bid: '',
            won: '',
            bonus: ''
        }));

        setScores(prev => ({ ...prev, [newPlayerId]: initialScores }));
        setNewPlayerName('');
    };

    const resetGame = () => {
        if (window.confirm("Are you sure you want to clear all players and start a new game?")) {
            setPlayers([]);
            setScores({});
        }
    };

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
        // Standard Skull King scoring rules:
        // If Bid == Won (and > 0): 20 points per trick won + Bonus points
        // If Bid == Won (and == 0): 10 points * Round Number
        // If Bid != Won: -10 points * Absolute difference between Bid and Won

        if (roundObj.bid === '' || roundObj.won === '') return 0; // Don't calculate if inputs are missing

        const bid = roundObj.bid;
        const won = roundObj.won;
        const bonus = roundObj.bonus === '' ? 0 : roundObj.bonus;

        if (bid === won) {
            if (bid === 0) {
                return (10 * roundNumber);
            } else {
                return (20 * won) + bonus;
            }
        } else {
            if (bid === 0) {
                return -(10 * roundNumber);
            } else {
                const diff = Math.abs(bid - won);
                return -(10 * diff);
            }
        }
    };

    const calculateTotal = (playerId) => {
        return scores[playerId].reduce((acc, currentRound, idx) => {
            return acc + calculateRoundScore(currentRound, idx + 1);
        }, 0);
    };

    return (
        <div>
            <h2>Skull King Tracker</h2>
            <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#64748b' }}>Highest score wins!</p>

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
                    <button onClick={resetGame} style={{ backgroundColor: '#ef4444', marginLeft: '1rem' }}>Reset Game</button>
                )}
            </div>

            {players.length > 0 && (
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
                                        const roundData = scores[p.id][roundIndex];
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
                </div>
            )}
        </div>
    );
}

export default SkullKingScoreSheet;
