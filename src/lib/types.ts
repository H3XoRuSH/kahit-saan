export type RoomStatus = "lobby" | "active" | "tiebreaker" | "finished";
export type Phase = "setup" | "join" | "lobby" | "arena" | "tapwar" | "wheel" | "receipt";
export type TokenKind = "strike" | "heart";
export type Role = "host" | "guest";

export interface OptionCard {
  id: string;
  title: string;
  strikesFrom: string[]; // Player IDs who placed an ❌ here (max 1 per player)
  heartsFrom: string[]; // Player IDs who placed a ❤️ here (max 1 per player)
  tiebreakerTaps: number;
}

export interface Player {
  id: string;
  name: string;
  avatarEmoji: string;
  isLockedIn: boolean;
}

export interface FeedEvent {
  id: string;
  timestamp: number;
  type: "strike" | "heart" | "ban" | "save";
  playerId: string;
  playerName: string;
  optionId: string;
  optionTitle: string;
  strikesLeft?: number; // strikes remaining before ban (for strike events)
}

export interface RoomState {
  roomCode: string;
  category: string;
  themeId?: string;
  status: RoomStatus;
  strikeLimitToBan: number;
  durationSeconds: number;
  endsAtTimestamp: number | null;
  options: OptionCard[];
  players: Record<string, Player>;
  feed: FeedEvent[];
  winnerId: string | null;
}

export interface GameConfig {
  category: string;
  themeId?: string;
  titles: string[];
  durationSeconds: number;
}

export interface TapWarState {
  endsAt: number;
  finalists: string[]; // option ids
}

export interface WheelState {
  candidateIds: string[];
  winnerId: string;
  targetRotation: number;
  startedAt: number;
  durationMs: number;
}

export interface HumanInfo {
  id: string;
  name: string;
  avatar: string;
}

/** Messages guests send to the host over Broadcast. `lock` toggles lock-in. */
export type Intent =
  | { t: "place"; kind: TokenKind; optionId: string }
  | { t: "lock" }
  | { t: "tap"; optionId: string; n: number };
