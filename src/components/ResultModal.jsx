import React from 'react';

export default function ResultModal({ status, word, onNewGame, saveState, onRetry }) {
  if (!status) return null;

  const saving = saveState === 'saving';
  const failed = saveState === 'error';
  return (
    <div className="overlay">
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="result-heading">
        <h2 id="result-heading">{status === 'won' ? '🎉 You won!' : 'Game over!'}</h2>
        <p>The word was <strong>{word}</strong>.</p>
        {saving && <p role="status">Saving your result…</p>}
        {saveState === 'saved' && <p role="status">Result saved.</p>}
        {failed && (
          <>
            <p role="alert">Your result could not be confirmed. Retry to save it.</p>
            <button type="button" onClick={onRetry}>Retry save</button>
          </>
        )}
        <button onClick={onNewGame} disabled={saving || failed} autoFocus>Play again</button>
      </div>
    </div>
  );
}
