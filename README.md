# React Hangman with DynamoDB player profiles

Guess a programming word in five lives. Player names, wins, losses, and winning percentages persist in DynamoDB Local. React uses `fetch` with `async`/`await`; the Node/Express API uses AWS SDK v3.

## Start using Docker Compose

Install Docker Desktop (or Docker Engine plus the Compose plugin), then:

```sh
git clone https://github.com/porterarmon8/hangman-react.git
cd hangman-react
git checkout feature/dynamodb-player-stats
docker compose up --build
```

Open http://localhost:5173. The API is at http://localhost:3001 and DynamoDB Local at http://localhost:8000. The API creates the table and waits for it before listening; Compose waits for the API health check before starting Vite.

Stop with `docker compose down`. Player records survive restarts in the `dynamodb-data` volume. `docker compose down -v` deletes all local records.

## Local development

Requires Node.js 22+ and npm. Start DynamoDB, then run the server and UI in separate terminals:

```sh
npm ci
docker compose up -d dynamodb
npm run server
# Another terminal:
npm run dev
```

Vite proxies `/api` to port 3001. `API_PROXY_TARGET` overrides that target; Compose uses `http://api:3001`. Server environment variables: `PORT` (3001), `DYNAMODB_ENDPOINT` (`http://localhost:8000`), `DYNAMODB_TABLE` (`HangmanPlayers`), `AWS_REGION` (`us-east-1`), `CLIENT_ORIGIN` (`http://localhost:5173`). The SDK uses dummy local credentials; this configuration is for DynamoDB Local.

## Players and gameplay

1. Enter a name and select **Log in**. GET looks up the normalized name with DynamoDB **Query**, never Scan. A 404 triggers POST to create a new profile. A returning player sees their stored name and stats, and the login form disappears.
2. Names are trimmed, Unicode-normalized, and compared case-insensitively. Each profile has a UUID `playerID` primary key. **Create separate profile** lets people with a common name create independent records. If multiple profiles match, choose your ID from the list. Remember your ID when sharing a name.
3. Guess letters. A win or five mistakes updates React player state first, then sends one PUT. Winning percentage is `wins / (wins + losses) * 100`, or 0.0% before any finished games.
4. Save failures retain the local result and show **Retry save**. The next game is blocked until persistence succeeds. A stale version (409) requires reloading and logging in again. If a response was lost after a successful write, reloading restores the saved result; retry cannot count it twice.
5. New Game during an unfinished round abandons that round without recording a loss. Reload to change players; completed-game stats persist, unfinished guesses do not.

Name-only login is a classroom profile selector, not secure authentication. Anyone who knows a name can select a profile. Do not deploy publicly with personal data without adding authentication and authorization.

## Server files and data model

- `server/index.js`: initializes DynamoDB, then starts Express.
- `server/app.js`: CORS, JSON validation, GET/POST/PUT routes, and error responses; dependency injection supports API unit tests.
- `server/db.js`: AWS SDK v3 table initialization and database operations.
- `src/api.js`: browser fetch functions; `PlayerPanel.jsx`: profile selection and stats; `App.jsx`: game state and optimistic saves.

Table: `HangmanPlayers`, partition key `playerID` (string). Attributes: `playerName`, normalized `nameKey`, `wins`, `losses`, `version`. GSI `playerName-index` partitions by `nameKey` and projects all fields. Lookup paginates Query results. The GSI is eventually consistent, so a just-created profile may take a moment to appear in name lookup. POST returns the new record directly so login does not wait for the index.

PUT uses a conditional update: the record must exist, its version must match, and exactly one of wins/losses must increase by one. This prevents overwrites from stale tabs and duplicate counting. Each accepted update increments `version`.

## API and Postman

Import `postman/Hangman.postman_collection.json` in the **Postman desktop app**. Start the stack first. Run requests in order: missing name (404), create (201), lookup (200), win PUT (200), loss PUT (200), stale PUT (409). The create-request test saves `playerID` and the initial `version`; the example PUT bodies use versions 0 and 1. Change the collection’s `playerName` variable to a fresh name before each full run. Use the desktop app to demonstrate these requests during your screen share.

| Method | Route | Request | Response |
| --- | --- | --- | --- |
| GET | `/api/players?playerName=Alex` | URL-encoded name | 200 `{players: [...]}`; 404 `{players: []}` |
| POST | `/api/players` | `{"playerName":"Alex"}` | 201 player with UUID, zero stats, version 0 |
| PUT | `/api/players/:playerID` | `{"wins":1,"losses":0,"version":0}` | 200 updated player, version 1; 409 conflict/invalid transition/missing record |
| GET | `/api/health` | — | 200 after table initialization |

Invalid names or stats return 400; database failures return 500. Names must be 1–40 characters after normalization. Stats and versions must be nonnegative safe integers.

## Testing

```sh
npm test                 # React UI and API unit tests, no database needed
npm run build            # Production frontend compilation
npm run test:integration # Requires API + DynamoDB Local on ports 3001/8000
```

Unit tests cover player display, 404 creation, returning login, win/loss percentages, optimistic updates, save retries, name validation, UUID collision avoidance, API lookup, PUT validation, and conflict responses. Integration tests use real DynamoDB Local and leave uniquely named test profiles in the local database.

Optional browser demo (Linux Chromium):

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/hangman-playwright npx playwright install ffmpeg
PLAYWRIGHT_BROWSERS_PATH=/tmp/hangman-playwright node tests/browser-demo.js
```

The browser script uses `/usr/bin/chromium`, verifies creation, a win, a loss, and stats after reload. It writes a screenshot and WebM recording to ignored `artifacts/`. It fixes word randomness only inside the test browser. Adjust the executable path for your OS. `npm run build` checks the frontend bundle; the deployed frontend needs a reverse proxy for `/api` (Vite preview alone does not provide the development proxy).

## Screen-share checklist

1. Show the branch and `docker compose up --build` with all three services.
2. In Postman, demonstrate 404 → POST → GET → PUT and inspect the UUID, stats, and version.
3. In the browser, create a player; show login disappearing, then a win/loss and changed percentage.
4. Reload and log in with the same name to show persistence; create two same-name profiles to show separate IDs.
5. Show `npm test`, integration checks, `server/app.js`, `server/db.js`, and `AI_CONTRIBUTIONS.md`.

A generated browser recording is demo evidence; complete the required live screen share or submission recording according to the instructor's rules.

## Assets and AI attribution

Hangman PNGs are instructor-provided. Current five-life sequence: `noose.png`, `upperbody.png`, `upperandlowerbody.png`, `botharms.png`, `1leg.png`, `Dead.png`. See `AI_CONTRIBUTIONS.md` for AI assistance and verification details.

Created for a class assignment. No open-source license has been granted.
