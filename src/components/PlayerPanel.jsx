import React, { useState } from "react";
import { findPlayers, createPlayer } from "../api";
export default function PlayerPanel({ player, onLogin, disabled }) {
  const [name, setName] = useState("");
  const [matches, setMatches] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create() {
    setBusy(true);
    setError("");
    try {
      onLogin(await createPlayer(name));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMatches(null);
    try {
      const { players } = await findPlayers(name);
      if (players.length === 1) onLogin(players[0]);
      else setMatches(players);
    } catch (e) {
      if (e.status === 404) await create();
      else setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (player) {
    const total = player.wins + player.losses;
    return (
      <section aria-label="Player stats">
        <h2>{player.playerName}</h2>
        <p>
          Wins: {player.wins} · Losses: {player.losses}
        </p>
        <p>
          Winning percentage:{" "}
          {total ? ((100 * player.wins) / total).toFixed(1) : "0.0"}%
        </p>
        <small>Player ID: {player.playerID}</small>
      </section>
    );
  }
  return (
    <section>
      <form onSubmit={login}>
        <label htmlFor="player-name">Player name</label>
        <div className="input-row">
          <input
            id="player-name"
            value={name}
            maxLength={40}
            required
            onChange={(e) => {
              setName(e.target.value);
              setMatches(null);
            }}
            disabled={busy || disabled}
          />
          <button disabled={busy || disabled || !name.trim()}>Log in</button>
        </div>
      </form>
      {matches && (
        <div>
          <p>Choose your profile:</p>
          {matches.map((p) => (
            <button key={p.playerID} onClick={() => onLogin(p)}>
              {p.playerName} ({p.playerID}) · {p.wins} wins / {p.losses} losses
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={busy || disabled || !name.trim()}
        onClick={create}
      >
        Create separate profile
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
