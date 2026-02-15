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

This project is organized as a monorepo containing both the frontend client and the game server.

### Stack

- **Engine**: [boardgame.io](https://boardgame.io/) (State management & Multiplayer)
- **Frontend**: React, Vite, TypeScript, CSS Modules.
- **Backend**: Node.js, Koa (with boardgame.io).

### Running Locally

To play the game on your local machine, you need to run both the server and the client.

1. **Start the Server:** The server handles game state, moves, and matchmaking.

   ```bash
   cd server
   npm install
   npm start
   ```

   _Runs on port `8000`._

2. **Start the Frontend:** The frontend provides the visual interface.

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   _Runs on `http://localhost:5173` (typically)._

3. **Play!**
   - Open the link shown in the frontend terminal.
   - Click **"Create New Game (Host)"**.
   - Share the URL (e.g., `.../play/K9X2`) with a friend (or open in a new browser tab) to join the game.

### Deployment Guide

1. **Backend (Server):** Deploy the `server/` folder to a Node.js hosting provider (Render, Railway, Heroku).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
   - The port is typically handled automatically, but ensure it exposes port `8000` if required.

2. **Frontend (Client):** Deploy the `frontend/` folder to a static host (Vercel, Netlify).
   - **App Type**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
   - `VITE_GAME_SERVER`: The URL of your deployed backend.

3. **Final Configuration:** In `server/index.ts`, update the `origins` array to allow your deployed frontend to connect.

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
