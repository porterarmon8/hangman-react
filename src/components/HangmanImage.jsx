import React from 'react';
const stages = ['/noose.png','/upperbody.png','/upperandlowerbody.png','/1arm.png','/botharms.png','/Dead.png'];
export default function HangmanImage({ mistakes }) {
  return <img className="hangman" src={stages[Math.min(mistakes, 5)]} alt={`Hangman drawing, ${mistakes} of 5 incorrect guesses`} />;
}
