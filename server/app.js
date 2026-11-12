import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
export function createApp(store) {
  const app = express();
  app.use(
    cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }),
  );
  app.use(express.json({ limit: "10kb" }));
  const name = (value) =>
    typeof value === "string" ? value.trim().normalize("NFKC") : "";
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.get("/api/players", async (req, res) => {
    const playerName = name(req.query.playerName);
    if (!playerName || playerName.length > 40)
      return res
        .status(400)
        .json({ error: "Enter a player name of 1–40 characters." });
    const players = await store.find(playerName.toLowerCase());
    res.status(players.length ? 200 : 404).json({ players });
  });
  app.post("/api/players", async (req, res) => {
    const playerName = name(req.body?.playerName);
    if (!playerName || playerName.length > 40)
      return res
        .status(400)
        .json({ error: "Enter a player name of 1–40 characters." });
    res
      .status(201)
      .json(
        await store.create({
          playerID: randomUUID(),
          playerName,
          nameKey: playerName.toLowerCase(),
          wins: 0,
          losses: 0,
          version: 0,
        }),
      );
  });
  app.put("/api/players/:playerID", async (req, res) => {
    const { wins, losses, version } = req.body || {};
    if (
      ![wins, losses, version].every(
        (n) => Number.isSafeInteger(n) && n >= 0 && n < Number.MAX_SAFE_INTEGER,
      )
    )
      return res
        .status(400)
        .json({
          error: "Stats and version must be nonnegative safe integers.",
        });
    try {
      res.json(
        await store.update(req.params.playerID, { wins, losses, version }),
      );
    } catch (error) {
      if (error.name !== "ConditionalCheckFailedException") throw error;
      res
        .status(409)
        .json({
          error:
            "Profile changed, is missing, or the result is invalid. Reload and log in again.",
        });
    }
  });
  app.use((error, req, res, next) => {
    console.error(error);
    res
      .status(error.status === 400 ? 400 : 500)
      .json({
        error:
          error.status === 400
            ? "Invalid JSON."
            : "Database unavailable. Please try again.",
      });
  });
  return app;
}
