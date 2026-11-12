import React, { useState, useRef } from "react";
import HangmanImage from "./components/HangmanImage.jsx";
import WordDisplay from "./components/WordDisplay.jsx";
import LetterInput from "./components/LetterInput.jsx";
import ResultModal from "./components/ResultModal.jsx";
import PlayerPanel from "./components/PlayerPanel.jsx";
import { savePlayer } from "./api";
const WORDS = [
  "REACT",
  "CODING",
  "COMPUTER",
  "PROGRAM",
  "SOFTWARE",
  "VARIABLE",
  "FUNCTION",
  "KEYBOARD",
  "JAVASCRIPT",
  "ENGINEER",
];
function randomWord(previous) {
  const choices = WORDS.filter((word) => word !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}
export default function App() {
  const [player, setPlayer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const pending = useRef(null);
  const locked = useRef(false);
  async function persist(updated) {
    setSaving(true);
    setSaveError("");
    try {
      const saved = await savePlayer(updated);
      setPlayer(saved);
      pending.current = null;
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }
  const [word, setWord] = useState(() => randomWord(""));
  const [guessed, setGuessed] = useState([]);
  const mistakes = guessed.filter((letter) => !word.includes(letter)).length;
  const won = [...word].every((letter) => guessed.includes(letter));
  const status = won ? "won" : mistakes >= 5 ? "lost" : null;
  function guess(letter) {
    if (
      !player ||
      locked.current ||
      status ||
      !/^[A-Z]$/.test(letter) ||
      guessed.includes(letter)
    )
      return;
    const next = [...guessed, letter];
    setGuessed(next);
    const isWin = [...word].every((l) => next.includes(l));
    const isLoss = next.filter((l) => !word.includes(l)).length >= 5;
    if (isWin || isLoss) {
      locked.current = true;
      const updated = {
        ...player,
        wins: player.wins + Number(isWin),
        losses: player.losses + Number(isLoss),
      };
      setPlayer(updated);
      pending.current = updated;
      void persist(updated);
    }
  }
  function newGame() {
    if (saving || pending.current) return;
    locked.current = false;
    setWord((old) => randomWord(old));
    setGuessed([]);
  }
  return (
    <main className="game">
      <h1>Hangman</h1>
      <PlayerPanel player={player} onLogin={setPlayer} />
      {saving && <p role="status">Saving result…</p>}
      {saveError && !status && (
        <p role="alert">
          {saveError}{" "}
          <button disabled={saving} onClick={() => persist(pending.current)}>
            Retry save
          </button>
        </p>
      )}
      <p className="subtitle">
        Guess the programming word before your 5 lives run out.
      </p>
      <HangmanImage mistakes={mistakes} />
      <p className="lives">
        Lives remaining: <strong>{5 - mistakes}</strong>
      </p>
      <WordDisplay word={word} guessed={guessed} />
      <LetterInput onGuess={guess} disabled={!player || !!status || saving} />
      <p className="guessed">
        <strong>Chosen letters:</strong>{" "}
        {guessed.length ? guessed.join(", ") : "None yet"}
      </p>
      <button
        className="new-game"
        disabled={!player || saving || !!saveError}
        onClick={newGame}
      >
        New Game
      </button>
      <ResultModal
        status={status}
        word={word}
        onNewGame={newGame}
        disabled={saving || !!saveError}
        saveError={saveError}
        saving={saving}
        onRetry={() => persist(pending.current)}
      />
    </main>
  );
}
