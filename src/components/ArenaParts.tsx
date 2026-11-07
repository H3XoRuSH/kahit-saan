"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FeedEvent, OptionCard } from "@/lib/types";
import { isEliminated, netStrikes } from "@/lib/game-logic";

interface CardProps {
  card: OptionCard;
  limit: number;
  meId: string;
  onStrike: () => void;
  onHeart: () => void;
  locked: boolean;
  strikesFull: boolean;
}

export function FoodCard({ card, limit, meId, onStrike, onHeart, locked, strikesFull }: CardProps) {
  const net = netStrikes(card);
  const banned = isEliminated(card, limit);
  const danger = !banned && net > 0;
  const myStrike = card.strikesFrom.includes(meId);
  const myHeart = card.heartsFrom.includes(meId);
  const bg = banned ? "bg-tin/60" : danger ? "bg-amber-50" : "bg-white";
  const left = limit - net;

  return (
    <motion.div
      layout
      key={card.id}
      animate={{ opacity: banned ? 0.65 : 1, scale: 1 }}
      className={`enamel-plate relative flex flex-col justify-between gap-2 p-3 ${bg} transition-colors`}
    >
      <div>
        <motion.div
          key={card.strikesFrom.length}
          initial={{ x: card.strikesFrom.length ? -4 : 0 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 800, damping: 10 }}
          className={`font-bold text-base leading-snug text-espresso ${banned ? "line-through opacity-60" : ""}`}
        >
          {card.title}
        </motion.div>

        {/* Tokens Container */}
        <div className="mt-1.5 flex min-h-6 flex-wrap items-center gap-1">
          {card.heartsFrom.map((p) => (
            <span
              key={p}
              className={`rounded-md border px-1.5 py-0.5 text-xs font-bold ${
                p === meId ? "border-calamansi bg-calamansi/15 text-calamansi" : "border-plate-border bg-white"
              }`}
            >
              ❤️
            </span>
          ))}
          {card.strikesFrom.map((p) => (
            <span
              key={p}
              className={`rounded-md border px-1.5 py-0.5 text-xs font-bold ${
                p === meId ? "border-crimson bg-crimson/15 text-crimson" : "border-plate-border bg-white"
              }`}
            >
              ❌
            </span>
          ))}
          {!card.heartsFrom.length && !card.strikesFrom.length && (
            <span className="font-mono text-[10px] font-bold text-espresso/40">READY</span>
          )}
        </div>
      </div>

      <div>
        {/* Status tag */}
        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider">
          {banned ? (
            <span className="rounded bg-crimson/10 px-1.5 py-0.5 text-crimson">💀 EKIS NA</span>
          ) : danger ? (
            <span className="rounded bg-mango/30 px-1.5 py-0.5 text-espresso">⚠️ {left} AWAY</span>
          ) : (
            <span className="rounded bg-calamansi/10 px-1.5 py-0.5 text-calamansi">SAFE</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <button
            aria-pressed={myStrike}
            disabled={locked || (!myStrike && strikesFull)}
            onClick={onStrike}
            className={`enamel-press flex-1 rounded-xl py-1.5 font-mono text-xs font-bold uppercase transition-all ${
              myStrike
                ? "border border-crimson bg-crimson text-white shadow-xs"
                : "border border-plate-border bg-white text-espresso hover:border-crimson/40"
            } disabled:bg-tin disabled:opacity-40`}
          >
            ❌ Ekis
          </button>
          <button
            aria-pressed={myHeart}
            disabled={locked}
            onClick={onHeart}
            className={`enamel-press flex-1 rounded-xl py-1.5 font-mono text-xs font-bold uppercase transition-all ${
              myHeart
                ? "border border-calamansi bg-calamansi text-white shadow-xs"
                : "border border-plate-border bg-white text-espresso hover:border-calamansi/40"
            } disabled:bg-tin disabled:opacity-40`}
          >
            ❤️ Bet
          </button>
        </div>
      </div>

      {/* Painted Signboard Route Strike on Elimination */}
      <AnimatePresence>
        {banned && (
          <motion.div
            initial={{ scale: 2.5, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: -10 }}
            transition={{ type: "spring", stiffness: 450, damping: 14 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="rounded-xl border-2 border-crimson bg-white/95 px-3 py-1 font-mono text-xl font-black tracking-widest text-crimson shadow-md">
              [ EKIS! ]
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface DockProps {
  options: OptionCard[];
  meId: string;
  locked: boolean;
  onPickUp: (kind: "strike" | "heart", optionId: string) => void;
  onLock: () => void;
}

export function TokenDock({ options, meId, locked, onPickUp, onLock }: DockProps) {
  const strikes = options.filter((o) => o.strikesFrom.includes(meId));
  const heart = options.find((o) => o.heartsFrom.includes(meId));

  const slot = (key: string, emoji: string, card: OptionCard | undefined, kind: "strike" | "heart") => (
    <button
      key={key}
      disabled={!card || locked}
      onClick={() => card && onPickUp(kind, card.id)}
      className={`enamel-press flex h-13 min-w-0 flex-1 flex-col items-center justify-center rounded-xl p-1 transition-all ${
        card
          ? kind === "strike"
            ? "border border-crimson/30 bg-crimson/10 text-crimson"
            : "border border-calamansi/30 bg-calamansi/10 text-calamansi"
          : "border border-dashed border-plate-border bg-white/70 text-espresso/40"
      }`}
    >
      <span className={`text-base leading-none ${card ? "" : "opacity-30"}`}>{emoji}</span>
      <span className="w-full truncate text-center font-mono text-[9px] font-bold uppercase">
        {card ? card.title : "EMPTY"}
      </span>
    </button>
  );

  return (
    <div className="flex items-stretch gap-2">
      {slot("s0", "❌", strikes[0], "strike")}
      {slot("s1", "❌", strikes[1], "strike")}
      {slot("h", "❤️", heart, "heart")}
      <button
        onClick={onLock}
        className={`enamel-press rounded-xl px-4 font-mono text-xs font-bold uppercase leading-tight shadow-xs transition-all ${
          locked
            ? "border border-calamansi bg-calamansi text-white"
            : "border border-espresso bg-espresso text-milk"
        }`}
      >
        {locked ? (
          <>
            LOCKED ✔
            <br />
            <span className="text-[9px] font-medium opacity-80">TAP UNLOCK</span>
          </>
        ) : (
          "LOCK IN"
        )}
      </button>
    </div>
  );
}

export function Ticker({ feed }: { feed: FeedEvent[] }) {
  const last = feed.slice(-2);
  const who = (e: FeedEvent) => e.playerName;

  const line = (e: FeedEvent) => {
    switch (e.type) {
      case "strike":
        return (
          <>
            ❌ <b>{who(e)}</b> struck <b>{e.optionTitle}</b>{e.strikesLeft ? ` (${e.strikesLeft} to ekis)` : ""}
          </>
        );
      case "ban":
        return (
          <>
            💀 <b>{who(e)}</b> eliminated <b>{e.optionTitle}</b> — EKIS NA!
          </>
        );
      case "save":
        return (
          <>
            ❤️ <b>{who(e)}</b> saved <b>{e.optionTitle}</b> with a heart!
          </>
        );
      case "heart":
        return (
          <>
            ❤️ <b>{who(e)}</b> bet on <b>{e.optionTitle}</b>.
          </>
        );
    }
  };

  return (
    <div className="h-12 overflow-hidden rounded-xl border border-plate-border bg-white px-3 py-1.5 font-mono text-[11px] leading-tight text-espresso shadow-2xs">
      {last.length === 0 && <div className="font-bold opacity-50">TRIP LIVE: PLACE YOUR TOKENS!</div>}
      <AnimatePresence initial={false} mode="popLayout">
        {last.map((e) => (
          <motion.div
            key={e.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="truncate font-medium"
          >
            {line(e)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
