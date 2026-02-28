// Stores and retrieves per-match session data in localStorage.
// Each match gets its own key so sessions survive page reloads and crashes.
// When auth/accounts are added, the same structure can be synced to a database
// with the clientID becoming a proper user ID.

const SESSION_PREFIX = "muko:session:";
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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
  // Timestamp for stale session cleanup
  createdAt?: number;
}

const key = (matchID: string) => `${SESSION_PREFIX}${matchID}`;

export const getSession = (matchID: string): MatchSession | null => {
  try {
    const raw = localStorage.getItem(key(matchID));
    return raw ? (JSON.parse(raw) as MatchSession) : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: MatchSession): void => {
  const withTimestamp = {
    ...session,
    createdAt: session.createdAt ?? Date.now(),
  };
  localStorage.setItem(key(session.matchID), JSON.stringify(withTimestamp));
};

export const clearSession = (matchID: string): void => {
  localStorage.removeItem(key(matchID));
};

// Removes sessions older than MAX_SESSION_AGE_MS from localStorage.
// Call once on app startup to prevent unbounded accumulation.
export const cleanupStaleSessions = (): void => {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(SESSION_PREFIX)) continue;

    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const session = JSON.parse(raw) as MatchSession;
      // Remove if older than threshold, or if missing createdAt (legacy entry)
      if (!session.createdAt || now - session.createdAt > MAX_SESSION_AGE_MS) {
        keysToRemove.push(k);
      }
    } catch {
      // Corrupt entry — remove it
      keysToRemove.push(k);
    }
  }

  keysToRemove.forEach((k) => localStorage.removeItem(k));
};
