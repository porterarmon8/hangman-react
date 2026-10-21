# React Hangman Game

A single-player Hangman game built with **React** and **Vite**. Guess letters to reveal a hidden programming-related word before you run out of five lives.

## Features

- Six drawing stages, including the initial empty gallows and five incorrect-guess stages, using supplied image assets.
- One-letter text input with validation.
- Displays guessed letters, hidden/revealed word, and remaining lives.
- Repeated guesses do not cost a life.
- New Game button chooses another word and resets guesses.
- Win/loss pop-up with a Play Again button.
- React functional components, props, `useState`, derived state, and event handlers.

## Requirements

For local development: Node.js 20 or later and npm. For Docker: Docker Engine with Docker Compose plugin (or Docker Desktop).

## Installation and running locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. To check a production build, run `npm run build`.

## Running with Docker

```bash
docker compose up --build
```

Open **http://localhost:5173**. Stop with `Ctrl+C`, then `docker compose down` if needed.

## How to play

1. Enter one letter (A through Z) in the text box and click **Guess**.
2. Correct letters appear in the hidden word. Wrong letters use up one of five lives.
3. Guess the complete word to win. After five wrong guesses, you lose.
4. Use **New Game** at any time, or **Play again** after the result pop-up.

## Project structure

```text
src/
  App.jsx                     Game logic and state
  main.jsx                    React entry point
  style.css                   Styling
  components/
    HangmanImage.jsx          Drawing stage
    WordDisplay.jsx           Word progress
    LetterInput.jsx           One text-box input component
    ResultModal.jsx           Win/loss dialog
public/                        Provided hangman PNG images
Dockerfile                     Container configuration
docker-compose.yml             Docker Compose service
```

## React concepts used

`App` holds state with `useState` and passes data and event callbacks to child components using props. The input component manages its own text-box state. Conditional rendering shows the result dialog. Arrays are rendered with `map` and list keys.

## Assets and attribution

Hangman drawing PNG files are from the instructor-provided `public.zip`. The game uses `noose.png`, `upperbody.png`, `upperandlowerbody.png`, `1arm.png`, `botharms.png`, and `1leg.png` in order. `Dead.png` was also provided but is not used for the five-life sequence.

## AI contribution

ChatGPT assisted with scaffolding, React component implementation, gameplay logic, Docker configuration, and README drafting. Review and test the generated code yourself before submitting, and update this section to accurately reflect your own contributions.

## Limitations and future improvements

The word list is hard-coded, English letters only are supported, and progress resets on page reload. Future improvements could include categories, difficulty levels, and keyboard shortcuts.

## License

Created for a class assignment. No open-source license has been granted.
