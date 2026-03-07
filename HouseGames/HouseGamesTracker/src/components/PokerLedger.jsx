import React, { useState } from 'react';
import './PokerLedger.css';

function PokerLedger() {
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [defaultBuyIn, setDefaultBuyIn] = useState(500);

    const addPlayer = () => {
        if (newPlayerName.trim() === '') return;

        const newPlayerId = Date.now().toString();
        setPlayers([...players, {
            id: newPlayerId,
            name: newPlayerName.trim(),
            invested: 0,
            cashOut: ''
        }]);
        setNewPlayerName('');
    };

    const resetGame = () => {
        if (window.confirm("Are you sure you want to clear the ledger and start a new game?")) {
            setPlayers([]);
        }
    };

    const updatePlayer = (id, field, value) => {
        setPlayers(players.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const addBuyIn = (id) => {
        setPlayers(players.map(p => {
            if (p.id === id) {
                return { ...p, invested: p.invested + Number(defaultBuyIn) };
            }
            return p;
        }));
    };

    const calculateNet = (player) => {
        const out = player.cashOut === '' ? 0 : Number(player.cashOut);
        return out - player.invested;
    };

    const totalNet = players.reduce((sum, p) => sum + calculateNet(p), 0);
    const totalInvested = players.reduce((sum, p) => sum + p.invested, 0);
    const totalCashedOut = players.reduce((sum, p) => sum + (p.cashOut === '' ? 0 : Number(p.cashOut)), 0);

    const randomizeSeating = () => {
        setPlayers([...players].sort(() => Math.random() - 0.5));
    };

    const saveMatch = () => {
        if (players.length === 0) return;

        let maxNet = -Infinity;
        const playerStats = players.map(p => {
            const net = calculateNet(p);
            if (net > maxNet) maxNet = net;
            return { name: p.name, score: net };
        });

        const winners = playerStats.filter(p => p.score === maxNet && p.score > 0);

        const match = {
            id: Date.now(),
            game: 'Poker',
            date: new Date().toLocaleDateString(),
            players: playerStats,
            winners: winners.length ? winners : playerStats.filter(p => p.score === maxNet),
            note: `Total Bank: $${totalInvested}`
        };

        const existing = JSON.parse(localStorage.getItem('houseGamesHistory') || '[]');
        localStorage.setItem('houseGamesHistory', JSON.stringify([...existing, match]));

        alert("Ledger saved successfully to History!");
    };

    return (
        <div className="poker-container">
            <h2>Poker Ledger</h2>

            <div className="poker-dashboard">
                <div className="stat-card">
                    <span className="stat-label">Total Bank</span>
                    <span className="stat-value">{totalInvested}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Cashed Out</span>
                    <span className="stat-value">{totalCashedOut}</span>
                </div>
                <div className={`stat-card ${totalNet === 0 ? 'balanced' : 'unbalanced'}`}>
                    <span className="stat-label">Balance Check</span>
                    <span className="stat-value">{totalNet === 0 ? '0 (Balanced)' : `${totalNet > 0 ? '+' : ''}${totalNet}`}</span>
                </div>
            </div>

            <div className="poker-setup">
                <div className="config-group">
                    <label>Default Buy-In Amount:</label>
                    <input
                        type="number"
                        value={defaultBuyIn}
                        onChange={(e) => setDefaultBuyIn(e.target.value)}
                        className="buyin-config"
                    />
                </div>

                <div className="player-setup" style={{ marginBottom: 0 }}>
                    <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Player Name..."
                        onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                    <button onClick={addPlayer}>Add Player</button>
                    {players.length > 0 && (
                        <>
                            <button onClick={randomizeSeating} style={{ backgroundColor: '#10b981', marginLeft: '1rem' }}>🎲 Randomize Seating</button>
                            <button onClick={resetGame} style={{ backgroundColor: '#ef4444', marginLeft: '1rem' }}>Clear All</button>
                        </>
                    )}
                </div>
            </div>

            {players.length > 0 && (
                <div className="ledger-table-wrapper">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Total Invested</th>
                                <th>Cash Out</th>
                                <th>Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(p => {
                                const net = calculateNet(p);
                                const isPositive = net > 0;
                                const isNegative = net < 0;

                                return (
                                    <tr key={p.id}>
                                        <td className="player-name-cell">{p.name}</td>
                                        <td>
                                            <div className="invested-cell">
                                                <input
                                                    type="number"
                                                    value={p.invested}
                                                    onChange={(e) => updatePlayer(p.id, 'invested', Number(e.target.value))}
                                                    className="ledger-input"
                                                />
                                                <button
                                                    className="buy-in-btn"
                                                    onClick={() => addBuyIn(p.id)}
                                                    title={`Add +${defaultBuyIn} to invested`}
                                                >
                                                    + Buy In
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={p.cashOut}
                                                onChange={(e) => updatePlayer(p.id, 'cashOut', e.target.value)}
                                                className="ledger-input cashout-input"
                                            />
                                        </td>
                                        <td className="net-profit-cell">
                                            <span className={`net-badge ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
                                                {isPositive ? '+' : ''}{net}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <button onClick={saveMatch} className="buy-in-btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 'bold' }}>🏆 Finish & Save Ledger</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PokerLedger;
