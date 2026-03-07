import React, { useState, useEffect } from 'react';
import './PokerLedger.css';

function PokerLedger({ players }) {
    const [defaultBuyIn, setDefaultBuyIn] = useState(500);
    const [ledger, setLedger] = useState({});

    useEffect(() => {
        setLedger(prev => {
            const newLedger = { ...prev };
            players.forEach(p => {
                if (!newLedger[p.id]) {
                    newLedger[p.id] = { invested: 0, cashOut: '' };
                }
            });
            return newLedger;
        });
    }, [players]);

    const updateLedger = (id, field, value) => {
        setLedger(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const addBuyIn = (id) => {
        setLedger(prev => ({
            ...prev,
            [id]: { ...prev[id], invested: (prev[id]?.invested || 0) + Number(defaultBuyIn) }
        }));
    };

    const calculateNet = (playerId) => {
        const entry = ledger[playerId];
        if (!entry) return 0;
        const out = entry.cashOut === '' ? 0 : Number(entry.cashOut);
        return out - entry.invested;
    };

    const totalInvested = players.reduce((sum, p) => sum + (ledger[p.id]?.invested || 0), 0);
    const totalCashedOut = players.reduce((sum, p) => {
        const co = ledger[p.id]?.cashOut;
        return sum + (co === '' || co === undefined ? 0 : Number(co));
    }, 0);
    const totalNet = players.reduce((sum, p) => sum + calculateNet(p.id), 0);

    const saveMatch = () => {
        if (players.length === 0) return;
        let maxNet = -Infinity;
        const playerStats = players.map(p => {
            const net = calculateNet(p.id);
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
            </div>

            {players.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Add players from the left sidebar to begin.
                </div>
            ) : (
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
                                const net = calculateNet(p.id);
                                const isPositive = net > 0;
                                const isNegative = net < 0;
                                const entry = ledger[p.id] || { invested: 0, cashOut: '' };

                                return (
                                    <tr key={p.id}>
                                        <td className="player-name-cell">{p.name}</td>
                                        <td>
                                            <div className="invested-cell">
                                                <input
                                                    type="number"
                                                    value={entry.invested}
                                                    onChange={(e) => updateLedger(p.id, 'invested', Number(e.target.value))}
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
                                                value={entry.cashOut}
                                                onChange={(e) => updateLedger(p.id, 'cashOut', e.target.value)}
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
