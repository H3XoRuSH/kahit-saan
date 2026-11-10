import type { FeedEvent, OptionCard, Player, TokenKind } from "./types";

export const MAX_STRIKES_PER_PLAYER = 2;
export const MAX_HEARTS_PER_PLAYER = 1;

/** Strike limit requires a strict >50% majority to eliminate an option. */
export function strikeLimitFor(playerCount: number): number {
  if (playerCount <= 2) return 2;
  return Math.ceil((playerCount + 1) / 2);
}

/** netStrikes = max(0, strikes - (hearts * 2)) — 1 BET absorbs 2 EKIS */
export function netStrikes(card: OptionCard): number {
  return Math.max(0, card.strikesFrom.length - card.heartsFrom.length * 2);
}

/** An option is eliminated (banned) once net strikes reach the limit. */
export function isEliminated(card: OptionCard, strikeLimit: number): boolean {
  return netStrikes(card) >= strikeLimit;
}

/** score = isBanned ? -1 : hearts */
export function scoreOf(card: OptionCard, strikeLimit: number): number {
  return isEliminated(card, strikeLimit) ? -1 : card.heartsFrom.length;
}

/** Sort: most hearts first, then fewer raw strikes (cleanest survivor). Stable. */
export function compareSurvivors(a: OptionCard, b: OptionCard): number {
  if (b.heartsFrom.length !== a.heartsFrom.length) {
    return b.heartsFrom.length - a.heartsFrom.length;
  }
  return a.strikesFrom.length - b.strikesFrom.length;
}

export function survivors(options: OptionCard[], limit: number): OptionCard[] {
  return options.filter((o) => !isEliminated(o, limit));
}

export function graveyard(options: OptionCard[], limit: number): OptionCard[] {
  return options.filter((o) => isEliminated(o, limit));
}

/** Full ranking: survivors (sorted) followed by eliminated options. */
export function rankOptions(options: OptionCard[], limit: number): OptionCard[] {
  const alive = [...survivors(options, limit)].sort(compareSurvivors);
  const dead = [...graveyard(options, limit)].sort(
    (a, b) => netStrikes(a) - netStrikes(b) || compareSurvivors(a, b),
  );
  return [...alive, ...dead];
}

export interface Decision {
  winnerId: string | null; // set when decided without a tap war
  finalists: string[]; // tied top options (length > 1 → tap war)
}

/**
 * Decide the winner:
 * 1. Eliminated options can't win.
 * 2. Most hearts wins. 3. Tie → fewer strikes. 4. Still tied → tap war finalists.
 * Edge case: if everything is eliminated, the least-net-struck options are revived.
 */
export function decideWinner(options: OptionCard[], limit: number): Decision {
  let pool = survivors(options, limit);
  if (pool.length === 0) {
    const min = Math.min(...options.map(netStrikes));
    pool = options.filter((o) => netStrikes(o) === min);
  }
  const sorted = [...pool].sort(compareSurvivors);
  const top = sorted[0];
  const tied = sorted.filter((o) => compareSurvivors(o, top) === 0);
  if (tied.length === 1) return { winnerId: top.id, finalists: [top.id] };
  return { winnerId: null, finalists: tied.map((o) => o.id) };
}

export function strikesUsed(options: OptionCard[], playerId: string): number {
  return options.filter((o) => o.strikesFrom.includes(playerId)).length;
}

export function heartsUsed(options: OptionCard[], playerId: string): number {
  return options.filter((o) => o.heartsFrom.includes(playerId)).length;
}

export function tokensUsed(options: OptionCard[], playerId: string): number {
  return strikesUsed(options, playerId) + heartsUsed(options, playerId);
}

/**
 * Toggle/move a token. Rules:
 * - ❌: max 2 per player, never 2 on the same card; tap again to pick up.
 * - ❤️: 1 per player; placing it moves it; tap again to pick up.
 * - A player can't hold ❌ and ❤️ on the same card (placing one replaces the other).
 */
export function placeToken(
  options: OptionCard[],
  playerId: string,
  kind: TokenKind,
  optionId: string,
  feed: FeedEvent[] = [],
): { options: OptionCard[]; changed: boolean } {
  const target = options.find((o) => o.id === optionId);
  if (!target) return { options, changed: false };

  if (kind === "strike") {
    const has = target.strikesFrom.includes(playerId);
    const lastStrikeIdx = (optId: string) =>
      feed.findLastIndex((f) => f.type === "strike" && f.playerId === playerId && f.optionId === optId);
    const evictId =
      !has && strikesUsed(options, playerId) >= MAX_STRIKES_PER_PLAYER
        ? options
            .filter((o) => o.id !== optionId && o.strikesFrom.includes(playerId))
            .sort((a, b) => lastStrikeIdx(a.id) - lastStrikeIdx(b.id))[0]?.id
        : undefined;
    return {
      changed: true,
      options: options.map((o) => {
        if (o.id === evictId) {
          return { ...o, strikesFrom: o.strikesFrom.filter((p) => p !== playerId) };
        }
        if (o.id !== optionId) return o;
        return {
          ...o,
          strikesFrom: has
            ? o.strikesFrom.filter((p) => p !== playerId)
            : [...o.strikesFrom, playerId],
          heartsFrom: has ? o.heartsFrom : o.heartsFrom.filter((p) => p !== playerId),
        };
      }),
    };
  }

  const has = target.heartsFrom.includes(playerId);
  return {
    changed: true,
    options: options.map((o) => {
      if (o.id === optionId) {
        return {
          ...o,
          heartsFrom: has
            ? o.heartsFrom.filter((p) => p !== playerId)
            : [...o.heartsFrom, playerId],
          strikesFrom: has ? o.strikesFrom : o.strikesFrom.filter((p) => p !== playerId),
        };
      }
      return { ...o, heartsFrom: o.heartsFrom.filter((p) => p !== playerId) };
    }),
  };
}

/** Build feed events by diffing a card before/after a placement. */
export function describePlacement(
  before: OptionCard[],
  after: OptionCard[],
  player: Player,
  kind: TokenKind,
  optionId: string,
  limit: number,
  now: number,
): FeedEvent[] {
  const b = before.find((o) => o.id === optionId);
  const a = after.find((o) => o.id === optionId);
  if (!b || !a) return [];
  const base = {
    timestamp: now,
    playerId: player.id,
    playerName: player.name,
    optionId,
    optionTitle: a.title,
  };
  const mk = (type: FeedEvent["type"], extra?: Partial<FeedEvent>): FeedEvent => ({
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    ...base,
    type,
    ...extra,
  });
  const out: FeedEvent[] = [];
  if (kind === "strike" && !b.strikesFrom.includes(player.id) && a.strikesFrom.includes(player.id)) {
    out.push(mk("strike", { strikesLeft: Math.max(0, limit - netStrikes(a)) }));
    if (isEliminated(a, limit) && !isEliminated(b, limit)) out.push(mk("ban"));
  }
  if (kind === "heart" && !b.heartsFrom.includes(player.id) && a.heartsFrom.includes(player.id)) {
    const saved = b.strikesFrom.length >= limit && !isEliminated(a, limit);
    const rescued = isEliminated(b, limit) && !isEliminated(a, limit);
    out.push(mk(saved || rescued ? "save" : "heart"));
  }
  return out;
}

export interface Awards {
  butchers: { playerId: string; optionTitle: string }[];
  lifesavers: string[];
  kahitSaan: string[];
}

/** Auto-generated Barkada awards for the receipt. */
export function computeAwards(
  options: OptionCard[],
  players: Record<string, Player>,
  feed: FeedEvent[],
  limit: number,
  winnerId: string | null,
): Awards {
  const butchers: Awards["butchers"] = [];
  for (const dead of graveyard(options, limit)) {
    const ev = [...feed].reverse().find((f) => f.type === "ban" && f.optionId === dead.id);
    if (ev) butchers.push({ playerId: ev.playerId, optionTitle: dead.title });
  }

  const winner = options.find((o) => o.id === winnerId);
  const lifesavers =
    winner && winner.strikesFrom.length >= limit && !isEliminated(winner, limit)
      ? [...winner.heartsFrom]
      : [];

  const kahitSaan = Object.values(players)
    .filter((p) => tokensUsed(options, p.id) < MAX_STRIKES_PER_PLAYER + MAX_HEARTS_PER_PLAYER)
    .map((p) => p.id);

  return { butchers, lifesavers, kahitSaan };
}
