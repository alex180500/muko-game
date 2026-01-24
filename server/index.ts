// server/index.ts
import { Server, Origins } from "boardgame.io/server";
import { Muko } from "../frontend/src/Game";

const server = Server({
  games: [Muko],
  origins: [
    Origins.LOCALHOST,
    // Allow interactions from local network (for mobile testing)
    /^http:\/\/(\d+\.\d+\.\d+\.\d+|localhost)(:\d+)?$/, 
    // Your Vercel domain
    'https://your-frontend-on-vercel.app',
  ],
});

// This enables the standard Lobby API automatically!
server.run(8000);
