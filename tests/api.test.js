// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../server/app.js";
describe("player API", () => {
  const store = { find: vi.fn(), create: vi.fn((p) => p), update: vi.fn() };
  const app = createApp(store);
  it("returns 404 for new players and queries a normalized name", async () => {
    store.find.mockResolvedValue([]);
    expect(
      (await request(app).get("/api/players?playerName=%20Alex%20")).status,
    ).toBe(404);
    expect(store.find).toHaveBeenLastCalledWith("alex");
  });
  it("returns all profiles sharing a name", async () => {
    store.find.mockResolvedValue([{ playerID: "a" }, { playerID: "b" }]);
    expect(
      (await request(app).get("/api/players?playerName=Alex")).body.players,
    ).toHaveLength(2);
  });
  it("creates separate UUID profiles with zero stats", async () => {
    const a = await request(app)
      .post("/api/players")
      .send({ playerName: " Alex " });
    const b = await request(app)
      .post("/api/players")
      .send({ playerName: "Alex" });
    expect(a.status).toBe(201);
    expect(a.body).toMatchObject({
      playerName: "Alex",
      wins: 0,
      losses: 0,
      version: 0,
    });
    expect(a.body.playerID).not.toBe(b.body.playerID);
  });
  it("rejects invalid names and stats", async () => {
    for (const playerName of ["", " ", "x".repeat(41), 123])
      expect(
        (await request(app).post("/api/players").send({ playerName })).status,
      ).toBe(400);
    expect((await request(app).get("/api/players")).status).toBe(400);
    for (const wins of [-1, 0.5, "1", null])
      expect(
        (
          await request(app)
            .put("/api/players/a")
            .send({ wins, losses: 0, version: 0 })
        ).status,
      ).toBe(400);
  });
  it("updates stats and reports stale versions", async () => {
    store.update.mockResolvedValueOnce({ wins: 1, losses: 0, version: 1 });
    expect(
      (
        await request(app)
          .put("/api/players/a")
          .send({ wins: 1, losses: 0, version: 0 })
      ).body.version,
    ).toBe(1);
    store.update.mockRejectedValueOnce({
      name: "ConditionalCheckFailedException",
    });
    expect(
      (
        await request(app)
          .put("/api/players/a")
          .send({ wins: 1, losses: 0, version: 0 })
      ).status,
    ).toBe(409);
  });
});
