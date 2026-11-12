import { initialize, store } from "./db.js";
import { createApp } from "./app.js";
await initialize();
createApp(store).listen(process.env.PORT || 3001, "0.0.0.0", () =>
  console.log("Hangman API ready"),
);
