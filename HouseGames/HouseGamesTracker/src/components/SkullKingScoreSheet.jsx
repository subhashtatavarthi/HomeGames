import React, { useState, useEffect } from 'react';
import './SkullKingScoreSheet.css';

function SkullKingScoreSheet({ players }) {
    const [scores, setScores] = useState({});
    const [showRules, setShowRules] = useState(false);

    useEffect(() => {
        setScores(prev => {
            const newScores = { ...prev };
            players.forEach(p => {
                if (!newScores[p.id]) {
                    newScores[p.id] = Array.from({ length: 10 }, () => ({
                        bid: '',
                        won: '',
                        bonus: 0
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

    const addBonus = (playerId, roundIndex, amount) => {
        setScores(prev => {
            const newScores = [...prev[playerId]];
            const currentBonus = newScores[roundIndex].bonus || 0;
            newScores[roundIndex] = {
                ...newScores[roundIndex],
                bonus: currentBonus + amount
            };
            return { ...prev, [playerId]: newScores };
        });
    };

    const resetBonus = (playerId, roundIndex) => {
        setScores(prev => {
            const newScores = [...prev[playerId]];
            newScores[roundIndex] = { ...newScores[roundIndex], bonus: 0 };
            return { ...prev, [playerId]: newScores };
        });
    };

    const calculateRoundScore = (roundObj, roundNumber) => {
        if (roundObj.bid === '' || roundObj.won === '') return 0;
        const bid = roundObj.bid;
        const won = roundObj.won;
        const bonus = roundObj.bonus || 0;

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
        alert("Skull King match saved to the Leaderboard!");
    };

    return (
        <div className="sk-container">
            <h2>☠️ Skull King Tracker</h2>
            <p className="sk-subtitle">Highest score after 10 rounds wins! "Yo Ho Ho!"</p>

            <div className="sk-toolbar">
                <button onClick={() => setShowRules(!showRules)} className="sk-rules-toggle">
                    {showRules ? '✕ Hide Rules' : '📖 Scoring Rules'}
                </button>
                <div className="sk-point-ref">
                    <span className="sk-chip exact">Exact = <strong>20 × tricks</strong></span>
                    <span className="sk-chip wrong">Wrong = <strong>-10 × off</strong></span>
                    <span className="sk-chip zero">Zero Bid = <strong>±10 × round</strong></span>
                </div>
            </div>

            {showRules && (
                <div className="sk-rules-card">
                    <div className="sk-rules-grid">
                        <div className="sk-rule-section">
                            <h4>⚔️ Scoring</h4>
                            <ul>
                                <li><strong>Exact Bid:</strong> +20 pts per trick won + bonus</li>
                                <li><strong>Wrong Bid:</strong> -10 pts per trick off</li>
                                <li><strong>Zero Bid ✓:</strong> +10 × Round Number</li>
                                <li><strong>Zero Bid ✗:</strong> -10 × Round Number</li>
                            </ul>
                        </div>
                        <div className="sk-rule-section">
                            <h4>🃏 Special Card Bonuses</h4>
                            <ul>
                                <li>🧜‍♀️ <strong>Mermaid captures Skull King:</strong> +40 pts</li>
                                <li>☠️ <strong>Skull King wins:</strong> +40 pts</li>
                                <li>🏴‍☠️ <strong>Pirate captures Mermaid:</strong> +20 pts</li>
                            </ul>
                        </div>
                        <div className="sk-rule-section">
                            <h4>🦑 Card Hierarchy</h4>
                            <ul>
                                <li>Skull King &gt; Pirates &gt; Mermaids &gt; Black &gt; Colors</li>
                                <li>Escape (White Flag): Always loses</li>
                                <li>Must follow led suit if possible</li>
                            </ul>
                        </div>
                        <div className="sk-rule-section advanced-section">
                            <h4>🐙 Advanced (Optional)</h4>
                            <ul>
                                <li><strong>Kraken:</strong> Destroys all special cards in trick</li>
                                <li><strong>White Whale:</strong> Negates special cards</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {players.length === 0 ? (
                <div className="sk-empty">Add players from the left sidebar to begin.</div>
            ) : (
                <>
                    {/* Player Score Summary Cards */}
                    <div className="sk-status-bar">
                        {players.map((p, idx) => {
                            const total = calculateTotal(p.id);
                            return (
                                <div key={p.id} className={`sk-status-card ${idx === 0 ? 'leading' : ''}`}>
                                    <span className="sk-sc-name">{p.name}</span>
                                    <span className={`sk-sc-total ${total >= 0 ? 'positive' : 'negative'}`}>{total >= 0 ? '+' : ''}{total}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Round-by-Round Scoring */}
                    <div style={{ overflowX: 'auto' }}>
                        <table className="sk-table">
                            <thead>
                                <tr>
                                    <th>Round<br /><span className="th-sub">(Cards)</span></th>
                                    {players.map(p => (
                                        <th key={p.id}>{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 10 }).map((_, roundIndex) => (
                                    <tr key={roundIndex}>
                                        <td className="sk-round-label">
                                            <span className="sk-round-num">R{roundIndex + 1}</span>
                                            <span className="sk-round-cards">{roundIndex + 1} cards</span>
                                        </td>
                                        {players.map(p => {
                                            const roundData = scores[p.id] ? scores[p.id][roundIndex] : { bid: '', won: '', bonus: 0 };
                                            const roundScore = calculateRoundScore(roundData, roundIndex + 1);
                                            const isExact = roundData.bid !== '' && roundData.won !== '' && roundData.bid === roundData.won;
                                            const isFail = roundData.bid !== '' && roundData.won !== '' && roundData.bid !== roundData.won;

                                            return (
                                                <td key={p.id}>
                                                    <div className="sk-cell">
                                                        <div className="sk-input-row">
                                                            <div className="sk-field">
                                                                <label>Bid</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={roundIndex + 1}
                                                                    value={roundData.bid}
                                                                    onChange={(e) => updateScore(p.id, roundIndex, 'bid', e.target.value)}
                                                                    className="sk-input"
                                                                />
                                                            </div>
                                                            <div className="sk-field">
                                                                <label>Won</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={roundIndex + 1}
                                                                    value={roundData.won}
                                                                    onChange={(e) => updateScore(p.id, roundIndex, 'won', e.target.value)}
                                                                    className="sk-input"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Bonus Quick Buttons */}
                                                        {isExact && roundData.bid > 0 && (
                                                            <div className="sk-bonus-row">
                                                                <button className="sk-bonus-btn skull" onClick={() => addBonus(p.id, roundIndex, 40)} title="Skull King / Mermaid Capture">☠️+40</button>
                                                                <button className="sk-bonus-btn pirate" onClick={() => addBonus(p.id, roundIndex, 20)} title="Pirate captures Mermaid">🏴‍☠️+20</button>
                                                                <button className="sk-bonus-btn reset-bonus" onClick={() => resetBonus(p.id, roundIndex)} title="Reset bonus">↻</button>
                                                                {roundData.bonus > 0 && (
                                                                    <span className="sk-bonus-badge">+{roundData.bonus}</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Round Score Display */}
                                                        {(roundData.bid !== '' && roundData.won !== '') && (
                                                            <div className={`sk-round-score ${isExact ? 'exact' : 'fail'}`}>
                                                                {roundScore >= 0 ? '+' : ''}{roundScore}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td>Total</td>
                                    {players.map(p => {
                                        const total = calculateTotal(p.id);
                                        return (
                                            <td key={p.id} className={total >= 0 ? 'total-positive' : 'total-negative'}>
                                                {total >= 0 ? '+' : ''}{total}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="sk-actions">
                        <button onClick={saveMatch} className="add-round-btn save-match-btn">🏆 Finish & Save Match</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default SkullKingScoreSheet;
