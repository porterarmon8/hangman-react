# React Hangman

Guess a programming word before you run out of five lives. Enter a player name to save wins, losses, and your win percentage in DynamoDB Local.

## Start with Docker Compose

Install Docker Desktop or Docker Engine with Compose, then run:

```bash
docker compose up --build
```

Open http://localhost:5173. The frontend proxies `/api` to the Node server. The API is also available at http://localhost:3001 for Postman. The server creates its DynamoDB table at startup. The `player-data` volume preserves stats across `docker compose down` and subsequent startups.

For guest gameplay only, install Node.js 22 or later, run `npm ci` and `npm run dev`, then open the same frontend URL.

## Play and demonstrate

1. Enter a name and click **Log in**. The browser looks up the name and creates a profile if the API returns 404. A returning player sees their existing results and the login button disappears.
2. Guess letters. Five incorrect guesses end the round. A finished signed-in round updates the counts in React immediately and then saves to DynamoDB. If the save fails, use **Retry save**.
3. Start a new round to demonstrate the other outcome. Refresh and enter the same name to confirm that the counts persisted.
4. To demonstrate identical display names, use **Create separate profile** while signed out. A later name lookup shows matching profiles with ID prefixes so you can choose one.

Sign-in identifies a profile by name for the classroom demo. Anyone with access to the app can select a profile by name. Guest rounds are playable and do not affect saved stats.

## API and Postman

| Method | Address or path | Body | Expected result |
| --- | --- | --- | --- |
| GET | `http://localhost:3001/api/players?playerName=Demo` | None | 404 for a new name, or 200 with a `players` array |
| POST | `http://localhost:3001/api/players` | `{"playerName":"Demo"}` | 201 with a generated `playerID` and zero wins and losses |
| PUT | `http://localhost:3001/api/players/<playerID>/stats` | `{"gameID":"e868691a-771e-4b13-9d8f-f83442b8b33c","outcome":"won"}` | 200 with the updated player |

Use **Body → raw → JSON** for POST and PUT. Run the GET before and after POST. Copy the ID from the POST response into the PUT path. Send the same PUT twice to verify it counts once. Send another PUT with a different game ID and `"outcome":"lost"`, then confirm one win and one loss in the UI. Each POST creates a separate profile, even for an existing name.

The table uses a UUID `playerID` as its partition key. The API looks up names case-insensitively with an indexed DynamoDB query. A transaction increments the matching counter and records the game ID together so retries count only once.

## Tests

```bash
npm ci
npm test
npm run build
docker compose config --quiet
```

The unit tests cover API handlers with a test repository and verify rendered player name, win percentage, and login visibility. Use the Postman steps above to exercise the running API and DynamoDB together.

## Files

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Gameplay, player state, and result saving |
| `src/components/PlayerPanel.jsx` | Player sign-in and statistics |
| `src/playerApi.js` | Frontend requests using fetch and async/await |
| `server/index.js` | Starts the API after DynamoDB initialization |
| `server/app.js` | GET, POST, and PUT request handlers |
| `server/players.js` | DynamoDB setup, queries, and result transactions |
| `docker-compose.yml` | Frontend, API, and DynamoDB Local configuration |
| `AI_CONTRIBUTION.md` | AI assistance disclosure |

The game uses instructor-provided drawing assets, ending with `Dead.png` after five incorrect guesses. Created for a class assignment. No open-source license has been granted.

## References

- [DynamoDB Local with Docker](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)
- [DynamoDB with the AWS SDK for JavaScript](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/programming-with-javascript.html)
- [Running DynamoDB Locally Using Docker](https://medium.com/@bthiban/running-dynamodb-locally-using-docker-68c8bbed29fa)
