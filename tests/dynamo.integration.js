// Run against a running API and real DynamoDB Local: npm run test:integration
import assert from "node:assert/strict";
const base = process.env.API_URL || "http://localhost:3001";
const name = `Integration ${Date.now()}`;
async function req(path, method = "GET", body) {
  const r = await fetch(base + "/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  return [r.status, await r.json()];
}
assert.equal(
  (await req(`/players?playerName=${encodeURIComponent(name)}`))[0],
  404,
);
const [status, p] = await req("/players", "POST", { playerName: name });
assert.equal(status, 201);
const [, duplicate] = await req("/players", "POST", { playerName: name });
assert.notEqual(p.playerID, duplicate.playerID);
const [updated, win] = await req(`/players/${p.playerID}`, "PUT", {
  wins: 1,
  losses: 0,
  version: 0,
});
assert.equal(updated, 200);
assert.equal(win.version, 1);
assert.equal(
  (
    await req(`/players/${p.playerID}`, "PUT", {
      wins: 1,
      losses: 0,
      version: 0,
    })
  )[0],
  409,
);
assert.equal(
  (
    await req(`/players/${p.playerID}`, "PUT", {
      wins: 99,
      losses: 0,
      version: 1,
    })
  )[0],
  409,
);
assert.equal(
  (
    await req(`/players/${p.playerID}`, "PUT", {
      wins: 1,
      losses: 1,
      version: 1,
    })
  )[0],
  200,
);
const [, found] = await req(
  `/players?playerName=${encodeURIComponent(name.toLowerCase())}`,
);
assert.equal(found.players.length, 2);
assert.equal(found.players.find((x) => x.playerID === p.playerID).losses, 1);
console.log(
  "PASS: real DynamoDB create/query, duplicate names, win/loss updates, stale and invalid update rejection",
);
