// Stores and retrieves per-match session data in localStorage.
// Each match gets its own key so sessions survive page reloads and crashes.
// When auth/accounts are added, the same structure can be synced to a database
// with the clientID becoming a proper user ID.

export interface MatchSession {
  matchID: string;
  // boardgame.io player seat: "0" = White, "1" = Black
  playerID: "0" | "1";
  // Secret token returned by the boardgame.io join API — used to authenticate moves
  playerCredentials: string;
  // Stable per-browser identity (see identity.ts)
  clientID: string;
  // Optional display name — placeholder for future player name feature
  playerName?: string;
  // Game mode, stored so Play Again can reuse it
  mode?: "3x3" | "3x4";
}

const key = (matchID: string) => `muko:session:${matchID}`;

export const getSession = (matchID: string): MatchSession | null => {
  try {
    const raw = localStorage.getItem(key(matchID));
    return raw ? (JSON.parse(raw) as MatchSession) : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: MatchSession): void => {
  localStorage.setItem(key(session.matchID), JSON.stringify(session));
};

export const clearSession = (matchID: string): void => {
  localStorage.removeItem(key(matchID));
};
