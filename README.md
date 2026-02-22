<p align="center">
<img src="logo.svg">
</p>

# Müko

> [!NOTE]
> This project is under early development. Features, rules, and assets may change over time.

**Müko** is a two-player strategy game played on an 8x8 (chess) board. It is inspired by **Ugolki** (also known as Corners), a variation of checkers popular in Eastern Europe.

_Right now, the game is built to be playable online via sharable invite links._

> [!CAUTION]
> Although the core game code is Open Source, all artistic assets, game concept and branding are proprietary. Please see the **License & Intellectual Property** section at the bottom of this README for details.

## 🎮 How to Play

### Objective

The goal of the game is to move all of your pieces from your starting positions to the opponent's starting positions. There is no capturing in Müko. Pieces remain on the board; the goal is simply to race to the other side.

There are two possible setups in the game, which you can choose when creating a new game.

### Rules

1. **Players**: Player 0 (White) and Player 1 (Black).
2. **Setup**: The game allows two different kinds of setups:
   - _3x3_ - Each player starts with 9 pieces arranged in a 3x3 grid in their respective corner (bottom-left for white, top-right for black).
   - _3x4_ - Each player starts with 12 pieces arranged in a 3x4 grid in their respective corner.
3. **Movement**: Players take turns moving one piece per turn in two possible ways:
   - **Slide**: Move one square orthogonally (horizontally or vertically) into an empty adjacent square.
   - **Jumps**: Jump over an adjacent piece (friendly or opponent's) into an empty square immediately beyond it. You can chain multiple jumps in one single movement for big leaps across the board.

### Controls

- **Movement**: The game is designed to be played with a mouse or touch input.
   - **Clicks or touch**: select a piece and then select a valid destination square to move.
   - **Drag and Drop**: You can also drag a piece to a valid destination square to move it.
- **Flip Board**: Click the "Flip Board" button to rotate the view (Player 1/Black sees the board flipped by default).
- **Home**: Click the House icon to return to the main lobby.

## 🏗️ Project Architecture & Deployment

This project is organized as an **npm workspaces monorepo** with three packages:

```
muko-game/
  packages/logic/   → Shared game rules (@muko/logic) — raw TypeScript, no build step
  server/           → boardgame.io game server, run directly via tsx
  frontend/         → React/Vite SPA
```

Both the server and frontend consume `@muko/logic` raw TypeScript source directly — no compilation step is needed for the shared package.

### Stack

- **Engine**: [boardgame.io](https://boardgame.io/) (State management & Multiplayer)
- **Frontend**: React, Vite, TypeScript.
- **Backend**: Node.js + Koa (via boardgame.io), run with `tsx`.
- **Shared Logic**: `@muko/logic` — plain TypeScript, consumed directly by both packages.

### Running Locally

To play the game locally, run everything from the monorepo root.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development mode (server + frontend):**

   ```bash
   npm run dev
   ```

   _Server runs on port `8000` and frontend on `http://localhost:5173` (typically). No build step is needed — both Vite and the server consume the shared logic package's TypeScript source directly._

3. **Optional — type-check the frontend:**

   ```bash
   npm run typecheck -w muko-frontend
   ``` 

4. **Play!**
   - Open the link shown in the frontend terminal.
   - Click **"Create New Game (Host)"**.
   - Share the URL (e.g., `.../play/K9X2`) with a friend (or open in a new browser tab) to join the game.

### Deployment Guide

1. **Backend (Server):** Deploy the `server/` folder to a Node.js hosting provider (Render, Railway, Heroku).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (runs via `tsx`, no compilation step needed)
   - **Environment Variables**:
     - `PORT`: The server port (defaults to `8000`, most providers set this automatically).
     - `FRONTEND_URL`: The URL of your deployed frontend (for CORS).

2. **Frontend (Client):** Deploy the `frontend/` folder to a static host (Vercel, Netlify).
   - **App Type**: Vite
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build` (runs `vite build` only — no separate TS compile step)
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_GAME_SERVER`: The full URL of your deployed backend (e.g. `https://muko-server.onrender.com`).

3. **Final Configuration:** In `server/index.ts`, update the `origins` array to include your deployed frontend URL.

## ⚖️ License & Intellectual Property

This project operates under a **Dual License** model. Please read carefully to understand what you can and cannot do with this repository.

### 1. The Source Code (Open Source)

The core logic, algorithms, and technical implementation (e.g., JavaScript/TypeScript code, game engine logic) are licensed under the **Apache License 2.0**. _See the [LICENSE](./LICENSE) file for the full legal text._

> [!TIP]
> ✅ **You may:** Learn from the code, fork it, modify it for your own use and projects, even for commercial use, but for your own distinct projects.

### 2. The Game Assets & Core Identity (Proprietary / All Rights Reserved)

The "Soul" of the game is **NOT** Open Source. All artistic assets, including but not limited to:

- **Visuals:** Sprites, UI designs, logos, the "Müko" brand name, and any art.
- **Audio:** Sound effects and music tracks.
- **Content:** Narrative text, specific level configurations, and the overall visual presentation.
- **Core Game Identity:** Rules, mechanics, and unique elements that define the game experience.

...are the exclusive property of the creator. **Copyright © 2026 Alessandro Romancino. All Rights Reserved.**

### What this means for you:

- ⛔ **No Re-hosting:** You may **NOT** host a playable version of this game on a public website (e.g., itch.io, Vercel, personal site) using these assets.
- ⛔ **No Reselling:** You may **NOT** sell this game or these assets on any platform.
- ⛔ **No Asset Reuse:** You may **NOT** extract the art or sound to use in your own projects (commercial or non-commercial).
- ✅ **Personal Use:** You **ARE** allowed to download, build, and run the game locally on your own machine for educational purposes or personal enjoyment.
- ✅ **Code Reuse:** You **ARE** allowed to copy and adapt the source code for your own projects, provided you do not use any of the proprietary assets or branding.

If you have any questions about licensing or usage, please feel free to contact me at `alessandro.romancino@gmail.com`.

## 📑 TODO

- [x] Possibility of seeing all possible moves for a piece when selected (like in lichess).
- [x] Music and sound effects.
- [ ] 3x4 setup available.
- [ ] Add a "Rematch" button at the end of the game.
- [ ] Database with results of games (nicknames, wins/losses) and a point system based on the places of the pieces at the end of the game (e.g., 3 points for each piece in the correct position, 1 point for each piece in the opponent's starting area but not in the correct position).
