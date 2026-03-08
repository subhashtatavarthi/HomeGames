import React, { useState, useEffect } from 'react';
import './HistoryDashboard.css';

function HistoryDashboard() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('houseGamesHistory');
        if (saved) {
            try {
                setHistory(JSON.parse(saved).sort((a, b) => b.id - a.id));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to erase ALL Match History and Leaderboards? This cannot be undone.")) {
            localStorage.removeItem('houseGamesHistory');
            setHistory([]);
            window.location.reload();
        }
    };

    // Calculate Leaderboard
    const leaderboard = {};
    history.forEach(match => {
        // Count games played
        match.players.forEach(p => {
            if (!leaderboard[p.name]) {
                leaderboard[p.name] = { name: p.name, wins: 0, played: 0 };
            }
            leaderboard[p.name].played += 1;
        });

        // Count wins
        match.winners.forEach(w => {
            if (leaderboard[w.name]) {
                leaderboard[w.name].wins += 1;
            }
        });
    });

    const rankedPlayers = Object.values(leaderboard).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.played - a.played; // Tie breaker: more games played
    });

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>Leaderboard & History</h2>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="clear-history-btn">Clear All Data</button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏆</div>
                    <p>No games played yet.</p>
                    <p className="empty-subtext">Finish and save a match to see it on the leaderboard!</p>
                </div>
            ) : (
                <>
                    <div className="leaderboard-section">
                        <h3>👑 Global Leaderboard</h3>
                        <div className="leaderboard-grid">
                            {rankedPlayers.map((player, index) => (
                                <div key={player.name} className={`leaderboard-card rank-${index + 1}`}>
                                    <div className="rank-badge">#{index + 1}</div>
                                    <div className="player-stats">
                                        <span className="lb-name">{player.name}</span>
                                        <div className="lb-metrics">
                                            <span className="lb-wins">{player.wins} Wins</span>
                                            <span className="lb-played">{player.played} Played</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="matches-section">
                        <h3>📜 Match History</h3>
                        <div className="matches-list">
                            {history.map((match) => (
                                <div key={match.id} className="match-card">
                                    <div className="match-header">
                                        <span className="match-game">{match.game}</span>
                                        <span className="match-date">{match.date}</span>
                                    </div>

                                    <div className="match-body">
                                        <div className="match-winners">
                                            <span className="winner-label">Winner(s):</span>
                                            <div className="winner-names">
                                                {match.winners.map(w => (
                                                    <span key={w.name} className="winner-pill">
                                                        👑 {w.name} {w.score !== undefined && `(${w.score})`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="match-players">
                                            <span className="players-label">Players:</span>
                                            <span className="players-list-text">
                                                {match.players.map(p => p.name).join(', ')}
                                            </span>
                                        </div>

                                        {match.note && (
                                            <div className="match-note">{match.note}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default HistoryDashboard;
