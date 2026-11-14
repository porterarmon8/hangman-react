import { createServer } from 'node:http';

const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function cleanName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  return name.length <= 40 ? name : '';
}

async function readJSON(request) {
  let body = '';
  for await (const chunk of request.setEncoding('utf8').iterator({ destroyOnReturn: false })) {
    body += chunk;
    if (body.length > 4096) return null;
  }
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export function playerRequestHandler(players) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const send = (status, payload) => {
      response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(payload));
    };

    try {
      if (request.method === 'GET' && url.pathname === '/api/players') {
        const name = cleanName(url.searchParams.get('playerName'));
        if (!name) return send(400, { error: 'Enter a player name of 1 to 40 characters.' });
        const matches = await players.find(name);
        if (!matches.length) return send(404, { error: 'Player not found.' });
        return send(200, { players: matches });
      }

      if (request.method === 'POST' && url.pathname === '/api/players') {
        const name = cleanName((await readJSON(request))?.playerName);
        if (!name) return send(400, { error: 'Enter a player name of 1 to 40 characters.' });
        return send(201, await players.create(name));
      }

      const statsRoute = /^\/api\/players\/([^/]+)\/stats$/.exec(url.pathname);
      if (request.method === 'PUT' && statsRoute) {
        const playerID = statsRoute[1];
        const { gameID, outcome } = (await readJSON(request)) || {};
        if (!uuid.test(playerID) || typeof gameID !== 'string' || !uuid.test(gameID)
          || !['won', 'lost'].includes(outcome)) {
          return send(400, { error: 'Provide a valid player ID, game ID, and outcome.' });
        }
        const player = await players.record(playerID, gameID, outcome);
        if (!player) return send(404, { error: 'Player not found.' });
        return send(200, player);
      }

      return send(404, { error: 'Route not found.' });
    } catch (error) {
      console.error(error);
      return send(500, { error: 'The player service could not complete the request.' });
    }
  };
}

export function createPlayerServer(players) {
  return createServer(playerRequestHandler(players));
}
