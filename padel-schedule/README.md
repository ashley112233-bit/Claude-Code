# 🎾 Padel Schedule

A private, iPhone-first web app that shows **only your upcoming padel matches**
from your **Google Calendar** (the ones synced from **Playtomic**).

- Today's matches first, then tomorrow, then everything upcoming.
- Shows date, start time, end time (when available), venue and event title.
- **No past matches, no results** — just what's next.
- **Refresh** and **Maps** buttons.
- Installable to your iPhone Home Screen (opens full-screen like a real app).
- Simple design: white background, big text.

It reads your calendar through its built-in **private iCal link** — one link
you copy from Google Calendar settings. **No Google sign-in, no Google Cloud
setup.**

---

## First: get your calendar's private link (do this once, on a computer)

1. Open [Google Calendar](https://calendar.google.com) on a computer.
2. Hover the calendar that has your padel matches (left sidebar) → **⋮** →
   **Settings and sharing**.
3. Scroll to **Integrate calendar**.
4. Copy the **"Secret address in iCal format"** — it ends in `.ics`.

> Keep this link private — anyone who has it can read that calendar.

You'll paste this link in one place below. That's the only setup.

---

## Option A — Run it so it just lives on your iPhone (recommended)

This puts the app on a **free** cloud host, so there's nothing to keep running
on a computer. Your iPhone just opens a link.

1. Go to [render.com](https://render.com) and sign up (free) — the "Sign up
   with GitHub" button is easiest, since the code lives on GitHub.
2. Click **New +** → **Blueprint**.
3. Connect this repository. Render reads the included `render.yaml` and sets
   everything up automatically.
4. When it asks for the value of **`CALENDAR_ICS_URL`**, paste the secret iCal
   link from above. Click **Apply** / **Create**.
5. Wait ~1–2 minutes for it to build. Render gives you a link like
   `https://padel-schedule-xxxx.onrender.com`.
6. On your iPhone, open that link in **Safari** → tap **Share** →
   **Add to Home Screen** → **Add**.

You now have a **Padel** icon on your Home Screen. 🎉

> Note: Render's free tier "sleeps" the app after a while idle, so the very
> first tap after a long gap can take ~30 seconds to wake up. After that it's
> instant. (Any always-on host works the same way — see "Other hosts" below.)

---

## Option B — Run it on your Mac

Use this if you'd rather not deploy anything. The app runs on your Mac and
your iPhone opens it over Wi-Fi (both on the same network, Mac running).

You need [Node.js](https://nodejs.org) 18+ (`node --version` to check).

```bash
cd padel-schedule
npm install
npm run setup          # creates your .env file
open -e .env           # paste your secret iCal link into CALENDAR_ICS_URL, save
npm start
```

Then:

- On your **Mac**, open <http://localhost:3000> to check it works.
- To use it on your **iPhone** (same Wi-Fi, Mac running):
  1. Find your Mac's IP: `ipconfig getifaddr en0`
  2. On the iPhone open Safari → `http://YOUR-MAC-IP:3000`
  3. **Share → Add to Home Screen**.

Stop the server with **Ctrl + C**; run `npm start` again to restart.

---

## Everyday use

- Tap **↻ Refresh** to pull the latest matches from your calendar.
- Tap **📍 Maps** on a match to open the venue in Apple Maps.

---

## How matches are detected

Padel Schedule keeps only upcoming events whose **title, description, or
location** mentions **"Playtomic"** or **"padel"** (case-insensitive).
Playtomic bookings synced to Google Calendar match automatically. Past events
are never shown. Recurring weekly games are expanded automatically.

You can change the lookahead window with `LOOKAHEAD_DAYS` (default 30).

> The private iCal feed is refreshed by Google periodically, so a
> brand-new booking can take a little while to appear. For matches booked in
> advance this is not noticeable.

---

## Project structure

```
padel-schedule/
├── server.js               Express server: fetches the iCal feed, filters padel
├── package.json
├── render.yaml             One-click deploy config for Render (Option A)
├── .env.example            Copy to .env and paste your calendar link (Option B)
├── .gitignore
├── scripts/
│   ├── setup.js            `npm run setup` — creates your .env
│   └── generate-icons.js   Regenerates the app icons (already committed)
└── public/
    ├── index.html
    ├── styles.css
    ├── app.js              Fetches matches, groups Today/Tomorrow/Upcoming
    ├── manifest.json       PWA manifest (Home Screen install)
    ├── service-worker.js   App-shell caching; live data is never cached
    └── icons/              App icons (192, 512, apple-touch)
```

---

## Other hosts

`render.yaml` targets Render, but the app is a plain Node/Express server — any
host that runs Node works. Set one environment variable, `CALENDAR_ICS_URL`,
and run `npm start`.

---

## Privacy & security

- The only outside connection is fetching your own calendar's iCal link.
- Your calendar link lives in `.env` (Option B) or the host's private env
  settings (Option A) — `.env` is git-ignored and never committed.
- Read-only: the app can't change anything in your calendar.

---

## Troubleshooting

- **"No calendar link set yet"** — `CALENDAR_ICS_URL` isn't set. On Render,
  add it under the service's **Environment**. Locally, put it in `.env`.
- **No matches showing** — confirm your Playtomic bookings appear in that
  Google Calendar, are in the future, and that their title/location contains
  "padel" or "Playtomic". A new booking may take a bit to appear (see above).
- **First open is slow (Render free tier)** — the app was asleep; it wakes in
  ~30 seconds, then stays fast.
