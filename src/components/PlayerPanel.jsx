import React, { useState } from 'react';
import { createPlayer, findPlayers } from '../playerApi.js';

export function PlayerStats({ player }) {
  const games = player.wins + player.losses;
  const percentage = games ? Math.round(100 * player.wins / games) : 0;
  return (
    <section className="player-panel" aria-label="Player statistics" aria-live="polite">
      <strong>{player.playerName}</strong>
      <p>Wins: {player.wins} | Losses: {player.losses} | Win rate: {percentage}%</p>
    </section>
  );
}

export default function PlayerPanel({ player, onLogin }) {
  const [name, setName] = useState('');
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signIn(useExisting) {
    setBusy(true);
    setError('');
    try {
      const playerName = name.trim();
      const found = useExisting ? await findPlayers(playerName) : [];
      if (found.length > 1) setMatches(found);
      else onLogin(found[0] || await createPlayer(playerName));
    } catch {
      setError('Could not load your profile. Check that the player API is running and try again.');
    } finally {
      setBusy(false);
    }
  }

  const loggedIn = Boolean(player);
  if (loggedIn) return <PlayerStats player={player} />;

  return (
    <section className="player-panel" aria-label="Player sign-in">
      <form onSubmit={event => { event.preventDefault(); void signIn(true); }}>
        <label htmlFor="player-name">Player name</label>
        <div className="input-row">
          <input id="player-name" value={name} maxLength={40} required disabled={busy}
            onChange={event => { setName(event.target.value); setMatches([]); setError(''); }} />
          <button disabled={busy || !name.trim()}>Log in</button>
        </div>
      </form>
      {!matches.length && (
        <button className="separate-profile" type="button" disabled={busy || !name.trim()}
          onClick={() => void signIn(false)}>Create separate profile</button>
      )}
      {error && <p role="alert">{error}</p>}
      {matches.length > 0 && (
        <div>
          <p>Choose your profile by its ID or create a new one.</p>
          <ul>
            {matches.map(match => (
              <li key={match.playerID}>
                <button type="button" disabled={busy} onClick={() => onLogin(match)}>
                  {match.playerName} · {match.playerID.slice(0, 8)} · {match.wins}W/{match.losses}L
                </button>
              </li>
            ))}
          </ul>
          <button type="button" disabled={busy} onClick={() => void signIn(false)}>Create another profile</button>
        </div>
      )}
    </section>
  );
}
