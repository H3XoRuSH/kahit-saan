"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useGame } from "@/lib/store";
import { getPlayerId, makeRoomCode } from "@/lib/identity";
import SetupScreen from "@/components/SetupScreen";
import LobbyScreen, { JoinGate } from "@/components/LobbyScreen";
import Arena from "@/components/Arena";
import TapWar from "@/components/TapWar";
import SpinWheel from "@/components/SpinWheel";
import Receipt from "@/components/Receipt";
import type { GameConfig, Phase } from "@/lib/types";

const SHUTTER_COPY: Partial<
  Record<Phase, { top: string; bottom: string; topBg: string; bottomBg: string }>
> = {
  join: {
    top: "PARA PO!",
    bottom: "CHECKING JEEPNEY TERMINAL",
    topBg: "bg-mango text-espresso border-b-2 border-espresso/20",
    bottomBg: "bg-teal text-milk",
  },
  lobby: {
    top: "SAKAY NA!",
    bottom: "BARKADA BOARDING PASS",
    topBg: "bg-mango text-espresso border-b-2 border-espresso/20",
    bottomBg: "bg-teal text-milk",
  },
  arena: {
    top: "BYAHE NA!",
    bottom: "2❌ EKIS · 1❤️ BET · LOCK IN",
    topBg: "bg-teal text-milk border-b-2 border-espresso/20",
    bottomBg: "bg-mango text-espresso",
  },
  tapwar: {
    top: "PATAS ANG BOTO!",
    bottom: "5s FRANTIC TAP WAR",
    topBg: "bg-crimson text-milk border-b-2 border-espresso/20",
    bottomBg: "bg-mango text-espresso",
  },
  wheel: {
    top: "PATAS PA RIN!",
    bottom: "SPIN THE JEEPNEY WHEEL",
    topBg: "bg-mango text-espresso border-b-2 border-espresso/20",
    bottomBg: "bg-teal text-milk",
  },
  receipt: {
    top: "BYAHE COMPLETE!",
    bottom: "PRINTING OPISYAL NA RESIBO",
    topBg: "bg-espresso text-milk border-b-2 border-mango",
    bottomBg: "bg-milk text-espresso",
  },
};

function PhaseShutter({
  phase,
  roomCode,
  gameId,
  reduced,
}: {
  phase: Phase;
  roomCode: string | null;
  gameId: number;
  reduced: boolean;
}) {
  const spec = SHUTTER_COPY[phase];
  if (!spec || reduced) return null;

  return (
    <div
      key={`shutter-${phase}-${roomCode ?? "menu"}-${gameId}`}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col overflow-hidden"
    >
      <motion.div
        initial={{ x: "-105%" }}
        animate={{ x: ["-105%", "0%", "0%", "105%"] }}
        transition={{ duration: 1.25, times: [0, 0.24, 0.72, 1], ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-1 items-end justify-center pb-5 px-4 shadow-lg ${spec.topBg}`}
      >
        <div className="sign-dropshadow font-mono text-3xl font-extrabold tracking-widest uppercase">
          {spec.top}
        </div>
      </motion.div>

      <motion.div
        initial={{ x: "105%" }}
        animate={{ x: ["105%", "0%", "0%", "-105%"] }}
        transition={{ duration: 1.25, times: [0, 0.24, 0.72, 1], ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-1 items-start justify-center pt-5 px-4 shadow-lg ${spec.bottomBg}`}
      >
        <div className="rounded-xl border border-current/25 px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest uppercase">
          {roomCode ? `${roomCode} · ${spec.bottom}` : spec.bottom}
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { state, dispatch, act } = useGame();
  const { phase, room, tap, config, role, roomCode, meId, humans, hostId } = state;
  const reducedMotion = useReducedMotion();
  const isGuest = role === "guest";
  const hostGone = isGuest && !!hostId && humans.length > 0 && !humans.some((h) => h.id === hostId);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("room");
    if (code) dispatch({ type: "OPEN_JOIN", code: code.toUpperCase() });
  }, [dispatch]);

  useEffect(() => {
    if (phase === "setup" || phase === "join" || !roomCode) {
      document.title = "Kahit Saan - Main Menu";
    } else {
      document.title = `Kahit Saan - ${roomCode}`;
    }
  }, [phase, roomCode]);

  const createRoom = (c: GameConfig) => {
    const code = makeRoomCode();
    window.history.replaceState(null, "", `?room=${code}`);
    dispatch({ type: "CREATE_ROOM", config: c, code, meId: getPlayerId() });
  };
  const joinCode = (code: string) => {
    window.history.replaceState(null, "", `?room=${code}`);
    dispatch({ type: "OPEN_JOIN", code });
  };
  const leave = () => {
    window.history.replaceState(null, "", "/");
    dispatch({ type: "RESET" });
  };

  return (
    <>
      <PhaseShutter phase={phase} roomCode={roomCode} gameId={state.gameId} reduced={!!reducedMotion} />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${phase}-${roomCode ?? "menu"}-${state.gameId}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: reducedMotion ? 0.14 : 0.38, delay: phase === "setup" || reducedMotion ? 0 : 0.32 },
          }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="w-full"
        >
          {phase === "setup" && (
            <SetupScreen
              nickname={state.nickname}
              onNick={(nickname) => dispatch({ type: "SET_NICK", nickname })}
              onCreate={createRoom}
              onJoinCode={joinCode}
            />
          )}
          {phase === "join" && roomCode && (
            <JoinGate
              code={roomCode}
              nickname={state.nickname}
              onNick={(nickname) => dispatch({ type: "SET_NICK", nickname })}
              onJoin={() => dispatch({ type: "JOIN_ROOM", meId: getPlayerId() })}
              onBack={leave}
            />
          )}
          {phase === "lobby" && roomCode && (
            <LobbyScreen
              code={roomCode}
              humans={humans}
              config={config}
              meId={meId}
              isHost={role === "host"}
              hostGone={hostGone}
              onStart={() => config && dispatch({ type: "START", config, now: Date.now() + 1000 })}
              onLeave={leave}
            />
          )}
          {phase === "arena" && room && (
            <Arena room={room} meId={meId} isGuest={isGuest} dispatch={dispatch} act={act} />
          )}
          {phase === "tapwar" && room && tap && (
            <TapWar room={room} tap={tap} isGuest={isGuest} dispatch={dispatch} act={act} />
          )}
          {phase === "wheel" && room && state.wheel && (
            <SpinWheel room={room} wheel={state.wheel} isGuest={isGuest} dispatch={dispatch} />
          )}
          {phase === "receipt" && room && (
            <Receipt
              room={room}
              isGuest={isGuest}
              onRematch={() => config && dispatch({ type: "START", config, now: Date.now() + 1000 })}
              onHome={leave}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
