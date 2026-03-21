// Per-match session data stored in sessionStorage (tab-scoped, cleared on close).
// clientID in identity.ts stays in localStorage — it is not a credential.

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
    const raw = sessionStorage.getItem(key(matchID));
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
  sessionStorage.setItem(key(session.matchID), JSON.stringify(withTimestamp));
};

export const clearSession = (matchID: string): void => {
  sessionStorage.removeItem(key(matchID));
};

// Removes sessions older than MAX_SESSION_AGE_MS from sessionStorage.
// sessionStorage clears on tab close anyway, but this guards against
// very long-lived tabs accumulating many stale entries.
export const cleanupStaleSessions = (): void => {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (!k?.startsWith(SESSION_PREFIX)) continue;

    try {
      const raw = sessionStorage.getItem(k);
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

  keysToRemove.forEach((k) => sessionStorage.removeItem(k));
};
