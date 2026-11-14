import React, { useState } from 'react';
import HangmanImage from './components/HangmanImage.jsx';
import WordDisplay from './components/WordDisplay.jsx';
import LetterInput from './components/LetterInput.jsx';
import ResultModal from './components/ResultModal.jsx';
import PlayerPanel from './components/PlayerPanel.jsx';
import { saveResult } from './playerApi.js';

const WORDS = [
  'REACT', 'CODING', 'COMPUTER', 'PROGRAM', 'SOFTWARE',
  'VARIABLE', 'FUNCTION', 'KEYBOARD', 'JAVASCRIPT', 'ENGINEER',
];

function randomWord(previous) {
  const choices = WORDS.filter(word => word !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}

function resultFor(word, guessed) {
  if ([...word].every(letter => guessed.includes(letter))) return 'won';
  if (guessed.filter(letter => !word.includes(letter)).length >= 5) return 'lost';
  return null;
}

export default function App() {
  const [word, setWord] = useState(() => randomWord(''));
  const [guessed, setGuessed] = useState([]);
  const [player, setPlayer] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [saveState, setSaveState] = useState('idle');

  const mistakes = guessed.filter(letter => !word.includes(letter)).length;
  const status = resultFor(word, guessed);

  async function syncResult(result) {
    setSaveState('saving');
    try {
      const saved = await saveResult(result.playerID, result.gameID, result.outcome);
      setPlayer(saved);
      setPendingResult(null);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }

  function guess(letter) {
    if (status || !/^[A-Z]$/.test(letter) || guessed.includes(letter)) return;
    const nextGuesses = [...guessed, letter];
    setGuessed(nextGuesses);

    const outcome = resultFor(word, nextGuesses);
    if (!player || !outcome) return;

    const stat = outcome === 'won' ? 'wins' : 'losses';
    setPlayer({ ...player, [stat]: player[stat] + 1 });
    const result = { playerID: player.playerID, gameID: crypto.randomUUID(), outcome };
    setPendingResult(result);
    void syncResult(result);
  }

  function newGame() {
    setWord(old => randomWord(old));
    setGuessed([]);
    setSaveState('idle');
  }

  function login(profile) {
    setPlayer(profile);
    newGame();
  }

  return (
    <main className="game">
      <h1>Hangman</h1>
      <p className="subtitle">Guess the programming word before your 5 lives run out.</p>
      <PlayerPanel player={player} onLogin={login} />
      <HangmanImage mistakes={mistakes} />
      <p className="lives">Lives remaining: <strong>{5 - mistakes}</strong></p>
      <WordDisplay word={word} guessed={guessed} />
      <LetterInput onGuess={guess} disabled={Boolean(status)} />
      <p className="guessed"><strong>Chosen letters:</strong> {guessed.length ? guessed.join(', ') : 'None yet'}</p>
      <button className="new-game" onClick={newGame} disabled={Boolean(pendingResult)}>New Game</button>
      <ResultModal status={status} word={word} onNewGame={newGame}
        saveState={saveState} onRetry={() => void syncResult(pendingResult)} />
    </main>
  );
}
