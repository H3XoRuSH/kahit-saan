"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Dispatch } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { resetClock, syncClock } from "./clock";
import type { Action, GameState } from "./store";
import type { HumanInfo, Intent } from "./types";
import { avatarFor, displayName } from "./identity";

interface PresenceMeta {
  name: string;
  avatar: string;
  at: number;
  isHost?: boolean;
}

function safeBroadcast(ch: RealtimeChannel | null, event: string, payload: unknown) {
  if (!ch) return;
  const adapter = (ch as unknown as { channelAdapter?: { canPush?: () => boolean } }).channelAdapter;
  if (adapter?.canPush && !adapter.canPush()) return;
  ch.send({ type: "broadcast", event, payload });
}

/**
 * Browser-hosted realtime sync over Supabase Broadcast + Presence.
 * - Host runs the reducer and broadcasts `state`.
 * - Guests send `intent`s; the host applies them.
 * Returns `send` for guests.
 */
export function useRoomSync(state: GameState, dispatch: Dispatch<Action>) {
  const chRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  const { role, roomCode, meId, phase } = state;
  const connected = !!roomCode && phase !== "join";

  useEffect(() => {
    if (!connected || !roomCode) return;
    const sb = getSupabase();
    const ch = sb.channel(`room:${roomCode}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: meId } },
    });
    chRef.current = ch;

    const sendState = () => {
      const s = latest.current;
      safeBroadcast(ch, "state", {
        phase: s.phase,
        gameId: s.gameId,
        config: s.config,
        room: s.room,
        tap: s.tap,
        hostId: s.meId,
        hostNow: Date.now(),
      });
    };

    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState<PresenceMeta>();
      const humans: HumanInfo[] = Object.entries(st)
        .map(([id, metas]) => ({ id, ...metas[0] }))
        .sort((a, b) => a.at - b.at)
        .map((h) => ({ id: h.id, name: h.name, avatar: h.avatar }));
      dispatch({ type: "HUMANS", humans });
    });
    ch.on("presence", { event: "join" }, () => {
      if (role === "host") sendState();
    });
    ch.on("broadcast", { event: "hello" }, () => {
      if (role === "host") sendState();
    });
    ch.on("broadcast", { event: "guest_joined" }, ({ payload }) => {
      const guest = payload as HumanInfo;
      if (!guest?.id) return;
      dispatch({ type: "ADD_HUMAN", human: guest });
      if (role === "host") sendState();
    });
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      if (role !== "guest") return;
      syncClock(payload.hostNow, payload.gameId);
      dispatch({ type: "SYNC", snap: payload });
    });
    ch.on("broadcast", { event: "intent" }, ({ payload }) => {
      if (role !== "host") return;
      const by = payload.by as string;
      const now = Date.now();
      const i = payload as Intent;
      if (i.t === "place") dispatch({ type: "PLACE", kind: i.kind, optionId: i.optionId, now, by });
      else if (i.t === "lock") dispatch({ type: "TOGGLE_LOCK", playerId: by, now });
      else if (i.t === "tap") dispatch({ type: "TAP", optionId: i.optionId, n: Math.min(i.n, 30) });
    });

    ch.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      isSubscribedRef.current = true;
      const s = latest.current;
      const human: HumanInfo = {
        id: meId,
        name: displayName(s.nickname, meId),
        avatar: avatarFor(meId),
      };
      if (role === "guest") {
        safeBroadcast(ch, "guest_joined", human);
        safeBroadcast(ch, "hello", {});
      }
      if (role === "host") sendState();
      await ch.track({
        ...human,
        at: Date.now(),
        isHost: role === "host",
      } satisfies PresenceMeta);
    });

    return () => {
      chRef.current = null;
      isSubscribedRef.current = false;
      resetClock();
      sb.removeChannel(ch);
    };
  }, [connected, roomCode, meId, role, dispatch]);

  // Host: push state to guests whenever it changes (debounced).
  useEffect(() => {
    if (role !== "host" || !connected) return;
    const t = setTimeout(() => {
      safeBroadcast(chRef.current, "state", {
        phase: state.phase,
        gameId: state.gameId,
        config: state.config,
        room: state.room,
        tap: state.tap,
        hostId: state.meId,
        hostNow: Date.now(),
      });
    }, 40);
    return () => clearTimeout(t);
  }, [role, connected, state.phase, state.gameId, state.config, state.room, state.tap, state.meId]);

  return useCallback(
    (intent: Intent) => {
      safeBroadcast(chRef.current, "intent", { ...intent, by: meId });
    },
    [meId],
  );
}
