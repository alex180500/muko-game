import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { SERVER_URL } from "../config";
import { getClientID } from "./identity";
import { getSession, saveSession, type MatchSession } from "./session";

// boardgame.io player info from the match list endpoint
interface MatchPlayer {
  id: number;
  name?: string;
}

interface MatchInfo {
  players: MatchPlayer[];
  setupData?: { mode?: "3x3" | "3x4"; debug?: boolean };
}

export type SessionState =
  | { status: "loading" }
  // Both seats free — player must pick a side
  | { status: "choose"; matchInfo: MatchInfo }
  // Session established (or reconnected) — ready to play
  | { status: "ready"; session: MatchSession }
  // Both seats occupied and this browser has no session — spectator
  | { status: "spectator" }
  | { status: "error"; message: string };

// Manages the player's identity in a specific match.
// On mount:
//   1. Looks for a saved session in localStorage → reconnects immediately.
//   2. Otherwise fetches match info from the server:
//      - 0 seats taken → returns "choose" so the UI can display side-picker.
//      - 1 seat taken  → silently auto-joins the remaining seat.
//      - 2 seats taken → returns "spectator".
// `chooseSide` is called by the side-picker UI and completes the join.
export function useMatchSession(matchID: string) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  // --- Internal helpers ---
  const callJoinAPI = useCallback(
    async (
      playerID: "0" | "1",
      mode: "3x3" | "3x4" | undefined,
      playerName?: string,
    ): Promise<MatchSession | null> => {
      const clientID = getClientID();
      const name = playerName ?? `player-${clientID.slice(0, 6)}`;
      try {
        const { data } = await axios.post(
          `${SERVER_URL}/games/muko/${matchID}/join`,
          { playerID: Number(playerID), playerName: name },
        );
        const session: MatchSession = {
          matchID,
          playerID,
          playerCredentials: data.playerCredentials,
          clientID,
          playerName: name,
          mode,
        };
        saveSession(session);
        return session;
      } catch (err: unknown) {
        // Seat may have just been taken by a race condition
        console.warn("Join failed:", err);
        return null;
      }
    },
    [matchID],
  );

  // --- Boot logic ---
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Reconnect from saved session
      const existing = getSession(matchID);
      if (existing) {
        if (!cancelled) setState({ status: "ready", session: existing });
        return;
      }

      // 2. Fetch live match state
      let matchInfo: MatchInfo;
      try {
        const { data } = await axios.get<MatchInfo>(
          `${SERVER_URL}/games/muko/${matchID}`,
        );
        matchInfo = data;
      } catch {
        if (!cancelled)
          setState({ status: "error", message: "Match not found." });
        return;
      }

      const takenPlayers = matchInfo.players.filter(
        (p) => p.name !== undefined,
      );
      const mode = matchInfo.setupData?.mode;

      if (takenPlayers.length === 2) {
        if (!cancelled) setState({ status: "spectator" });
        return;
      }

      if (takenPlayers.length === 0) {
        // Let the player choose their side
        if (!cancelled) setState({ status: "choose", matchInfo });
        return;
      }

      // Exactly 1 seat taken → auto-join the other
      const takenID = takenPlayers[0].id; // 0 or 1
      const openID: "0" | "1" = takenID === 0 ? "1" : "0";
      const session = await callJoinAPI(openID, mode);
      if (!cancelled) {
        if (session) setState({ status: "ready", session });
        else
          setState({
            status: "error",
            message: "Could not join — seat may already be taken.",
          });
      }
    }

    init().catch((err) => {
      console.error("useMatchSession unexpected error:", err);
      if (!cancelled)
        setState({
          status: "error",
          message: "Unexpected error — please try again.",
        });
    });
    return () => {
      cancelled = true;
    };
  }, [matchID, callJoinAPI]);

  // --- Public API ---
  // Called by the choose-side UI. Completes the join for the given seat.
  // Handles the possible race where the seat was taken between render and click.
  const chooseSide = useCallback(
    async (playerID: "0" | "1", playerName?: string) => {
      if (state.status !== "choose") return;
      const mode = state.matchInfo.setupData?.mode;

      setState({ status: "loading" }); // show spinner while joining

      // Race condition guard: re-fetch match info first
      let matchInfo: MatchInfo;
      try {
        const { data } = await axios.get<MatchInfo>(
          `${SERVER_URL}/games/muko/${matchID}`,
        );
        matchInfo = data;
      } catch {
        setState({ status: "error", message: "Match not found." });
        return;
      }

      const stillTakenByOther = matchInfo.players.find(
        (p) => String(p.id) === playerID && p.name !== undefined,
      );
      if (stillTakenByOther) {
        // That seat was grabbed — offer the other one or go spectator
        const otherId: "0" | "1" = playerID === "0" ? "1" : "0";
        const otherTaken = matchInfo.players.find(
          (p) => String(p.id) === otherId && p.name !== undefined,
        );
        if (otherTaken) {
          setState({ status: "spectator" });
        } else {
          setState({ status: "choose", matchInfo });
        }
        return;
      }

      const session = await callJoinAPI(playerID, mode, playerName);
      if (session) setState({ status: "ready", session });
      else setState({ status: "error", message: "Join failed." });
    },
    [matchID, state, callJoinAPI],
  );

  return { state, chooseSide };
}
