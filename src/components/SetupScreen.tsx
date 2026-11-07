"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Dices, Plus, X } from "lucide-react";
import { PRESETS } from "@/lib/presets";
import { RANDOM_NICKNAMES } from "@/lib/nicknames";
import type { GameConfig } from "@/lib/types";

interface Props {
  nickname: string;
  onNick: (n: string) => void;
  onCreate: (c: GameConfig) => void;
  onJoinCode: (code: string) => void;
}

/** Accepts "KAIN-XXX", "kain-xxx" or just "xxx". */
function normalizeCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/^KAIN-?/, "").replace(/[^A-Z0-9]/g, "");
  return `KAIN-${s}`;
}

export default function SetupScreen({ nickname, onNick, onCreate, onJoinCode }: Props) {
  const [presetId, setPresetId] = useState("eat");
  const [options, setOptions] = useState<string[]>(PRESETS[0].options);
  const [duration, setDuration] = useState(45);
  const [code, setCode] = useState("");

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const clean = options.map((o) => o.trim()).filter(Boolean);
  const unique = new Set(clean.map((c) => c.toLowerCase())).size === clean.length;
  const valid = clean.length >= 4 && clean.length <= 8 && unique;
  const codeOk = normalizeCode(code).length >= 8;

  const cfg = (): GameConfig => ({
    category: preset.label,
    themeId: preset.id,
    titles: clean,
    durationSeconds: duration,
  });

  const pick = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setPresetId(id);
    setOptions([...p.options]);
  };

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-col gap-4.5 px-4 pb-32 pt-5">
      <header className="flex items-center gap-3.5 pt-2">
        <Image
          src="/icons/main-menu-icon.png"
          alt="Kahit Saan"
          width={76}
          height={76}
          className="h-19 w-19 shrink-0 rounded-2xl object-contain"
          priority
        />
        <div className="min-w-0 flex-1">
          <h1 className="sign-dropshadow font-extrabold text-2xl sm:text-3xl leading-none tracking-tight text-espresso">
            KAHIT SAAN
          </h1>
          <p className="mt-1.5 text-xs font-semibold leading-snug text-espresso/80">
            Stop asking &quot;Kahit Saan.&quot; Ekis what you hate, kain what survives.
          </p>
        </div>
      </header>

      {/* Quick Join Stamped Voucher */}
      <section className="enamel-plate p-3.5">
        <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-espresso">
          <span>HAVE A ROOM CODE?</span>
          <span className="text-[10px] font-bold text-teal">DIRECT BOARDING</span>
        </div>
        <div className="flex gap-2">
          <input
            value={code}
            maxLength={9}
            placeholder="KAIN-XXX"
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && codeOk && onJoinCode(normalizeCode(code))}
            className="enamel-plate-sm min-w-0 flex-1 bg-milk px-3.5 py-2 font-mono text-sm font-bold uppercase text-espresso outline-none placeholder:text-espresso/40 focus:border-teal"
          />
          <button
            disabled={!codeOk}
            onClick={() => onJoinCode(normalizeCode(code))}
            className="enamel-press rounded-xl bg-teal px-5 font-mono text-xs font-bold uppercase text-white shadow-xs disabled:bg-tin disabled:text-espresso/40"
          >
            Join
          </button>
        </div>
      </section>

      {/* Main Order Clipboard Body */}
      <div className="sari-paper flex flex-col gap-4.5 p-4.5">
        {/* Step 1: Decision Category Routes */}
        <section>
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-espresso">
            <span>1 · PICK CATEGORY</span>
            <span className="text-[10px] font-bold text-teal">[{preset.label}]</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => {
              const active = p.id === presetId;
              return (
                <button
                  key={p.id}
                  onClick={() => pick(p.id)}
                  className={`enamel-press flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all ${
                    active
                      ? "border border-teal-dark bg-teal text-white shadow-sm"
                      : "border border-plate-border bg-white text-espresso hover:border-espresso/30"
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-plate-border/60" />

        {/* Step 2: Route Stops / Contenders */}
        <section>
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-espresso">
            <span>2 · ROUTE SPOTS</span>
            <span className="rounded border border-plate-border bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-espresso">
              {clean.length}/8 (MIN 4)
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {options.map((o, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="flex w-8 shrink-0 items-center justify-center rounded-lg border border-plate-border bg-white font-mono text-xs font-bold text-teal">
                  0{i + 1}
                </span>
                <input
                  value={o}
                  maxLength={24}
                  placeholder={`Spot #${i + 1}`}
                  onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                  className="enamel-plate-sm min-w-0 flex-1 bg-white px-3 py-2 text-sm font-bold text-espresso outline-none placeholder:text-espresso/30 focus:border-teal"
                />
                <button
                  aria-label="Remove"
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  disabled={options.length <= 4}
                  className="enamel-press flex w-9 items-center justify-center rounded-lg border border-plate-border bg-white text-espresso hover:text-crimson disabled:opacity-30"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
          {options.length < 8 && (
            <button
              onClick={() => setOptions([...options, ""])}
              className="enamel-press mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-calamansi/30 bg-calamansi/10 px-4 py-2.5 font-mono text-xs font-bold uppercase text-calamansi hover:bg-calamansi/20"
            >
              <Plus size={16} strokeWidth={2.5} /> ADD SPOT (+1)
            </button>
          )}
          {!unique && (
            <p className="mt-2 rounded-lg border border-crimson/30 bg-crimson/10 px-3 py-1.5 font-mono text-xs font-bold text-crimson">
              DUPLICATE SPOTS DETECTED! Make each option unique.
            </p>
          )}
        </section>

        <div className="border-t border-plate-border/60" />

        {/* Step 3: Round Timer */}
        <section>
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-espresso">
            <span>ROUND TIMER</span>
            <span className="text-[10px] font-bold text-espresso/70">SPEED RUN</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[30, 45, 60].map((s) => (
              <button
                key={s}
                onClick={() => setDuration(s)}
                className={`enamel-press rounded-xl py-2 font-mono text-sm font-bold uppercase transition-all ${
                  duration === s
                    ? "border border-espresso bg-espresso text-milk shadow-xs"
                    : "border border-plate-border bg-white text-espresso"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </section>

        <div className="border-t border-plate-border/60" />

        {/* Step 4: Host Nickname */}
        <section>
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-espresso">
            <span>3 · YOUR BARKADA ALIAS</span>
            <span className="text-[10px] font-bold text-espresso/70">DRIVER / HOST</span>
          </div>
          <div className="flex gap-2">
            <input
              value={nickname}
              placeholder="Your nickname"
              maxLength={20}
              onChange={(e) => onNick(e.target.value)}
              className="enamel-plate-sm min-w-0 flex-1 bg-white px-3 py-2 text-sm font-bold text-espresso outline-none placeholder:text-espresso/30 focus:border-teal"
            />
            <button
              onClick={() => onNick(RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)])}
              className="enamel-press flex items-center gap-1.5 rounded-xl border border-mango-dark/40 bg-mango px-3.5 font-mono text-xs font-bold uppercase text-espresso shadow-xs"
            >
              <Dices size={16} strokeWidth={2.5} /> Roll
            </button>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Boarding Trigger */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-plate-border bg-milk/95 px-4 pb-5 pt-3 shadow-md backdrop-blur-xs">
        <button
          disabled={!valid}
          onClick={() => onCreate(cfg())}
          className="enamel-press flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-dark bg-teal py-4 font-mono text-base font-bold tracking-wider text-white shadow-md hover:bg-teal-dark disabled:bg-tin disabled:text-espresso/40"
        >
          CREATE ROOM &amp; GET LINK
        </button>
      </div>
    </main>
  );
}
