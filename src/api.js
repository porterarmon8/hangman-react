async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(data.error || "Request failed."), {
      status: response.status,
    });
  return data;
}
const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
export const findPlayers = (name) =>
  request(`/players?playerName=${encodeURIComponent(name)}`);
export const createPlayer = (playerName) =>
  request("/players", json("POST", { playerName }));
export const savePlayer = (player) =>
  request(
    `/players/${player.playerID}`,
    json("PUT", {
      wins: player.wins,
      losses: player.losses,
      version: player.version,
    }),
  );
