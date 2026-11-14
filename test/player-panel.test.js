import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'vite';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

test('player panel displays sign-in or the active player and win percentage', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'node_modules/.player-test-'));
  try {
    const bundle = await build({
      configFile: false,
      logLevel: 'silent',
      build: { ssr: 'src/components/PlayerPanel.jsx', write: false },
    });
    const entry = join(directory, 'panel.mjs');
    await writeFile(entry, bundle.output[0].code);
    const { default: PlayerPanel } = await import(pathToFileURL(entry));

    const guest = renderToStaticMarkup(React.createElement(PlayerPanel, { player: null }));
    assert.match(guest, /Player name/);
    assert.match(guest, /Log in/);

    const markup = renderToStaticMarkup(React.createElement(PlayerPanel, {
      player: { playerName: 'Armon', wins: 2, losses: 1 },
    }));
    assert.match(markup, /Armon/);
    assert.match(markup, /Wins: 2 \| Losses: 1 \| Win rate: 67%/);
    assert.doesNotMatch(markup, /Log in/);

    const newPlayer = renderToStaticMarkup(React.createElement(PlayerPanel, {
      player: { playerName: 'Jordan', wins: 0, losses: 0 },
    }));
    assert.match(newPlayer, /Win rate: 0%/);
  } finally {
    await rm(directory, { recursive: true });
  }
});
