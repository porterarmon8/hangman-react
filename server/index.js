import { createPlayerServer } from './app.js';
import { initializePlayers, players } from './players.js';

await initializePlayers();
createPlayerServer(players).listen(3001, '0.0.0.0', () => {
  console.log('Hangman player API listening on port 3001');
});
