async function readResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The player request failed.');
  return data;
}

export async function findPlayers(playerName) {
  const query = new URLSearchParams({ playerName });
  const response = await fetch(`/api/players?${query}`);
  if (response.status === 404) return [];
  return (await readResponse(response)).players;
}

export async function createPlayer(playerName) {
  return readResponse(await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName }),
  }));
}

export async function saveResult(playerID, gameID, outcome) {
  return readResponse(await fetch(`/api/players/${playerID}/stats`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameID, outcome }),
  }));
}
