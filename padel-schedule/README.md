# 🎾 Padel Schedule

A private, iPhone-first web app that shows **only your upcoming padel matches**
— the ones added from **Playtomic** to your **Google Calendar**.

- Today's matches first, then tomorrow, then everything upcoming.
- Shows date, start time, end time (when available), venue and event title.
- **No past matches, no results** — just what's next.
- **Refresh** and **Maps** buttons.
- Installable to your iPhone Home Screen (looks and opens like a real app).
- Simple design: white background, big text.

Everything runs locally on your Mac. Your calendar data and sign-in token
never leave your machine.

---

## What you need

- A Mac with [Node.js](https://nodejs.org) 18 or newer.
  Check with: `node --version`
- A Google account whose Calendar receives your Playtomic bookings.
- About 10 minutes for the one-time Google setup.

---

## Step 1 — Get Google Calendar credentials (one time)

The app reads your calendar through Google's official API, so Google needs to
know it's you. This is free.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (top bar → project dropdown → **New Project**). Name it
   e.g. `Padel Schedule`. Select it once created.
3. Enable the Calendar API:
   **APIs & Services → Library** → search **"Google Calendar API"** →
   **Enable**.
4. Configure the consent screen:
   **APIs & Services → OAuth consent screen** →
   - User type: **External** → **Create**.
   - App name: `Padel Schedule`, your email for support/developer contact →
     **Save and Continue** through the remaining steps.
   - On **Test users**, click **+ Add users** and add your own Google email.
     (Leaving the app in "Testing" is fine — it's just for you.)
5. Create the credentials:
   **APIs & Services → Credentials → + Create Credentials → OAuth client ID**
   - Application type: **Web application**.
   - Name: `Padel Schedule`.
   - Under **Authorized redirect URIs**, click **+ Add URI** and paste
     exactly:
     ```
     http://localhost:3000/oauth2callback
     ```
   - **Create**. Copy the **Client ID** and **Client secret** shown.

---

## Step 2 — Set up the app on your Mac

Open the **Terminal** app and run these commands one at a time.

```bash
# 1. Go into the project folder (adjust the path to where you saved it)
cd padel-schedule

# 2. Install dependencies
npm install

# 3. Create your local config from the example
cp .env.example .env
```

Now open `.env` in a text editor and paste in the values from Step 1:

```bash
# Opens .env in TextEdit
open -e .env
```

Fill in:

```
GOOGLE_CLIENT_ID=...your client id...
GOOGLE_CLIENT_SECRET=...your client secret...
```

Save and close the file.

---

## Step 3 — Run it

```bash
npm start
```

You'll see:

```
🎾 Padel Schedule running at http://localhost:3000
```

**First run only — connect Google Calendar:**

1. In your browser, go to <http://localhost:3000>.
2. Click **Connect Google Calendar**.
3. Sign in and allow read-only access to your calendar.
   - If you see a "Google hasn't verified this app" screen, click
     **Advanced → Go to Padel Schedule (unsafe)**. This is expected for a
     personal app you built yourself; it's safe because it's your own app.
4. You'll be redirected back and see your matches.

The sign-in is saved to `token.json`, so you won't have to do this again.

To stop the server, press **Ctrl + C** in the Terminal. To start it again
later, just run `npm start` from the project folder.

---

## Step 4 — Add to your iPhone Home Screen

Your iPhone and Mac must be on the **same Wi-Fi network**.

1. Find your Mac's local IP address:
   ```bash
   ipconfig getifaddr en0
   ```
   (e.g. `192.168.1.42`. If that prints nothing, try `en1`.)
2. On your iPhone, open **Safari** and go to:
   `http://YOUR-MAC-IP:3000` (e.g. `http://192.168.1.42:3000`).
3. Tap the **Share** button → **Add to Home Screen** → **Add**.

You'll now have a **Padel** icon on your Home Screen that opens full-screen,
no address bar.

> Tip: the app only works while `npm start` is running on your Mac and both
> devices are on the same Wi-Fi. If you want it always available, keep the
> Terminal running, or deploy it to a small always-on host.

---

## Everyday use

- Tap **↻ Refresh** to pull the latest matches from your calendar.
- Tap **📍 Maps** on a match to open the venue in Apple Maps.

---

## How matches are detected

Padel Schedule looks at your upcoming calendar events and keeps only those
whose **title, description, or location** mentions **"Playtomic"** or
**"padel"** (case-insensitive). Playtomic bookings synced to Google Calendar
match automatically. Past events are never shown.

You can adjust the lookahead window and which calendar is read in `.env`
(`LOOKAHEAD_DAYS`, `GOOGLE_CALENDAR_ID`).

---

## Project structure

```
padel-schedule/
├── server.js               Express server + Google Calendar API + filtering
├── package.json
├── .env.example            Copy to .env and fill in your credentials
├── .gitignore
├── scripts/
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

## Privacy & security

- Runs entirely on your Mac. Nothing is sent to any server except Google's
  own Calendar API.
- Uses **read-only** calendar access.
- `.env` (your credentials) and `token.json` (your sign-in) are git-ignored
  and never committed.

---

## Troubleshooting

- **"Missing Google credentials" in the Terminal** — you haven't filled in
  `.env`. Redo Step 2.
- **`redirect_uri_mismatch`** — the redirect URI in Google Cloud must be
  exactly `http://localhost:3000/oauth2callback` (and match
  `GOOGLE_REDIRECT_URI` in `.env`).
- **No matches showing** — confirm your Playtomic bookings actually appear in
  the Google Calendar you're reading, that they're in the future, and that
  their title/location contains "padel" or "Playtomic".
- **Want to re-connect a different account** — delete `token.json` and reload
  the app.
