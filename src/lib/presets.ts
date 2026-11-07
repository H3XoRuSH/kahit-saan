export interface Preset {
  id: string;
  emoji: string;
  label: string;
  winnerPrefix: string;
  receiptSignoff: string;
  options: string[];
}

export const PRESETS: Preset[] = [
  {
    id: "eat",
    emoji: "🍽️",
    label: "Where to Eat",
    winnerPrefix: "KAKAIN TAYO SA:",
    receiptSignoff: "SALAMAT, KAIN NA!",
    options: ["Jollibee", "McDonald's", "KFC", "Wendy's", "Rodics", "24 Chicken"],
  },
  {
    id: "go",
    emoji: "📍",
    label: "Where to Go",
    winnerPrefix: "PUPUNTA TAYO SA:",
    receiptSignoff: "SALAMAT, TARA NA!",
    options: ["BGC", "Poblacion", "Mall of Asia", "Megamall", "Intramuros", "Greenfield"],
  },
  {
    id: "play",
    emoji: "🎮",
    label: "What to Play",
    winnerPrefix: "LALARUIN NATIN ANG:",
    receiptSignoff: "SALAMAT, LARO NA!",
    options: ["Valorant", "Mobile Legends", "Steam Party Games", "Roblox", "Palworld", "Escape Simulator"],
  },
  {
    id: "watch",
    emoji: "🎬",
    label: "What to Watch",
    winnerPrefix: "PANONOORIN NATIN ANG:",
    receiptSignoff: "SALAMAT, PLAY NA!",
    options: ["Horror", "Anime", "KDrama", "Action / Thriller", "Comedy", "True Crime Docu"],
  },
  {
    id: "activity",
    emoji: "🎯",
    label: "What to Do",
    winnerPrefix: "GAGAWIN NATIN ANG:",
    receiptSignoff: "SALAMAT, TARA NA!",
    options: ["Karaoke / KTV", "Bowling", "Billiards", "Escape Room", "Archery / Shooting", "Board Game Cafe"],
  },
  {
    id: "custom",
    emoji: "✏️",
    label: "Custom",
    winnerPrefix: "PINILI NATIN ANG:",
    receiptSignoff: "SALAMAT SA PAGBOTO! WALANG SISISIHAN.",
    options: ["", "", "", ""],
  },
];

export function getThemeCopy(themeId?: string): { winnerPrefix: string; receiptSignoff: string } {
  const found = PRESETS.find((p) => p.id === themeId);
  if (found) return { winnerPrefix: found.winnerPrefix, receiptSignoff: found.receiptSignoff };
  return {
    winnerPrefix: "PINILI NATIN ANG:",
    receiptSignoff: "SALAMAT SA PAGBOTO! WALANG SISISIHAN.",
  };
}
