import React from "react";
export default function ResultModal({
  status,
  word,
  onNewGame,
  disabled,
  saveError,
  saving,
  onRetry,
}) {
  if (!status) return null;
  return (
    <div className="overlay">
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="result-heading"
      >
        <h2 id="result-heading">
          {status === "won" ? "🎉 You won!" : "Game over!"}
        </h2>
        <p>
          The word was <strong>{word}</strong>.
        </p>
        {saveError && (
          <p role="alert">
            {saveError}{" "}
            <button disabled={saving} onClick={onRetry}>
              Retry save
            </button>
          </p>
        )}
        <button disabled={disabled} onClick={onNewGame} autoFocus>
          Play again
        </button>
      </div>
    </div>
  );
}
