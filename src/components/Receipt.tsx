"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Copy, RotateCcw, Home } from "lucide-react";
import type { RoomState } from "@/lib/types";
import { computeAwards, graveyard, isEliminated, rankOptions } from "@/lib/game-logic";
import { buildReceiptText } from "@/lib/receipt";
import { getThemeCopy } from "@/lib/presets";

interface Props {
  room: RoomState;
  onRematch: () => void;
  onHome: () => void;
  isGuest: boolean;
}

export default function Receipt({ room, onRematch, onHome, isGuest }: Props) {
  const [copied, setCopied] = useState(false);
  const limit = room.strikeLimitToBan;
  const winner = room.options.find((o) => o.id === room.winnerId)!;
  const ranked = rankOptions(room.options, limit);
  const runners = ranked.filter((o) => o.id !== winner.id && !isEliminated(o, limit));
  const dead = graveyard(room.options, limit);
  const awards = computeAwards(room.options, room.players, room.feed, limit, room.winnerId);
  const name = (id: string) => `${room.players[id]?.avatarEmoji ?? ""} ${room.players[id]?.name ?? "???"}`;
  const theme = getThemeCopy(room.themeId);

  useEffect(() => {
    const end = Date.now() + 1500;
    const colors = ["#FFB300", "#00796B", "#D32F2F", "#2E7D32"];
    (function frame() {
      confetti({ particleCount: 7, angle: 60, spread: 75, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 7, angle: 120, spread: 75, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildReceiptText(room));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this:", buildReceiptText(room));
    }
  };

  const LeaderRow = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
    <div className="flex items-baseline gap-2 font-mono text-xs">
      <span className="font-bold text-espresso truncate shrink">{label}</span>
      <span className="flex-1 border-b border-dotted border-espresso/30 min-w-4" />
      <span className="shrink-0 font-bold text-espresso">{value}</span>
    </div>
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-4 px-4 pb-8 pt-5">
      {/* Winner Champion Plate */}
      <motion.div
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        className="enamel-plate border-mango-dark/40 !bg-mango p-5 text-center text-espresso shadow-sm"
      >
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-espresso/80">
          {theme.winnerPrefix}
        </div>
        <div className="sign-dropshadow my-1.5 font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight text-espresso">
          {winner.title}
        </div>
        <div className="font-mono text-xs font-bold text-espresso/85">
          SURVIVED WITH ❤️ x{winner.heartsFrom.length}
        </div>
      </motion.div>

      {/* Sari-Sari Store Resibo Paper Chit */}
      <div className="receipt-edge sari-paper px-4.5 pt-5 pb-6 font-mono text-xs text-espresso">
        <div className="text-center">
          <div className="font-bold text-base tracking-widest">
            ★ KAHIT SAAN RESIBO ★
          </div>
          <div className="text-espresso/70">
            ROOM: {room.roomCode} · {room.category}
          </div>
          <div className="text-[10px] text-espresso/50">
            {new Date().toLocaleString()}
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-plate-border" />

        <div className="mb-2 font-bold uppercase tracking-wider text-espresso">
          OFFICIAL SURVIVOR RANKING
        </div>
        <div className="flex flex-col gap-1.5">
          <LeaderRow
            label={`1. ${winner.title} 🏆`}
            value={`❤️${winner.heartsFrom.length} ❌${winner.strikesFrom.length}`}
          />
          {runners.map((o, i) => (
            <LeaderRow
              key={o.id}
              label={`${i + 2}. ${o.title}`}
              value={`❤️${o.heartsFrom.length} ❌${o.strikesFrom.length}`}
            />
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-plate-border" />

        <div className="mb-2 font-bold uppercase tracking-wider text-espresso">
          EKIS GRAVEYARD (ELIMINATED)
        </div>
        {dead.length ? (
          <div className="flex flex-col gap-1.5">
            {dead.map((o) => (
              <LeaderRow
                key={o.id}
                label={<s>{o.title}</s>}
                value={`❌${o.strikesFrom.length} ❤️${o.heartsFrom.length}`}
              />
            ))}
          </div>
        ) : (
          <div className="font-mono text-xs text-espresso/60 italic">
            Zero casualties. Suspiciously agreeable barkada.
          </div>
        )}

        <div className="my-3 border-t border-dashed border-plate-border" />

        <div className="mb-2 font-bold uppercase tracking-wider text-espresso">
          BARKADA AWARDS
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          {awards.butchers.map((b, i) => (
            <div key={i} className="leading-snug">
              <b>Master Butcher:</b> <span>{name(b.playerId)}</span>{" "}
              <span className="text-[10px] text-espresso/60">(killed {b.optionTitle})</span>
            </div>
          ))}
          {awards.lifesavers.map((p) => (
            <div key={p} className="leading-snug">
              <b>Lifesaver:</b> <span>{name(p)}</span>{" "}
              <span className="text-[10px] text-espresso/60">(saved winner)</span>
            </div>
          ))}
          {awards.kahitSaan.map((p) => (
            <div key={p} className="leading-snug">
              <b>Certified &quot;Kahit Saan&quot;:</b> <span>{name(p)}</span>{" "}
              <span className="text-[10px] text-espresso/60">(unused tokens)</span>
            </div>
          ))}
          {!awards.butchers.length && !awards.lifesavers.length && !awards.kahitSaan.length && (
            <div className="font-mono text-xs text-espresso/50 italic">No awards. Standard purge behavior.</div>
          )}
        </div>

        <div className="my-3 border-t border-dashed border-plate-border" />

        <div className="text-center font-mono">
          <div className="text-xs tracking-[0.4em] font-bold text-espresso/40">||||| ||| |||| || |||||</div>
          <div className="mt-1 font-bold text-xs uppercase">{theme.receiptSignoff}</div>
          <div className="text-[9px] text-espresso/60 uppercase">WALANG SISIHAN · SALAMAT SA BYAHE</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={copy}
          className="enamel-press flex items-center justify-center gap-2 rounded-2xl border border-mango-dark/40 bg-mango py-3.5 font-mono text-sm font-bold uppercase text-espresso shadow-xs hover:bg-amber-400"
        >
          <Copy size={16} strokeWidth={2.5} /> {copied ? "RESIBO COPIED! ✔" : "COPY RESIBO FOR GC"}
        </button>

        {isGuest ? (
          <div className="enamel-plate py-3 text-center font-mono text-xs font-bold text-espresso/70">
            ⏳ Waiting for driver to run it back…
          </div>
        ) : (
          <button
            onClick={onRematch}
            className="enamel-press flex items-center justify-center gap-2 rounded-2xl border border-teal-dark bg-teal py-3.5 font-mono text-sm font-bold uppercase text-white shadow-md hover:bg-teal-dark"
          >
            <RotateCcw size={16} strokeWidth={2.5} /> BYAHE ULIT (REMATCH)
          </button>
        )}

        <button
          onClick={onHome}
          className="enamel-press flex items-center justify-center gap-2 rounded-xl border border-plate-border bg-white py-2.5 font-mono text-xs font-bold uppercase text-espresso hover:border-espresso/30"
        >
          <Home size={15} strokeWidth={2.5} /> {isGuest ? "LEAVE JEEP" : "NEW DECISION LIST"}
        </button>
      </div>
    </main>
  );
}
