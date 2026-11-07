import { useSyncExternalStore } from "react";

const KEY = "kahit-saan-player-id";

/** Stable per-tab player id (survives refresh → reconnect keeps your tokens). */
export function getPlayerId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `p${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `p${Math.random().toString(36).slice(2, 9)}`;
  }
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeRoomCode(): string {
  let s = "";
  for (let i = 0; i < 3; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `KAIN-${s}`;
}

const AVATARS = ["😎", "🤠", "🥳", "😈", "🤖", "👻", "🦁", "🐻", "🐵", "🦉", "🐲", "🍕"];
export function avatarFor(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

export function defaultNickname(id: string): string {
  return `Gutom ${id.slice(-3).toUpperCase()}`;
}

const noopSubscribe = () => () => {};

export function useDefaultAlias(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => defaultNickname(getPlayerId()),
    () => ""
  );
}

export function displayName(nickname: string, id: string): string {
  return nickname.trim() || defaultNickname(id);
}
