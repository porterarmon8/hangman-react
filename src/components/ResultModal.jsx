import React from 'react';
export default function ResultModal({ status, word, onNewGame }) {
  if (!status) return null;
  return <div className="overlay"><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="result-heading"><h2 id="result-heading">{status === 'won' ? '🎉 You won!' : 'Game over!'}</h2><p>The word was <strong>{word}</strong>.</p><button onClick={onNewGame} autoFocus>Play again</button></div></div>;
}
