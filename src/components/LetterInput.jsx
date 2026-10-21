import React, { useState } from 'react';
export default function LetterInput({ onGuess, disabled }) {
  const [letter, setLetter] = useState('');
  function submit(e) { e.preventDefault(); if (letter) onGuess(letter.toUpperCase()); setLetter(''); }
  return <form onSubmit={submit} className="guess-form"><label htmlFor="guess">Choose a letter</label><div className="input-row"><input id="guess" aria-label="Enter one letter" maxLength="1" pattern="[A-Za-z]" title="Enter one English letter" autoComplete="off" value={letter} onChange={e => setLetter(e.target.value.replace(/[^a-z]/gi, '').slice(0,1))} disabled={disabled} placeholder="A-Z"/><button type="submit" disabled={disabled || !letter}>Guess</button></div></form>;
}
