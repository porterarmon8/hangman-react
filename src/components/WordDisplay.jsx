import React from 'react';
export default function WordDisplay({ word, guessed }) {
  return <div className="word" aria-label="Mystery word">{[...word].map((letter, index) => <span key={index} className="letter">{guessed.includes(letter) ? letter : ' '}</span>)}</div>;
}
