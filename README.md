# Muko - Online Board Game

A web-based 2-player strategy game inspired by Ugolki and Checkers. Built to be played online with friends via invite links.

## Project Structure

This project is organized as a monorepo:

- **`frontend/`**:  React application (Vite) for the game interface.
- **`server/`**: Node.js server (Koa + boardgame.io) for game logic and multiplayer matchmaking.

## Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Start the Server
The server handles the game state and multiplayer connections.

```bash
cd server
npm install
npm start
```
*Server runs on port 8000.*

### 2. Start the Frontend
The frontend is the visual game board.

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:5173 (usually).*

### 3. How to Play
1. Open the frontend URL.
2. Click **"Create New Game (Host)"**.
3. Choose your color (e.g., "Play as White").
4. Copy the URL from your browser's address bar.
5. Send the link to your friend (or open in a new Incognito window for testing).
6. The second player opens the link and clicks **"Play as Black"**.

## Deployment

### 1. Backend (Server)
Deploy the contents of the `server` folder to a Node.js hosting service like **Render**, **Railway**, or **Heroku**.
- **Build Command:** `npm install` (or `npm install && npm run build` if using TS build step)
- **Start Command:** `npm start`
- **Environment Variables:**
    - `PORT`: 8000 (usually set automatically by host)

### 2. Frontend (Client)
Deploy the contents of the `frontend` folder to a static site host like **Vercel** or **Netlify**.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
    - `VITE_GAME_SERVER`: The URL of your deployed backend (e.g., `https://muko-server.onrender.com`)

### Notes for Production
In `server/index.ts`, update the `origins` array to include your deployed frontend domain to avoid CORS issues.

```ts
origins: [
  Origins.LOCALHOST,
  'https://your-muko-frontend.vercel.app',
],
```

## Technologies
- [boardgame.io](https://boardgame.io/) - State management and multiplayer engine.
- [React](https://react.dev/) - UI Library.
- [Vite](https://vitejs.dev/) - Build tool.
- [Koa](https://koajs.com/) - Web framework for the server.
