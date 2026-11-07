"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Dices, Rocket } from "lucide-react";
import { RANDOM_NICKNAMES } from "@/lib/nicknames";
import { getSupabase } from "@/lib/supabase";
import type { GameConfig, HumanInfo } from "@/lib/types";

export function JoinGate({
  code,
  nickname,
  onNick,
  onJoin,
  onBack,
}: {
  code: string;
  nickname: string;
  onNick: (n: string) => void;
  onJoin: () => void;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<"checking" | "found" | "not_found">("checking");

  useEffect(() => {
    let isMounted = true;
    const sb = getSupabase();
    const ch = sb.channel(`room:${code}`, {
      config: { broadcast: { self: false, ack: false } },
    });

    const markFound = () => {
      if (isMounted) setStatus("found");
    };

    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      if (payload?.hostId) markFound();
    });

    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState<{ isHost?: boolean }>();
      const hasHost = Object.values(st).some((metas) => metas.some((m) => m.isHost));
      if (hasHost) markFound();
    });

    ch.subscribe(async (subStatus) => {
      if (subStatus === "SUBSCRIBED") {
        ch.send({ type: "broadcast", event: "hello", payload: {} });
      }
    });

    const timer = setTimeout(() => {
      if (isMounted) {
        setStatus((cur) => (cur === "checking" ? "not_found" : cur));
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      sb.removeChannel(ch);
    };
  }, [code]);

  if (status === "checking") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-4 px-4">
        <h1 className="sign-dropshadow font-extrabold text-2xl tracking-tight text-espresso">KAHIT SAAN</h1>
        <div className="sari-paper p-6 text-center">
          <div className="font-mono text-sm font-bold tracking-wider text-teal animate-pulse">
            CHECKING TERMINAL [{code}]…
          </div>
          <div className="mt-2 text-xs text-espresso/70">Pinging active driver via Supabase</div>
        </div>
        <button
          onClick={onBack}
          className="enamel-press rounded-xl border border-plate-border bg-white py-2.5 font-mono text-xs font-bold uppercase text-espresso"
        >
          ← Back to main menu
        </button>
      </main>
    );
  }

  if (status === "not_found") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-4 px-4">
        <h1 className="sign-dropshadow font-extrabold text-2xl tracking-tight text-espresso">KAHIT SAAN</h1>
        <div className="sari-paper p-6 text-center">
          <div className="mb-2 text-4xl">🚫</div>
          <div className="rounded-lg border border-crimson/30 bg-crimson/10 py-1.5 font-mono text-sm font-bold uppercase text-crimson">
            ROOM NOT FOUND
          </div>
          <p className="mt-3 text-xs leading-relaxed text-espresso/80">
            Room <b>{code}</b> does not exist or the driver has already left.
          </p>
        </div>
        <button
          onClick={onBack}
          className="enamel-press rounded-xl border border-mango-dark/30 bg-mango py-3 font-mono text-xs font-bold uppercase text-espresso"
        >
          ← Back to main menu
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-4 px-4">
      <div className="enamel-plate-sm inline-block self-start border-mango-dark/30 bg-mango px-3.5 py-1">
        <h1 className="sign-dropshadow font-extrabold text-2xl tracking-tight text-espresso">KAHIT SAAN</h1>
      </div>
      <div className="sari-paper flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between border-b border-plate-border/60 pb-3">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase text-espresso/60">BOARDING PASS</div>
            <div className="font-mono text-xl font-bold tracking-wider text-espresso">{code}</div>
          </div>
          <span className="rounded-md border border-calamansi/30 bg-calamansi/10 px-2 py-0.5 font-mono text-xs font-bold text-calamansi">
            ROUTE ACTIVE
          </span>
        </div>

        <div>
          <label className="mb-1.5 block font-mono text-xs font-bold uppercase text-espresso">
            YOUR BARKADA ALIAS
          </label>
          <div className="flex gap-2">
            <input
              value={nickname}
              maxLength={20}
              placeholder="Your nickname"
              onChange={(e) => onNick(e.target.value)}
              className="enamel-plate-sm min-w-0 flex-1 bg-white px-3 py-2 text-sm font-bold text-espresso outline-none placeholder:text-espresso/30 focus:border-teal"
            />
            <button
              onClick={() => onNick(RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)])}
              className="enamel-press flex items-center gap-1.5 rounded-xl border border-mango-dark/40 bg-mango px-3.5 font-mono text-xs font-bold uppercase text-espresso"
            >
              <Dices size={16} strokeWidth={2.5} /> Roll
            </button>
          </div>
        </div>

        <button
          onClick={onJoin}
          className="enamel-press rounded-2xl border border-teal-dark bg-teal py-4 font-mono text-base font-bold tracking-wider text-white shadow-md hover:bg-teal-dark"
        >
          JOIN THE PURGE
        </button>
      </div>

      <button
        onClick={onBack}
        className="enamel-press rounded-xl border border-plate-border bg-white py-2.5 font-mono text-xs font-bold uppercase text-espresso"
      >
        ← Back to main menu
      </button>
    </main>
  );
}

export default function LobbyScreen({
  code,
  humans,
  config,
  meId,
  isHost,
  hostGone,
  onStart,
  onLeave,
}: {
  code: string;
  humans: HumanInfo[];
  config: GameConfig | null;
  meId: string;
  isHost: boolean;
  hostGone: boolean;
  onStart: () => void;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const total = humans.length;

  if (hostGone) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-4 px-4">
        <h1 className="sign-dropshadow font-extrabold text-2xl tracking-tight text-espresso">KAHIT SAAN</h1>
        <div className="sari-paper p-6 text-center">
          <div className="mb-2 text-4xl">🚫</div>
          <div className="rounded-lg border border-crimson/30 bg-crimson/10 py-1.5 font-mono text-sm font-bold uppercase text-crimson">
            ROOM CLOSED
          </div>
          <p className="mt-3 text-xs leading-relaxed text-espresso/80">
            The driver has left or closed table <b>{code}</b>.
          </p>
        </div>
        <button
          onClick={onLeave}
          className="enamel-press rounded-xl border border-mango-dark/30 bg-mango py-3 font-mono text-xs font-bold uppercase text-espresso"
        >
          ← Back to main menu
        </button>
      </main>
    );
  }

  const copy = async () => {
    const url = `${window.location.origin}/?room=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-4 px-4 pb-8 pt-5">
      <header className="flex items-center justify-between pt-1">
        <h1 className="sign-dropshadow font-extrabold text-2xl tracking-tight text-espresso">KAHIT SAAN</h1>
        <span className="font-mono text-xs font-bold text-espresso/60 uppercase">LOBBY</span>
      </header>

      {/* Terminal Boarding Pass */}
      <div className="enamel-plate p-5 text-center">
        <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-espresso/60">
          TERMINAL ROUTE CODE
        </div>
        <div className="sign-dropshadow my-1 font-mono text-4xl font-extrabold tracking-widest text-espresso">
          {code}
        </div>
        <div className="my-2 flex items-center justify-center gap-1 text-espresso/30">
          <div className="h-0.5 w-12 bg-espresso/20" />
          <span className="text-[10px] font-bold font-mono">GC TICKET</span>
          <div className="h-0.5 w-12 bg-espresso/20" />
        </div>
        <button
          onClick={copy}
          className="enamel-press inline-flex items-center gap-2 rounded-xl border border-mango-dark/40 bg-mango px-5 py-2.5 font-mono text-xs font-bold uppercase text-espresso shadow-xs hover:bg-amber-400"
        >
          <Copy size={16} strokeWidth={2.5} /> {copied ? "COPIED TO CLIPBOARD ✔" : "COPY GC INVITE LINK"}
        </button>
      </div>

      {/* Route & Spots Preview */}
      {config && (
        <div className="enamel-plate p-4">
          <div className="mb-2 flex items-center justify-between border-b border-plate-border/60 pb-1.5">
            <span className="font-mono text-xs font-bold uppercase text-espresso">{config.category}</span>
            <span className="font-mono text-[10px] font-bold text-teal">{config.titles.length} SPOTS</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.titles.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-plate-border bg-milk px-2.5 py-1 font-mono text-xs font-bold text-espresso"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Passenger Queue */}
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-espresso">
          <span>PASSENGERS ON BOARD ({humans.length})</span>
          {humans.length < 2 && isHost && (
            <span className="rounded border border-crimson/30 bg-crimson/10 px-1.5 py-0.5 text-[10px] font-bold text-crimson">
              NEED 2+ PLAYERS
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-2">
          {humans.map((h) => (
            <motion.li
              key={h.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="enamel-plate flex items-center gap-3 px-3.5 py-2.5 font-bold text-sm text-espresso"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-plate-border bg-mango/30 text-lg">
                {h.avatar}
              </span>
              <span className="truncate">{h.name}</span>
              {h.id === meId && (
                <span className="ml-auto rounded border border-teal/30 bg-teal/10 px-2 py-0.5 font-mono text-[10px] font-bold text-teal">
                  YOU
                </span>
              )}
            </motion.li>
          ))}
          {humans.length === 0 && (
            <li className="enamel-plate p-4 text-center font-mono text-xs text-espresso/60">
              Boarding passengers…
            </li>
          )}
        </ul>
      </div>

      {/* Bottom Launch Button */}
      {isHost ? (
        <div className="mt-auto flex flex-col gap-2">
          <button
            disabled={total < 2}
            onClick={onStart}
            className="enamel-press flex items-center justify-center gap-2 rounded-2xl border border-teal-dark bg-teal py-4 font-mono text-base font-bold tracking-wider text-white shadow-md hover:bg-teal-dark disabled:bg-tin disabled:text-espresso/40"
          >
            <Rocket size={18} strokeWidth={2.5} /> BYAHE NA! (START PURGE)
          </button>
        </div>
      ) : (
        <div className="mt-auto enamel-plate p-3.5 text-center font-mono text-xs font-bold text-espresso/80">
          ⏳ Waiting for driver to start the trip…
        </div>
      )}

      <button
        onClick={onLeave}
        className="self-center font-mono text-xs font-bold text-espresso/60 hover:text-espresso hover:underline"
      >
        ← Leave Jeepney
      </button>
    </main>
  );
}
