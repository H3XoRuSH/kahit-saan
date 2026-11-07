"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch } from "react";
import { motion } from "framer-motion";
import type { Intent, RoomState, TapWarState } from "@/lib/types";
import type { Action } from "@/lib/store";
import { TAP_WAR_MS } from "@/lib/store";
import { nowMs } from "@/lib/clock";

interface Props {
  room: RoomState;
  tap: TapWarState;
  isGuest: boolean;
  dispatch: Dispatch<Action>;
  act: (i: Intent) => void;
}

export default function TapWar({ room, tap, isGuest, dispatch, act }: Props) {
  const [now, setNow] = useState(() => nowMs());
  const [mine, setMine] = useState(0);
  const ended = useRef(false);
  const pending = useRef<Record<string, number>>({});
  const finalists = room.options.filter((o) => tap.finalists.includes(o.id));
  const totalTaps = finalists.reduce((s, o) => s + o.tiebreakerTaps, 0) || 1;

  useEffect(() => {
    const t = setInterval(() => {
      const n = nowMs();
      setNow(n);

      if (isGuest) {
        for (const [optionId, c] of Object.entries(pending.current)) {
          if (c > 0) act({ t: "tap", optionId, n: c });
        }
        pending.current = {};
        return;
      }
      if (n >= tap.endsAt) {
        if (!ended.current) {
          ended.current = true;
          dispatch({ type: "TAP_END", r: Math.random() });
        }
        return;
      }
    }, 100);
    return () => clearInterval(t);
  }, [tap.endsAt, dispatch, act, isGuest]);

  const onTap = (optionId: string) => {
    setMine((m) => m + 1);
    if (isGuest) pending.current[optionId] = (pending.current[optionId] ?? 0) + 1;
    else act({ t: "tap", optionId, n: 1 });
  };

  const left = Math.max(0, tap.endsAt - now);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-3.5 p-4 bg-milk">
      {/* Horn Duel Header */}
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="enamel-plate border-mango-dark/40 bg-gradient-to-r from-mango to-amber-300 p-4 text-center text-espresso shadow-md"
      >
        <div className="jeepney-stripes mb-2 h-2 w-full rounded-full" />
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-crimson">
          ⚡ PATAS ANG LABAN · BUBUSINA NA! ⚡
        </div>
        <div className="sign-dropshadow font-extrabold text-2xl leading-tight">
          5-SECOND TAP WAR!
        </div>
        <div className="my-1 font-mono text-4xl font-extrabold">
          {(left / 1000).toFixed(1)}s
        </div>
        <div className="mx-auto h-3 w-4/5 overflow-hidden rounded-full border border-plate-border bg-white">
          <div
            className="h-full rounded-full bg-crimson transition-all duration-100"
            style={{ width: `${Math.min(100, (left / TAP_WAR_MS) * 100)}%` }}
          />
        </div>
      </motion.div>

      {/* Giant Enamel Mash Buttons */}
      <div className="flex flex-1 flex-col gap-3.5">
        {finalists.map((o, i) => {
          const isSecond = i % 2 !== 0;
          return (
            <motion.button
              key={o.id}
              whileTap={{ scale: 0.97 }}
              onPointerDown={() => onTap(o.id)}
              className={`enamel-press flex flex-1 select-none flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 shadow-md transition-all ${
                isSecond
                  ? "border-teal-dark bg-teal text-white hover:bg-teal-dark"
                  : "border-crimson bg-crimson text-white hover:bg-red-700"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-85">
                TAP TO CROWN
              </span>
              <span className="sign-dropshadow font-extrabold text-3xl tracking-tight leading-none text-center">
                {o.title}
              </span>
              <span className="font-mono text-5xl font-extrabold">
                {o.tiebreakerTaps}
              </span>

              {/* Progress split bar */}
              <div className="mt-1 h-3 w-4/5 overflow-hidden rounded-full border border-black/10 bg-white/40">
                <div
                  className="h-full rounded-full bg-espresso transition-all duration-100"
                  style={{ width: `${(o.tiebreakerTaps / totalTaps) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                BUSINA LANG NANG BUSINA! 📣
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-xl border border-plate-border bg-white p-2 text-center font-mono text-xs font-bold uppercase text-espresso shadow-xs">
        YOUR TAPS: {mine}
      </div>
    </main>
  );
}
