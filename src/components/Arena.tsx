"use client";

import { useEffect, useState } from "react";
import type { Dispatch } from "react";
import { motion } from "framer-motion";
import type { Intent, RoomState } from "@/lib/types";
import type { Action } from "@/lib/store";
import { nowMs } from "@/lib/clock";
import { FoodCard, TokenDock } from "./ArenaParts";

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        act({ t: "lock" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [act]);

  const gridCols =
    room.options.length > 6
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col md:grid md:h-dvh md:max-w-5xl md:grid-cols-12 md:gap-6 md:overflow-hidden md:px-6 md:py-6 lg:max-w-6xl lg:px-8">
      {/* Left Control Tower on PC/Tablet / Sticky Top HUD on Mobile */}
      <div className="contents md:col-span-4 md:flex md:min-h-0 md:flex-col md:justify-between md:gap-4 lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.76 }}
          className="sticky top-0 z-20 border-b border-plate-border bg-milk/95 px-3.5 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-xs md:static md:rounded-2xl md:border md:bg-white md:p-4 md:shadow-sm"
        >
          <div className="mb-1.5 flex items-center justify-between font-mono text-xs font-bold uppercase text-espresso md:flex-col md:items-start md:gap-2">
            <span className="truncate">{room.roomCode} · {room.category}</span>
            <span
              className={`rounded-md px-2 py-0.5 font-bold tabular-nums transition-colors md:w-full md:py-1.5 md:text-center md:text-2xl ${
                urgent ? "bg-crimson text-white animate-pulse" : "bg-mango/40 text-espresso"
              }`}
            >
              ⏱ {(remaining / 1000).toFixed(1)}s
            </span>
          </div>

          {/* Speedometer Countdown Bar */}
          <div className="h-3.5 overflow-hidden rounded-full border border-plate-border bg-white p-[1.5px] md:bg-milk">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                urgent ? "bg-crimson" : "bg-teal"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] font-bold text-espresso/80 md:mt-2.5">
            <span>👥 {players.length} PLAYERS · {room.strikeLimitToBan}❌ = EKIS</span>
            <span className="rounded border border-plate-border bg-white px-1.5 py-0.5 shadow-2xs md:bg-milk">
              LOCKED {lockedCount}/{players.length}
            </span>
          </div>
        </motion.div>

        {/* Live Passenger Status Roster (PC/Tablet Only) */}
        <div className="hidden md:flex md:min-h-0 md:flex-1 md:flex-col md:rounded-2xl md:border md:border-plate-border md:bg-white md:p-3.5">
          <div className="mb-2 flex items-center justify-between border-b border-plate-border/60 pb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-espresso/70">
            <span>PASSENGER STATUS</span>
            <span>{lockedCount}/{players.length} READY</span>
          </div>
          <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-plate-border/70 bg-milk px-2.5 py-1.5 font-mono text-xs"
              >
                <span className="truncate font-bold text-espresso">
                  {p.avatarEmoji} {p.name}
                </span>
                <span
                  className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    p.isLockedIn
                      ? "bg-calamansi/15 text-calamansi"
                      : "bg-mango/30 text-espresso/70"
                  }`}
                >
                  {p.isLockedIn ? "LOCKED ✔" : "VOTING…"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sticky Bottom on Mobile / Docked Bottom-Left on PC & Tablet */}
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 1.05 }}
          className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[430px] flex-col gap-2 border-t border-plate-border bg-milk/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:static md:mx-0 md:max-w-none md:rounded-2xl md:border md:bg-white md:p-3.5 md:shadow-sm"
        >
          <div className="hidden md:flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-espresso/70">
            <span>YOUR FARE TOKENS</span>
            <span>[SPACE] TO LOCK</span>
          </div>
          <TokenDock
            options={room.options}
            meId={meId}
            locked={locked}
            onPickUp={place}
            onLock={() => act({ t: "lock" })}
          />
        </motion.div>
      </div>

      {/* Right Stage: Grid of Route Signboard Cards */}
      <div
        className={`grid flex-1 auto-rows-fr ${gridCols} content-start gap-3 p-3.5 pb-28 md:col-span-8 md:min-h-0 md:content-stretch md:gap-4 md:overflow-y-auto md:p-0 lg:col-span-9`}
      >
        {room.options.map((o, i) => (
          <FoodCard
            key={o.id}
            index={i}
            card={o}
            limit={room.strikeLimitToBan}
            meId={meId}
            locked={locked}
            onStrike={() => place("strike", o.id)}
            onHeart={() => place("heart", o.id)}
          />
        ))}
      </div>
    </main>
  );
}
