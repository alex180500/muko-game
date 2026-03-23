# Product Requirements Document: Müko

## 1. Product Overview

Müko is an online, real-time multiplayer abstract strategy game played on an 8x8 board, inspired by the Eastern European game Ugolki. The objective is to move a starting grid of pieces across the board into the opponent's starting corner.

The project currently runs on a `boardgame.io` + Koa backend hosted on Render. The planned architecture migration will replace this with a custom real-time state machine powered by Cloudflare Workers and Durable Objects, eliminating the dependency on Render's paid plan.

## 2. Core Game Mechanics (The Rules Engine)

The `@muko/logic` workspace serves as the source of truth for both the client (UI/Premoves) and the server (Validation).

- **Board Setup:** 8x8 grid. Two modes are supported:
  - `3x3` (default): 9 pieces per player.
  - `3x4`: 12 pieces per player.
  - **Player 0 (White):** Starts in the Bottom-Left corner.
  - **Player 1 (Black):** Starts in the Top-Right corner.
- **Movement Constraints:** Players move one piece per turn.
  - **Slide:** Move one square orthogonally into an empty adjacent square.
  - **Jump:** Jump over a single adjacent piece (friendly or opponent) into an empty square immediately beyond it. Chain jumps are permitted if valid.
- **Capturing:** There is no capturing mechanism. Pieces remain on the board permanently.
- **Win Condition:** A player wins when all their pieces successfully occupy the opponent's starting corner grid.
- **Time Controls (Blitz/Rapid):** A countdown timer enforces turn limits.
- **Premoving:** Players can queue a valid move during the opponent's turn. The client stores this move locally and dispatches it immediately upon receiving the opponent's turn completion payload.

## 3. Architecture & Infrastructure

The project utilizes an npm workspace monorepo structure.

- **Frontend (`/frontend`):** React, Vite, TypeScript. Handles the UI, local state prediction (optimistic updates), and WebSocket client logic. Hosted on Vercel.
- **Shared Logic (`/packages/logic`):** Pure TypeScript functions defining board size, move validation, and win conditions. Package name: `@muko/logic`.

### Current Architecture (Active)

- **Backend (`/server`):** Node.js + Koa server powered by `boardgame.io`. Handles HTTP routing, match creation/joining, and real-time game state synchronization via `boardgame.io`'s internal WebSocket protocol. Hosted on Render.

### Target Architecture (Migration — see Phase 1 Roadmap)

- **Backend (`/worker`):** Cloudflare Workers. Handles HTTP routing and WebSocket upgrades.
- **Game State (`/worker`):** Cloudflare Durable Objects. A single-threaded, in-memory state machine for each active game room. Handles move validation, turn switching, and broadcasting updates.
- **Database (Future):** Cloudflare D1 (SQLite) for user accounts, persistent match history, and Elo ratings.

## 4. Network & Data Schemas (WebSockets — Target Spec)

> **Note:** These schemas apply to the target Cloudflare architecture (Phase 1). The current `boardgame.io` backend uses its own internal protocol.

Data transmitted between the client and the Durable Object must adhere to strict JSON payloads.

**Client-to-Server Payloads:**

- `INIT_CONNECTION`: `{"type": "init", "roomId": "string", "userId": "string"}`
- `SUBMIT_MOVE`: `{"type": "move", "from": [x, y], "to": [x, y], "player": 0 | 1}`

**Server-to-Client Broadcasts:**

- `GAME_STATE_UPDATE`: `{"type": "update", "board": [[...]], "turn": 0 | 1, "timeRemaining": {"p0": int, "p1": int}, "lastMove": {"from": int, "to": int}}`
- `ERROR`: `{"type": "error", "message": "string"}`
- `GAME_OVER`: `{"type": "end", "winner": 0 | 1}`

## 5. Development Roadmap

### Phase 1: Engine Migration & Parity

- Initialize Cloudflare Worker and Durable Object classes for WebSocket routing and in-memory state.
- Implement custom `useGameSocket` hook in the frontend to replace `boardgame.io`'s client.
- Strip `boardgame.io` from the React frontend and the `/server` backend.
- Deploy custom WebSocket stack to Cloudflare; retire the Render deployment.
- Deploy and test basic PvP movement end-to-end.

### Phase 2: Advanced Mechanics

- Implement backend timestamps and countdown logic inside the Durable Object.
- Implement frontend UI for clocks and move history.
- Implement frontend `PremoveQueue` logic.

### Phase 3: Persistence & Authentication

- Integrate Cloudflare D1 for database storage.
- Implement user registration/login flow.
- Save completed match data to D1.
- Implement Elo rating system.

## 6. Security Requirements

- **Server-Side Validation:** The Durable Object must validate every move using the `@muko/logic` shared logic to prevent client-side cheating.
- **Rate Limiting:** Implement basic rate limiting on the Worker to prevent WebSocket spam.
- **Origin Locking:** Configure Cloudflare to only accept WebSocket upgrades from the production frontend domain.
