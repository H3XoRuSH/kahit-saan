import type { RoomState } from "./types";
import { computeAwards, netStrikes, rankOptions, graveyard } from "./game-logic";
import { getThemeCopy } from "./presets";

export function buildReceiptText(room: RoomState): string {
  const limit = room.strikeLimitToBan;
  const ranked = rankOptions(room.options, limit);
  const winner = room.options.find((o) => o.id === room.winnerId);
  const dead = graveyard(room.options, limit);
  const awards = computeAwards(room.options, room.players, room.feed, limit, room.winnerId);
  const name = (id: string) => room.players[id]?.name ?? "???";
  const runners = ranked.filter((o) => o.id !== room.winnerId && netStrikes(o) < limit);
  const theme = getThemeCopy(room.themeId);

  const lines = [
    `🧾 KAHIT SAAN — ${room.category}`,
    `🖊 ${theme.winnerPrefix} ${winner?.title ?? "?"} (❤️ x${winner?.heartsFrom.length ?? 0})`,
  ];
  if (runners.length) {
    lines.push(`🥈 Runners-up: ${runners.map((o) => `${o.title} (❤️${o.heartsFrom.length} ❌${o.strikesFrom.length})`).join(", ")}`);
  }
  if (dead.length) lines.push(`💀 Ekis Graveyard: ${dead.map((o) => o.title).join(", ")}`);
  awards.butchers.forEach((b) => lines.push(`🔪 Master Butcher: ${name(b.playerId)} (killed ${b.optionTitle})`));
  if (awards.lifesavers.length) lines.push(`🛡️ Lifesaver: ${awards.lifesavers.map(name).join(", ")}`);
  if (awards.kahitSaan.length) lines.push(`😴 Certified 'Kahit Saan': ${awards.kahitSaan.map(name).join(", ")}`);
  lines.push(`✨ ${theme.receiptSignoff}`);
  return lines.join("\n");
}
