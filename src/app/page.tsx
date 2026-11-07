"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/store";
import { getPlayerId, makeRoomCode } from "@/lib/identity";
import SetupScreen from "@/components/SetupScreen";
import LobbyScreen, { JoinGate } from "@/components/LobbyScreen";
import Arena from "@/components/Arena";
import TapWar from "@/components/TapWar";
import SpinWheel from "@/components/SpinWheel";
import Receipt from "@/components/Receipt";
import type { GameConfig } from "@/lib/types";

export default function Home() {
  const { state, dispatch, act } = useGame();
  const { phase, room, tap, config, role, roomCode, meId, humans, hostId } = state;
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
          onStart={() => config && dispatch({ type: "START", config, now: Date.now() })}
          onLeave={leave}
        />
      )}
      {phase === "arena" && room && (
        <Arena key={state.gameId} room={room} meId={meId} isGuest={isGuest} dispatch={dispatch} act={act} />
      )}
      {phase === "tapwar" && room && tap && (
        <TapWar key={state.gameId} room={room} tap={tap} isGuest={isGuest} dispatch={dispatch} act={act} />
      )}
      {phase === "wheel" && room && state.wheel && (
        <SpinWheel key={state.gameId} room={room} wheel={state.wheel} isGuest={isGuest} dispatch={dispatch} />
      )}
      {phase === "receipt" && room && (
        <Receipt
          key={state.gameId}
          room={room}
          isGuest={isGuest}
          onRematch={() => config && dispatch({ type: "START", config, now: Date.now() })}
          onHome={leave}
        />
      )}
    </>
  );
}
