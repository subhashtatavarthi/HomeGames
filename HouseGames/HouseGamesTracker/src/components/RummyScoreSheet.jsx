import React, { useState } from 'react';
import './RummyScoreSheet.css';

function RummyScoreSheet({ targetScore, initialDrop, middleDrop }) {
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');

    // scores is an object where key is playerId and value is an array of rounds
    const [scores, setScores] = useState({});

    // Track how many rounds exist (starts with 1)
    const [roundCount, setRoundCount] = useState(1);

    const addPlayer = () => {
        if (newPlayerName.trim() === '') return;

        const newPlayerId = Date.now().toString();
        setPlayers([...players, { id: newPlayerId, name: newPlayerName.trim() }]);

        // Initialize their scores array with empty strings for existing rounds
        setScores(prev => ({
            ...prev,
            [newPlayerId]: Array(roundCount).fill('')
        }));

        setNewPlayerName('');
    };

    const resetGame = () => {
        if (window.confirm("Are you sure you want to clear all players and start a new game?")) {
            setPlayers([]);
            setScores({});
            setRoundCount(1);
        }
    };

    const updateScore = (playerId, roundIndex, value) => {
        setScores(prevScores => {
            const newPlayerScores = [...prevScores[playerId]];
            newPlayerScores[roundIndex] = value;
            return {
                ...prevScores,
                [playerId]: newPlayerScores
            };
        });
    };

    const calculateTotal = (playerId) => {
        if (!scores[playerId]) return 0;
        return scores[playerId].reduce((acc, curr) => {
            const num = parseInt(curr, 10);
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    };

    const isEliminated = (playerId) => {
        return calculateTotal(playerId) >= targetScore;
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
            game: `Rummy (${targetScore})`,
            date: new Date().toLocaleDateString(),
            players: playerTotals,
            winners: winners
        };

        const existing = JSON.parse(localStorage.getItem('houseGamesHistory') || '[]');
        localStorage.setItem('houseGamesHistory', JSON.stringify([...existing, match]));

        alert("Match saved successfully to the Leaderboard!");
    };

    const addRound = () => {
        setRoundCount(prev => prev + 1);

        // Add an empty score entry for each player for the new round
        const newScores = { ...scores };
        players.forEach(p => {
            newScores[p.id] = [...newScores[p.id], ''];
        });
        setScores(newScores);
    };

    return (
        <div className="rummy-container">
            <h2>Rummy ({targetScore} Pool)</h2>
            <div className="rummy-rules">
                <span>🎯 Target: {targetScore}</span>
                <span>💧 First Drop: {initialDrop}</span>
                <span>💧 Middle Drop: {middleDrop}</span>
            </div>

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
                                        // If they were eliminated BEFORE this round, disable their input
                                        const prevTotal = scores[p.id].slice(0, roundIndex).reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
                                        const isAlreadyOut = prevTotal >= targetScore;

                                        return (
                                            <td key={p.id} className={eliminated ? 'eliminated-cell' : ''}>
                                                {!isAlreadyOut ? (
                                                    <div className="rummy-input-group">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="score-input rummy-score-input"
                                                            value={scores[p.id][roundIndex] !== undefined ? scores[p.id][roundIndex] : ''}
                                                            onChange={(e) => updateScore(p.id, roundIndex, e.target.value)}
                                                            disabled={isAlreadyOut}
                                                        />
                                                        <div className="rummy-quick-actions">
                                                            <button
                                                                className="micro-btn drop-btn"
                                                                title={`First Drop (${initialDrop})`}
                                                                onClick={() => updateScore(p.id, roundIndex, initialDrop)}
                                                            >FD</button>
                                                            <button
                                                                className="micro-btn drop-btn"
                                                                title={`Middle Drop (${middleDrop})`}
                                                                onClick={() => updateScore(p.id, roundIndex, middleDrop)}
                                                            >MD</button>
                                                            <button
                                                                className="micro-btn show-btn"
                                                                title="Show (0)"
                                                                onClick={() => updateScore(p.id, roundIndex, 0)}
                                                            >0</button>
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

export default RummyScoreSheet;
