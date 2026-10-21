import React, { useState } from 'react';
import HangmanImage from './components/HangmanImage.jsx';
import WordDisplay from './components/WordDisplay.jsx';
import LetterInput from './components/LetterInput.jsx';
import ResultModal from './components/ResultModal.jsx';
const WORDS = ['REACT','CODING','COMPUTER','PROGRAM','SOFTWARE','VARIABLE','FUNCTION','KEYBOARD','JAVASCRIPT','ENGINEER'];
function randomWord(previous) {
  const choices = WORDS.filter(word => word !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}
export default function App() {
  const [word, setWord] = useState(() => randomWord(''));
  const [guessed, setGuessed] = useState([]);
  const mistakes = guessed.filter(letter => !word.includes(letter)).length;
  const won = [...word].every(letter => guessed.includes(letter));
  const status = won ? 'won' : mistakes >= 5 ? 'lost' : null;
  function guess(letter) { if (!status && /^[A-Z]$/.test(letter) && !guessed.includes(letter)) setGuessed(old => [...old, letter]); }
  function newGame() { setWord(old => randomWord(old)); setGuessed([]); }
  return <main className="game"><h1>Hangman</h1><p className="subtitle">Guess the programming word before your 5 lives run out.</p><HangmanImage mistakes={mistakes}/><p className="lives">Lives remaining: <strong>{5 - mistakes}</strong></p><WordDisplay word={word} guessed={guessed}/><LetterInput onGuess={guess} disabled={!!status}/><p className="guessed"><strong>Chosen letters:</strong> {guessed.length ? guessed.join(', ') : 'None yet'}</p><button className="new-game" onClick={newGame}>New Game</button><ResultModal status={status} word={word} onNewGame={newGame}/></main>;
}
