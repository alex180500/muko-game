// server/index.ts
import { Server, Origins } from "boardgame.io/server";
import { Muko } from "../frontend/src/Game";

const server = Server({
  games: [Muko],
  origins: [
    Origins.LOCALHOST,
    "https://your-frontend-on-vercel.app", // Your Vercel domain
  ],
});

// This enables the standard Lobby API automatically!
server.run(8000);
