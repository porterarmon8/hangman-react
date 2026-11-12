import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
await fs.mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  recordVideo: { dir: "artifacts", size: { width: 1000, height: 900 } },
  viewport: { width: 1000, height: 900 },
});
const page = await context.newPage();
await page.addInitScript(() => {
  Math.random = () => 0;
});
await page.goto("http://localhost:5173");
const name = `Demo ${Date.now()}`;
await page.getByLabel("Player name").fill(name);
await page.getByRole("button", { name: "Log in", exact: true }).click();
await page.getByRole("heading", { name }).waitFor();
for (const letter of "REACT") {
  await page.getByLabel("Enter one letter").fill(letter);
  await page.getByRole("button", { name: "Guess", exact: true }).click();
}
await page.getByText("Winning percentage: 100.0%").waitFor();
await page.getByRole("button", { name: "Play again" }).click();
for (const letter of "BZXYQ") {
  await page.getByLabel("Enter one letter").fill(letter);
  await page.getByRole("button", { name: "Guess", exact: true }).click();
}
await page.getByText("Winning percentage: 50.0%").waitFor();
await page.getByRole("button", { name: "Play again" }).click();
await page.reload();
await page.getByLabel("Player name").fill(name);
await page.getByRole("button", { name: "Log in", exact: true }).click();
await page.getByText("Wins: 1 · Losses: 1").waitFor();
assert.equal(await page.getByText("Winning percentage: 50.0%").count(), 1);
await page.screenshot({ path: "artifacts/hangman-player-stats.png" });
await context.close();
await browser.close();
console.log(
  "PASS: browser creates player, wins, loses, reloads and restores DynamoDB stats. Video in artifacts/.",
);
