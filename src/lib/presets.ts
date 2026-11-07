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
    options: ["Jollibee", "McDonald's", "Marugame Udon", "Frankies Wings", "Samgyupsal", "Ramen Nagi"],
  },
  {
    id: "go",
    emoji: "📍",
    label: "Where to Go",
    winnerPrefix: "PUPUNTA TAYO SA:",
    receiptSignoff: "SALAMAT, TARA NA!",
    options: ["BGC High Street", "Poblacion", "Mall of Asia", "Cafe Tambay", "Intramuros", "Arcade / Billiards"],
  },
  {
    id: "play",
    emoji: "🎮",
    label: "What to Play",
    winnerPrefix: "LALARUIN NATIN ANG:",
    receiptSignoff: "SALAMAT, LARO NA!",
    options: ["Valorant", "Mobile Legends", "Steam Party Games", "Roblox", "Board Games / Cards", "Lethal Company / Co-op"],
  },
  {
    id: "watch",
    emoji: "🎬",
    label: "What to Watch",
    winnerPrefix: "PANONOORIN NATIN ANG:",
    receiptSignoff: "SALAMAT, PLAY NA!",
    options: ["Horror Movie", "Anime Series", "KDrama", "Action / Thriller", "Comedy Film", "True Crime Docu"],
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
