# 🍢 Kahit Saan

> *"Stop asking 'Kahit Saan.' Ekis what you hate, kain what survives."*

**Kahit Saan** is a mobile-first, real-time multiplayer micro-party game built to end barkada indecision in under a minute. No accounts, no installs—just drop the room link in the GC and vote.

---

## ⚡ The Core Mechanic: "Two Strikes & A Heart"

Every player receives exactly 3 tokens with zero math bloat:

- **❌ EKIS (2 Tokens):** Veto choices you hate. Maximum 1 strike per option.
- **❤️ BET (1 Token):** Crave what you want. Adds craving points and cancels out 1 strike.
- **💀 Banned State:** When net strikes reach the limit (`2` for small groups, auto-scales to `3` for 6+ players), the card shatters and is eliminated.
- **⚡ 5-Second Tap War:** If survivors tie on craving points and strikes, all players mash the screen for 5 seconds to crown the winner.
- **🧾 The Barkada Resibo:** Generates a copy-pasteable street-food receipt for Messenger, Telegram, or Discord, complete with awards (*Master Butcher*, *Lifesaver*, and *Certified "Kahit Saan"*).

---

## 🎯 Themes & Presets

- 🍽️ **Where to Eat** (*Jollibee, McDonald's, Marugame Udon, Frankies Wings, etc.*)
- 📍 **Where to Go** (*BGC High Street, Poblacion, Mall of Asia, Intramuros, etc.*)
- 🎮 **What to Play** (*Valorant, Mobile Legends, Steam Party Games, Roblox, etc.*)
- 🎬 **What to Watch** (*Horror, Anime, KDrama, Action/Thriller, etc.*)
- ✏️ **Custom List** (*Type your own options*)

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Neo-Brutalist Arcade theme)
- **Animation:** Framer Motion & Canvas Confetti
- **Multiplayer Transport:** Supabase Realtime (Broadcast & Presence)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-username/kahit-saan.git
cd kahit-saan
npm install
```

### 2. Configure Environment
Copy the example environment file and add your Supabase credentials:
```bash
cp .env.example .env.local
```
Update `.env.local` with your project's URL and Publishable (anon) key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser or mobile viewport.
