# 🧟 Zombies Tracker

A private web app to track high round records across all **Black Ops 1** and **Black Ops 2** zombies maps. Built for people who actually care about their records.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

---

## Features

- **Game switcher** — toggle between Black Ops 1 and Black Ops 2 with a single tap
- **Map grid** — all maps displayed as cards with their cover art pulled from the CoD wiki
- **Record tracking** — log the round you reached, the date you played, and the map
- **BO2 rank icons** — bone, skull, skull + knife, skull + shotguns based on your round
- **Leaderboard** — maps ranked by your highest round, with rank icons
- **Stats** — best global record, favorite map, and total sessions per game
- **Session history** — full log per map, with the option to delete a session if you made a mistake
- **Password protected** — only people with the password can access the app
- **Fully responsive** — works on mobile and desktop

---

## Maps Covered

**Black Ops 1** — Nacht der Untoten, Verrückt, Shi No Numa, Der Riese, Kino der Toten, Five, Ascension, Call of the Dead, Shangri-La, Moon

**Black Ops 2** — TranZit, Die Rise, Mob of the Dead, Buried, Origins, Nuketown Zombies + survival maps (Pueblo, Granja, Bus Depot) and their Pena variants

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Fonts | Inter (Google Fonts) |
| Images | CoD Fandom Wiki CDN |

---

## Running Locally

**1. Clone the repo and install dependencies**

```bash
git clone https://github.com/YOUR_USERNAME/zombies-tracker.git
cd zombies-tracker
npm install
```

**2. Set up Supabase**

Create a project at [supabase.com](https://supabase.com) and run this SQL in the SQL Editor:

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  map text not null,
  round integer not null,
  played_at date not null,
  created_at timestamptz default now()
);
```

**3. Configure environment variables**

Create a `.env` file at the root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_PASSWORD=your_chosen_password
```

**4. Start the dev server**

```bash
npm run dev
```

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import it in [vercel.com](https://vercel.com)
3. Add the three environment variables from above in the Vercel project settings
4. Deploy — every future `git push` to `main` redeploys automatically

---

## BO2 Rank System

| Round range | Icon |
|------------|------|
| 1 – 10 | 🦴 Bone |
| 11 – 20 | 💀 Skull |
| 21 – 30 | 💀🔪 Skull + Knife |
| 31+ | 💀🔫 Skull + Shotguns |
