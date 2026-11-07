"use client";

import { useEffect, useState } from "react";
import type { Dispatch } from "react";
import type { Intent, RoomState } from "@/lib/types";
import type { Action } from "@/lib/store";
import { strikesUsed } from "@/lib/game-logic";
import { nowMs } from "@/lib/clock";
import { FoodCard, Ticker, TokenDock } from "./ArenaParts";

interface Props {
  room: RoomState;
  meId: string;
  isGuest: boolean;
  dispatch: Dispatch<Action>;
  act: (i: Intent) => void;
}

export default function Arena({ room, meId, isGuest, dispatch, act }: Props) {
  const [now, setNow] = useState(() => nowMs());

  useEffect(() => {
    const t = setInterval(() => {
      const n = nowMs();
      setNow(n);
      if (!isGuest) dispatch({ type: "TICK", now: n });
    }, 100);
    return () => clearInterval(t);
  }, [dispatch, isGuest]);

  const total = room.durationSeconds * 1000;
  const remaining = Math.max(0, (room.endsAtTimestamp ?? now) - now);
  const pct = Math.min(100, (remaining / total) * 100);
  const me = room.players[meId];
  const players = Object.values(room.players);
  const lockedCount = players.filter((p) => p.isLockedIn).length;
  const urgent = remaining < 10000;
  const locked = !me || me.isLockedIn;

  const place = (kind: "strike" | "heart", optionId: string) => act({ t: "place", kind, optionId });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      {/* Sticky Jeepney Dashboard HUD */}
      <div className="sticky top-0 z-20 border-b border-plate-border bg-milk/95 px-3.5 pb-2.5 pt-3 shadow-xs backdrop-blur-xs">
        <div className="mb-1.5 flex items-center justify-between font-mono text-xs font-bold uppercase text-espresso">
          <span className="truncate">{room.roomCode} · {room.category}</span>
          <span
            className={`rounded-md px-2 py-0.5 font-bold transition-colors ${
              urgent ? "bg-crimson text-white animate-pulse" : "bg-mango/40 text-espresso"
            }`}
          >
            ⏱ {(remaining / 1000).toFixed(1)}s
          </span>
        </div>

        {/* Speedometer Countdown Bar */}
        <div className="h-3.5 overflow-hidden rounded-full border border-plate-border bg-white p-[1.5px]">
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              urgent ? "bg-crimson" : "bg-teal"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] font-bold text-espresso/80">
          <span>👥 {players.length} PLAYERS · {room.strikeLimitToBan}❌ = EKIS</span>
          <span className="rounded bg-white px-1.5 py-0.5 border border-plate-border shadow-2xs">
            LOCKED {lockedCount}/{players.length}
          </span>
        </div>
      </div>

      {/* Grid of Route Signboard Cards */}
      <div className="grid flex-1 auto-rows-fr grid-cols-2 content-start gap-3 p-3.5 pb-48">
        {room.options.map((o) => (
          <FoodCard
            key={o.id}
            card={o}
            limit={room.strikeLimitToBan}
            meId={meId}
            locked={locked}
            strikesFull={strikesUsed(room.options, meId) >= 2}
            onStrike={() => place("strike", o.id)}
            onHeart={() => place("heart", o.id)}
          />
        ))}
      </div>

      {/* Sticky Bottom Control Fare Box */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[430px] flex-col gap-2 border-t border-plate-border bg-milk/95 p-3 shadow-lg backdrop-blur-xs">
        <TokenDock
          options={room.options}
          meId={meId}
          locked={locked}
          onPickUp={place}
          onLock={() => act({ t: "lock" })}
        />
        <Ticker feed={room.feed} />
      </div>
    </main>
  );
}
