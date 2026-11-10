"use client";

import { useEffect, useRef } from "react";
import type { Dispatch } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { RoomState, WheelState } from "@/lib/types";
import type { Action } from "@/lib/store";

interface Props {
  room: RoomState;
  wheel: WheelState;
  isGuest: boolean;
  dispatch: Dispatch<Action>;
}

const SLICE_COLORS = [
  "#FFB300", // Mango
  "#00796B", // Teal
  "#D32F2F", // Crimson
  "#2E7D32", // Calamansi
  "#F57F17", // Mango Dark
  "#004D40", // Teal Dark
];

export default function SpinWheel({ room, wheel, isGuest, dispatch }: Props) {
  const candidates = room.options.filter((o) => wheel.candidateIds.includes(o.id));
  const numSlices = Math.max(1, candidates.length);
  const sliceAngle = 360 / numSlices;
  const ended = useRef(false);

  useEffect(() => {
    const revealTimer = setTimeout(() => {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, wheel.durationMs);

    const finishTimer = setTimeout(() => {
      if (!isGuest && !ended.current) {
        ended.current = true;
        dispatch({ type: "WHEEL_END" });
      }
    }, wheel.durationMs + 2000);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, [wheel.durationMs, isGuest, dispatch]);

  const radius = 140;
  const center = 150;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-6 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] bg-milk">
      {/* Header Banner */}
      <div className="enamel-plate border-mango-dark/40 bg-gradient-to-r from-mango to-amber-300 p-4 text-center text-espresso shadow-md w-full">
        <div className="jeepney-stripes mb-2 h-2 w-full rounded-full" />
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-crimson">
          ⚡ PATAS SA TAP WAR! ⚡
        </div>
        <div className="sign-dropshadow font-extrabold text-2xl leading-tight">
          GULONG NG PALAD!
        </div>
        <div className="font-mono text-xs font-bold text-espresso/80 mt-1 uppercase">
          Tadhana na ang bahala sa {candidates.length} pantay na boto!
        </div>
      </div>

      {/* Wheel Area */}
      <div className="relative my-auto flex items-center justify-center py-6">
        {/* Pointer Needle at Top */}
        <div className="absolute top-2 z-20 flex flex-col items-center">
          <div className="h-0 w-0 border-x-[14px] border-x-transparent border-t-[24px] border-t-crimson drop-shadow-md" />
          <div className="-mt-1 h-2.5 w-2.5 rounded-full bg-white border-2 border-crimson" />
        </div>

        {/* Outer Wheel Rim */}
        <div className="relative rounded-full border-4 border-plate-border bg-espresso p-2.5 shadow-2xl">
          {/* Animated Wheel */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: wheel.targetRotation }}
            transition={{
              duration: wheel.durationMs / 1000,
              ease: [0.12, 0.8, 0.25, 1],
            }}
            className="rounded-full shadow-inner overflow-hidden w-[340px] h-[340px] max-w-[85vw] max-h-[85vw]"
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {candidates.map((candidate, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = (i + 1) * sliceAngle;
                const midAngle = startAngle + sliceAngle / 2;
                const color = SLICE_COLORS[i % SLICE_COLORS.length];

                // Coordinates with 0deg at 12 o'clock
                const radStart = (startAngle * Math.PI) / 180;
                const radEnd = (endAngle * Math.PI) / 180;
                const x1 = center + radius * Math.sin(radStart);
                const y1 = center - radius * Math.cos(radStart);
                const x2 = center + radius * Math.sin(radEnd);
                const y2 = center - radius * Math.cos(radEnd);
                const largeArc = sliceAngle > 180 ? 1 : 0;

                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                return (
                  <g key={candidate.id}>
                    <path d={pathData} fill={color} stroke="#1A1817" strokeWidth="2" />
                    {(() => {
                      const raw = candidate.title.trim();
                      const isDuo = numSlices === 2;
                      const maxChars = isDuo ? 15 : numSlices <= 4 ? 13 : 11;
                      const title = raw.length > maxChars ? `${raw.slice(0, maxChars - 1)}…` : raw;
                      const fontSize = isDuo
                        ? "20px"
                        : numSlices <= 3
                        ? title.length > 9
                          ? "13px"
                          : "15px"
                        : numSlices <= 5
                        ? title.length > 8
                          ? "11px"
                          : "12px"
                        : title.length > 8
                        ? "10px"
                        : "11px";

                      return isDuo ? (
                        <g
                          transform={`rotate(${midAngle} ${center} ${center}) translate(${center}, ${
                            center - radius * 0.52
                          })`}
                        >
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#FFFFFF"
                            className="select-none pointer-events-none uppercase font-black"
                            style={{
                              fontSize,
                              fontWeight: 900,
                              paintOrder: "stroke fill",
                              stroke: "#1A1817",
                              strokeWidth: "3px",
                            }}
                          >
                            {title}
                          </text>
                        </g>
                      ) : (
                        <g transform={`rotate(${midAngle} ${center} ${center})`}>
                          <text
                            x={center}
                            y={71}
                            transform={`rotate(90, ${center}, 71)`}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#FFFFFF"
                            className="select-none pointer-events-none uppercase font-black"
                            style={{
                              fontSize,
                              fontWeight: 900,
                              paintOrder: "stroke fill",
                              stroke: "#1A1817",
                              strokeWidth: "2px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {title}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle cx={center} cy={center} r="26" fill="#1A1817" stroke="#FFF" strokeWidth="3" />
              <circle cx={center} cy={center} r="16" fill="#FFB300" />
            </svg>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
