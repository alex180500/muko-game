// server/index.ts
import { Server, Origins } from "boardgame.io/server";
import * as Logic from "@muko/logic";

const { Muko } = Logic;

const customGenerator = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};

const server = Server({
  games: [Muko],
  uuid: customGenerator,
  origins: [
    Origins.LOCALHOST,
    /^http:\/\/(\d+\.\d+\.\d+\.\d+|localhost)(:\d+)?$/,
    process.env.FRONTEND_URL || "https://your-frontend-on-vercel.app",
  ],
});

const port = Number(process.env.PORT) || 8000;
server.run(port);
