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
                        <button onClick={resetGame} style={{ backgroundColor: '#ef4444', marginLeft: '1rem' }}>Clear All</button>
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
                </div>
            )}
        </div>
    );
}

export default PokerLedger;
