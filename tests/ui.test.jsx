import React from "react";
import { it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../src/App.jsx";
import * as api from "../src/api";
vi.mock("../src/api", () => ({
  findPlayers: vi.fn(),
  createPlayer: vi.fn(),
  savePlayer: vi.fn(),
}));
const player = {
  playerID: "abc",
  playerName: "Alex",
  wins: 2,
  losses: 2,
  version: 0,
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Math, "random").mockReturnValue(0);
});
async function login() {
  fireEvent.change(screen.getByLabelText("Player name"), {
    target: { value: "Alex" },
  });
  fireEvent.click(screen.getByText("Log in"));
  await screen.findByRole("heading", { name: "Alex" });
}
function guess(letter) {
  fireEvent.change(screen.getByLabelText("Enter one letter"), {
    target: { value: letter },
  });
  fireEvent.click(screen.getByRole("button", { name: "Guess" }));
}
it("logs in, hides login, and displays existing stats", async () => {
  api.findPlayers.mockResolvedValue({ players: [player] });
  render(<App />);
  await login();
  expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  expect(screen.getByText("Winning percentage: 50.0%")).toBeInTheDocument();
});
it("handles 404 by creating a player", async () => {
  api.findPlayers.mockRejectedValue({ status: 404 });
  api.createPlayer.mockResolvedValue({ ...player, wins: 0, losses: 0 });
  render(<App />);
  await login();
  expect(api.createPlayer).toHaveBeenCalledWith("Alex");
  expect(screen.getByText("Winning percentage: 0.0%")).toBeInTheDocument();
});
it.each([
  ["REACT", 3, 2, "60.0"],
  ["BZXYQ", 2, 3, "40.0"],
])(
  "records %s once and updates UI before PUT resolves",
  async (letters, wins, losses, percent) => {
    api.findPlayers.mockResolvedValue({ players: [player] });
    api.savePlayer.mockReturnValue(new Promise(() => {}));
    render(<App />);
    await login();
    for (const letter of letters) guess(letter);
    expect(
      screen.getByText(`Winning percentage: ${percent}%`),
    ).toBeInTheDocument();
    expect(api.savePlayer).toHaveBeenCalledTimes(1);
    expect(api.savePlayer).toHaveBeenCalledWith({ ...player, wins, losses });
    expect(screen.getByText("Play again")).toBeDisabled();
  },
);
it("shows API errors without creating profiles", async () => {
  api.findPlayers.mockRejectedValue(new Error("Offline"));
  render(<App />);
  fireEvent.change(screen.getByLabelText("Player name"), {
    target: { value: "Alex" },
  });
  fireEvent.click(screen.getByText("Log in"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  expect(api.createPlayer).not.toHaveBeenCalled();
});
it("keeps optimistic stats on save failure and retries the same update", async () => {
  api.findPlayers.mockResolvedValue({ players: [player] });
  api.savePlayer
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValueOnce({ ...player, wins: 3, version: 1 });
  render(<App />);
  await login();
  for (const l of "REACT") guess(l);
  await screen.findByText("Retry save");
  expect(screen.getByText("Play again")).toBeDisabled();
  fireEvent.click(screen.getByText("Retry save"));
  await waitFor(() => expect(screen.getByText("Play again")).toBeEnabled());
  expect(api.savePlayer).toHaveBeenCalledTimes(2);
});
it('lets players choose among matching names and keeps IDs separate', async () => {
  api.findPlayers.mockResolvedValue({ players: [player, { ...player, playerID: 'second', wins: 8 }] });
  render(<App />);
  fireEvent.change(screen.getByLabelText('Player name'), { target: { value: 'Alex' } });
  fireEvent.click(screen.getByText('Log in'));
  await screen.findByText('Choose your profile:');
  fireEvent.click(screen.getByRole('button', { name: /second/ }));
  expect(screen.getByText('Player ID: second')).toBeInTheDocument();
  expect(screen.getByText('Winning percentage: 80.0%')).toBeInTheDocument();
});
