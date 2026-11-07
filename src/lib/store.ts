"use client";

import { useCallback, useReducer } from "react";
import type {
  GameConfig,
  HumanInfo,
  Intent,
  Phase,
  Player,
  Role,
  RoomState,
  TapWarState,
  TokenKind,
} from "./types";
import { decideWinner, describePlacement, placeToken, strikeLimitFor } from "./game-logic";
import { avatarFor, displayName } from "./identity";
import { useRoomSync } from "./room-channel";

export const TAP_WAR_MS = 5000;
export const MIN_PLAYERS = 2;

export interface GameState {
  phase: Phase;
  gameId: number;
  config: GameConfig | null;
  room: RoomState | null;
  tap: TapWarState | null;
  nickname: string;
  role: Role;
  roomCode: string | null;
  meId: string;
  hostId: string | null;
  humans: HumanInfo[];
}

export interface SyncSnapshot {
  phase: Phase;
  gameId: number;
  config: GameConfig | null;
  room: RoomState | null;
  tap: TapWarState | null;
  hostId: string;
}

export type Action =
  | { type: "SET_NICK"; nickname: string }
  | { type: "START"; config: GameConfig; now: number }
  | { type: "CREATE_ROOM"; config: GameConfig; code: string; meId: string }
  | { type: "OPEN_JOIN"; code: string }
  | { type: "JOIN_ROOM"; meId: string }
  | { type: "HUMANS"; humans: HumanInfo[] }
  | { type: "ADD_HUMAN"; human: HumanInfo }
  | { type: "SYNC"; snap: SyncSnapshot }
  | { type: "PLACE"; kind: TokenKind; optionId: string; now: number; by?: string }
  | { type: "TOGGLE_LOCK"; playerId: string; now: number }
  | { type: "TICK"; now: number }
  | { type: "TAP"; optionId: string; n: number }
  | { type: "TAP_END"; r: number }
  | { type: "RESET" };

export const initialState: GameState = {
  phase: "setup",
  gameId: 0,
  config: null,
  room: null,
  tap: null,
  nickname: "",
  role: "host",
  roomCode: null,
  meId: "me",
  hostId: null,
  humans: [],
};

function humansOf(state: GameState): HumanInfo[] {
  if (state.humans.some((h) => h.id === state.meId)) return state.humans;
  return [
    { id: state.meId, name: displayName(state.nickname, state.meId), avatar: avatarFor(state.meId) },
    ...state.humans,
  ];
}

function buildRoom(config: GameConfig, humans: HumanInfo[], code: string, now: number): RoomState {
  const players: Record<string, Player> = {};
  for (const h of humans) {
    players[h.id] = { id: h.id, name: h.name, avatarEmoji: h.avatar, isLockedIn: false };
  }
  return {
    roomCode: code,
    category: config.category,
    themeId: config.themeId,
    status: "active",
    // Auto-scales: 2 strikes to ban, 3 for groups of 6+.
    strikeLimitToBan: strikeLimitFor(humans.length),
    durationSeconds: config.durationSeconds,
    endsAtTimestamp: now + config.durationSeconds * 1000,
    options: config.titles.map((title, i) => ({
      id: `opt${i}`,
      title,
      strikesFrom: [],
      heartsFrom: [],
      tiebreakerTaps: 0,
    })),
    players,
    feed: [],
    winnerId: null,
  };
}

function resolve(state: GameState, room: RoomState, now: number): GameState {
  const d = decideWinner(room.options, room.strikeLimitToBan);
  if (d.winnerId) {
    return {
      ...state,
      phase: "receipt",
      tap: null,
      room: { ...room, status: "finished", winnerId: d.winnerId },
    };
  }
  return {
    ...state,
    phase: "tapwar",
    tap: { endsAt: now + TAP_WAR_MS, finalists: d.finalists },
    room: {
      ...room,
      status: "tiebreaker",
      options: room.options.map((o) => ({ ...o, tiebreakerTaps: 0 })),
    },
  };
}

function place(state: GameState, pid: string, kind: TokenKind, optionId: string, now: number): GameState {
  const room = state.room;
  if (!room || state.phase !== "arena" || !room.players[pid] || room.players[pid].isLockedIn) return state;
  const res = placeToken(room.options, pid, kind, optionId);
  if (!res.changed) return state;
  const events = describePlacement(
    room.options,
    res.options,
    room.players[pid],
    kind,
    optionId,
    room.strikeLimitToBan,
    now,
  );
  return { ...state, room: { ...room, options: res.options, feed: [...room.feed, ...events] } };
}

export function reducer(state: GameState, a: Action): GameState {
  switch (a.type) {
    case "SET_NICK":
      return { ...state, nickname: a.nickname };
    case "CREATE_ROOM":
      return {
        ...state,
        role: "host",
        roomCode: a.code,
        meId: a.meId,
        hostId: a.meId,
        config: a.config,
        phase: "lobby",
        room: null,
        tap: null,
        humans: [],
      };
    case "OPEN_JOIN":
      return { ...state, role: "guest", roomCode: a.code, phase: "join" };
    case "JOIN_ROOM":
      return { ...state, meId: a.meId, phase: "lobby" };
    case "HUMANS":
      return { ...state, humans: a.humans };
    case "ADD_HUMAN":
      if (state.humans.some((h) => h.id === a.human.id)) return state;
      return { ...state, humans: [...state.humans, a.human] };
    case "SYNC":
      if (state.role !== "guest") return state;
      return {
        ...state,
        phase: a.snap.phase,
        gameId: a.snap.gameId,
        config: a.snap.config,
        room: a.snap.room,
        tap: a.snap.tap,
        hostId: a.snap.hostId,
      };
    case "START": {
      if (state.role === "guest") return state;
      const humans = humansOf(state);
      if (humans.length < MIN_PLAYERS) return state;
      return {
        ...state,
        phase: "arena",
        gameId: state.gameId + 1,
        config: a.config,
        tap: null,
        room: buildRoom(a.config, humans, state.roomCode ?? "ROOM", a.now),
      };
    }
    case "PLACE":
      return place(state, a.by ?? state.meId, a.kind, a.optionId, a.now);
    case "TOGGLE_LOCK": {
      const room = state.room;
      if (!room || state.phase !== "arena" || !room.players[a.playerId]) return state;
      const p = room.players[a.playerId];
      const players = { ...room.players, [a.playerId]: { ...p, isLockedIn: !p.isLockedIn } };
      const next = { ...room, players };
      // Everyone locked in → resolve early. Unlocking keeps the round going.
      if (Object.values(players).every((x) => x.isLockedIn)) return resolve(state, next, a.now);
      return { ...state, room: next };
    }
    case "TICK":
      if (
        state.role !== "guest" &&
        state.phase === "arena" &&
        state.room?.endsAtTimestamp &&
        a.now >= state.room.endsAtTimestamp
      ) {
        return resolve(state, state.room, a.now);
      }
      return state;
    case "TAP": {
      if (state.phase !== "tapwar" || !state.room || !state.tap) return state;
      if (!state.tap.finalists.includes(a.optionId)) return state;
      return {
        ...state,
        room: {
          ...state.room,
          options: state.room.options.map((o) =>
            o.id === a.optionId ? { ...o, tiebreakerTaps: o.tiebreakerTaps + a.n } : o,
          ),
        },
      };
    }
    case "TAP_END": {
      if (state.role === "guest" || state.phase !== "tapwar" || !state.room || !state.tap) return state;
      const fin = state.room.options.filter((o) => state.tap!.finalists.includes(o.id));
      const max = Math.max(...fin.map((o) => o.tiebreakerTaps));
      const top = fin.filter((o) => o.tiebreakerTaps === max);
      const winner = top[Math.floor(a.r * top.length) % top.length];
      return {
        ...state,
        phase: "receipt",
        tap: null,
        room: { ...state.room, status: "finished", winnerId: winner.id },
      };
    }
    case "RESET":
      return { ...initialState, nickname: state.nickname };
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const send = useRoomSync(state, dispatch);
  const { role, meId } = state;

  /** Player intents: guests send to the host; the host applies locally. */
  const act = useCallback(
    (i: Intent) => {
      if (role === "guest") return send(i);
      const now = Date.now();
      if (i.t === "place") dispatch({ type: "PLACE", kind: i.kind, optionId: i.optionId, now });
      else if (i.t === "lock") dispatch({ type: "TOGGLE_LOCK", playerId: meId, now });
      else dispatch({ type: "TAP", optionId: i.optionId, n: i.n });
    },
    [role, meId, send],
  );

  return { state, dispatch, act };
}
