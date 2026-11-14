import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import test from 'node:test';
import { playerRequestHandler } from '../server/app.js';

const playerID = randomUUID();
const gameID = randomUUID();
const player = { playerID, playerName: 'Armon', wins: 0, losses: 0 };

test('player API handles lookup, creation, stats, and invalid input', async () => {
  const repository = {
    find: async name => name === 'Armon' ? [player] : [],
    create: async name => ({ ...player, playerName: name }),
    record: async (id, round, outcome) => {
      assert.equal(round, gameID);
      assert.equal(outcome, 'won');
      return id === playerID ? { ...player, wins: 1 } : null;
    },
  };
  const handle = playerRequestHandler(repository);

  async function send(path, method = 'GET', body) {
    const request = Readable.from(body ? [JSON.stringify(body)] : []);
    request.method = method;
    request.url = '/api/players' + path;
    let status;
    let json;
    await handle(request, {
      writeHead(code) { status = code; },
      end(payload) { json = JSON.parse(payload); },
    });
    return { status, json };
  }

  const existing = await send('?playerName=%20Armon%20');
  assert.equal(existing.status, 200);
  assert.deepEqual(existing.json, { players: [player] });
  assert.equal((await send('?playerName=Unknown')).status, 404);
  assert.equal((await send('')).status, 400);

  const created = await send('', 'POST', { playerName: ' Jordan ' });
  assert.equal(created.status, 201);
  assert.deepEqual(created.json, { ...player, playerName: 'Jordan' });
  assert.equal((await send('', 'POST', { playerName: ' ' })).status, 400);

  const result = { gameID, outcome: 'won' };
  const updated = await send(`/${playerID}/stats`, 'PUT', result);
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.json, { ...player, wins: 1 });
  assert.equal((await send(`/${randomUUID()}/stats`, 'PUT', result)).status, 404);
  assert.equal((await send(`/${playerID}/stats`, 'PUT', { ...result, outcome: 'tie' })).status, 400);
});
