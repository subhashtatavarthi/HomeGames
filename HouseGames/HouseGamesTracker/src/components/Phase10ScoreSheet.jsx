import React, { useState, useEffect } from 'react';
import './Phase10ScoreSheet.css';

const PHASES = [
    { num: 1, desc: '2 Sets of 3' },
    { num: 2, desc: '1 Set of 3 + 1 Run of 4' },
    { num: 3, desc: '1 Set of 4 + 1 Run of 4' },
    { num: 4, desc: '1 Run of 7' },
    { num: 5, desc: '1 Run of 8' },
    { num: 6, desc: '1 Run of 9' },
    { num: 7, desc: '2 Sets of 4' },
    { num: 8, desc: '7 Cards of One Color' },
    { num: 9, desc: '1 Set of 5 + 1 Set of 2' },
    { num: 10, desc: '1 Set of 5 + 1 Set of 3' },
];

function Phase10ScoreSheet({ players }) {
    // Per-player state: { [playerId]: { currentPhase: 1, rounds: [{ completed: false, handScore: 0 }] } }
    const [gameState, setGameState] = useState({});
    const [roundCount, setRoundCount] = useState(1);
    const [showPhaseRef, setShowPhaseRef] = useState(false);

    useEffect(() => {
        setGameState(prev => {
            const newState = { ...prev };
            players.forEach(p => {
                if (!newState[p.id]) {
                    newState[p.id] = {
                        currentPhase: 1,
                        rounds: Array(roundCount).fill(null).map(() => ({ completed: false, handScore: '' }))
                    };
                }
            });
            return newState;
        });
    }, [players]);

    const updateRound = (playerId, roundIndex, field, value) => {
        setGameState(prev => {
            const playerState = { ...prev[playerId] };
            const rounds = [...playerState.rounds];
            rounds[roundIndex] = { ...rounds[roundIndex], [field]: value };

            // Recalculate current phase based on all completed rounds
            let phase = 1;
            for (let i = 0; i < rounds.length; i++) {
                if (rounds[i].completed && phase <= 10) {
                    phase = Math.min(phase + 1, 11); // 11 means finished all phases
                }
            }
            playerState.currentPhase = phase;
            playerState.rounds = rounds;
            return { ...prev, [playerId]: playerState };
        });
    };

    const calculateTotal = (playerId) => {
        if (!gameState[playerId]) return 0;
        return gameState[playerId].rounds.reduce((acc, r) => {
            const s = parseInt(r.handScore, 10);
            return acc + (isNaN(s) ? 0 : s);
        }, 0);
    };

    const getCurrentPhase = (playerId) => {
        return gameState[playerId]?.currentPhase || 1;
    };

    const hasFinished = (playerId) => {
        return getCurrentPhase(playerId) > 10;
    };

    const addRound = () => {
        setRoundCount(prev => prev + 1);
        setGameState(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(pid => {
                newState[pid] = {
                    ...newState[pid],
                    rounds: [...newState[pid].rounds, { completed: false, handScore: '' }]
                };
            });
            return newState;
        });
    };

    const saveMatch = () => {
        if (players.length === 0) return;

        const playerResults = players.map(p => {
            const phase = getCurrentPhase(p.id);
            const total = calculateTotal(p.id);
            return { name: p.name, score: total, phase: phase, finished: phase > 10 };
        });

        // Winners: finished Phase 10, then lowest score
        const finishers = playerResults.filter(p => p.finished);
        let winners;
        if (finishers.length > 0) {
            const minScore = Math.min(...finishers.map(p => p.score));
            winners = finishers.filter(p => p.score === minScore);
        } else {
            const maxPhase = Math.max(...playerResults.map(p => p.phase));
            const furthest = playerResults.filter(p => p.phase === maxPhase);
            const minScore = Math.min(...furthest.map(p => p.score));
            winners = furthest.filter(p => p.score === minScore);
        }

        const match = {
            id: Date.now(),
            game: 'Phase 10',
            date: new Date().toLocaleDateString(),
            players: playerResults,
            winners: winners
        };

        const existing = JSON.parse(localStorage.getItem('houseGamesHistory') || '[]');
        localStorage.setItem('houseGamesHistory', JSON.stringify([...existing, match]));
        alert("Phase 10 match saved to the Leaderboard!");
    };

    return (
        <div className="phase10-container">
            <h2>Phase 10 Tracker</h2>
            <p className="phase10-subtitle">Complete all 10 phases in order. Lowest total score breaks ties!</p>

            <div className="phase10-toolbar">
                <button onClick={() => setShowPhaseRef(!showPhaseRef)} className="phase-ref-toggle">
                    {showPhaseRef ? '✕ Hide Phases' : '📖 Phase Reference'}
                </button>
                <div className="point-ref">
                    <span className="point-chip">1-9 = <strong>5 pts</strong></span>
                    <span className="point-chip">10-12 = <strong>10 pts</strong></span>
                    <span className="point-chip">Skip = <strong>15 pts</strong></span>
                    <span className="point-chip">Wild = <strong>25 pts</strong></span>
                </div>
            </div>

            {showPhaseRef && (
                <div className="phase-reference-card">
                    {PHASES.map(ph => (
                        <div key={ph.num} className="phase-ref-item">
                            <span className="phase-ref-num">Phase {ph.num}</span>
                            <span className="phase-ref-desc">{ph.desc}</span>
                        </div>
                    ))}
                </div>
            )}

            {players.length === 0 ? (
                <div className="empty-game-msg">Add players from the left sidebar to begin.</div>
            ) : (
                <>
                    {/* Player Phase Status Cards */}
                    <div className="phase-status-bar">
                        {players.map(p => {
                            const phase = getCurrentPhase(p.id);
                            const finished = phase > 10;
                            return (
                                <div key={p.id} className={`phase-status-card ${finished ? 'finished' : ''}`}>
                                    <span className="psc-name">{p.name}</span>
                                    {finished ? (
                                        <span className="psc-phase psc-done">🏆 DONE!</span>
                                    ) : (
                                        <>
                                            <span className="psc-phase">Phase {phase}</span>
                                            <span className="psc-desc">{PHASES[phase - 1]?.desc}</span>
                                        </>
                                    )}
                                    <span className="psc-total">Score: {calculateTotal(p.id)}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Round-by-Round Scoring Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table className="phase10-table">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    {players.map(p => (
                                        <th key={p.id}>{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: roundCount }).map((_, roundIndex) => (
                                    <tr key={roundIndex}>
                                        <td className="round-label">
                                            <span className="round-num">R{roundIndex + 1}</span>
                                        </td>
                                        {players.map(p => {
                                            const pState = gameState[p.id];
                                            if (!pState) return <td key={p.id}>-</td>;
                                            const roundData = pState.rounds[roundIndex] || { completed: false, handScore: '' };

                                            // Figure out what phase they were on in this round
                                            let phaseAtRound = 1;
                                            for (let i = 0; i < roundIndex; i++) {
                                                if (pState.rounds[i]?.completed && phaseAtRound <= 10) {
                                                    phaseAtRound++;
                                                }
                                            }
                                            const wasFinished = phaseAtRound > 10;

                                            return (
                                                <td key={p.id} className={wasFinished ? 'finished-cell' : ''}>
                                                    {wasFinished ? (
                                                        <span className="done-dash">✓</span>
                                                    ) : (
                                                        <div className="round-input-group">
                                                            <div className="phase-at-round">
                                                                P{phaseAtRound}: {PHASES[phaseAtRound - 1]?.desc}
                                                            </div>
                                                            <label className="completed-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={roundData.completed}
                                                                    onChange={(e) => updateRound(p.id, roundIndex, 'completed', e.target.checked)}
                                                                />
                                                                <span className={`check-label ${roundData.completed ? 'yes' : 'no'}`}>
                                                                    {roundData.completed ? '✓ Done' : '✗ Failed'}
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="score-input hand-score-input"
                                                                placeholder="Hand pts"
                                                                value={roundData.handScore}
                                                                onChange={(e) => updateRound(p.id, roundIndex, 'handScore', e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td>Total</td>
                                    {players.map(p => (
                                        <td key={p.id}>{calculateTotal(p.id)}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="phase10-actions">
                        <button onClick={addRound} className="add-round-btn">+ Add Next Round</button>
                        <button onClick={saveMatch} className="add-round-btn save-match-btn">🏆 Finish & Save Match</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Phase10ScoreSheet;
