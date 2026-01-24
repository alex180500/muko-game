// server/index.ts
import { Server, Origins } from "boardgame.io/server";
import { Muko } from "../frontend/src/Game";

const customGenerator = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const server = Server({
  games: [Muko],
  uuid: customGenerator,
  origins: [
    Origins.LOCALHOST,
    /^http:\/\/(\d+\.\d+\.\d+\.\d+|localhost)(:\d+)?$/,
    "https://your-frontend-on-vercel.app",
  ],
});

server.run(8000);
