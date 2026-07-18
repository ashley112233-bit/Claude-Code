// Padel Schedule — Express server + Google Calendar integration
//
// Shows only upcoming padel matches that were added from Playtomic to your
// Google Calendar. Auth tokens are stored locally in a token file so you only
// sign in once. No data ever leaves your machine.

import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Config ---------------------------------------------------------------

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/oauth2callback`;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
// How many days into the future to look. Default 30.
const LOOKAHEAD_DAYS = Number(process.env.LOOKAHEAD_DAYS || 30);
// Where the OAuth token is cached on disk.
const TOKEN_PATH = path.join(__dirname, process.env.TOKEN_FILE || 'token.json');

// Words that mark an event as a padel match. Matched case-insensitively
// against the event title, description and location.
const MATCH_KEYWORDS = ['playtomic', 'padel'];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    '\n[padel-schedule] Missing Google credentials.\n' +
      'Copy .env.example to .env and fill in GOOGLE_CLIENT_ID and ' +
      'GOOGLE_CLIENT_SECRET.\n'
  );
}

// --- OAuth helpers --------------------------------------------------------

function makeOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

function loadSavedToken() {
  try {
    const raw = fs.readFileSync(TOKEN_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToken(tokens) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

// Returns an authorized OAuth client, or null if the user hasn't signed in.
function getAuthorizedClient() {
  const token = loadSavedToken();
  if (!token) return null;
  const client = makeOAuthClient();
  client.setCredentials(token);
  // Persist refreshed tokens so the login keeps working.
  client.on('tokens', (fresh) => {
    const merged = { ...loadSavedToken(), ...fresh };
    saveToken(merged);
  });
  return client;
}

// --- Padel filtering ------------------------------------------------------

function isPadelEvent(event) {
  const haystack = [event.summary, event.description, event.location]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return MATCH_KEYWORDS.some((word) => haystack.includes(word));
}

// Normalize a Google Calendar event into the shape the UI needs.
function toMatch(event) {
  const start = event.start?.dateTime || event.start?.date || null;
  const end = event.end?.dateTime || event.end?.date || null;
  // All-day events only carry a `date`, so there's no clock time.
  const allDay = Boolean(event.start?.date && !event.start?.dateTime);
  return {
    id: event.id,
    title: event.summary || 'Padel match',
    start,
    end,
    allDay,
    venue: event.location || '',
    description: event.description || '',
    htmlLink: event.htmlLink || '',
  };
}

// --- Express app ----------------------------------------------------------

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Start the Google sign-in flow.
app.get('/auth', (_req, res) => {
  const client = makeOAuthClient();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  });
  res.redirect(url);
});

// Google redirects here after the user grants access.
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing authorization code.');
  try {
    const client = makeOAuthClient();
    const { tokens } = await client.getToken(code);
    saveToken(tokens);
    res.send(
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<div style="font:600 20px -apple-system,system-ui,sans-serif;' +
        'padding:40px;text-align:center;color:#111">' +
        '✅ Connected to Google Calendar.<br><br>' +
        'You can close this tab and open Padel Schedule.' +
        '<br><br><a href="/" style="color:#0a7d3c">Open Padel Schedule</a></div>'
    );
  } catch (err) {
    console.error('[padel-schedule] OAuth error:', err.message);
    res.status(500).send('Authorization failed: ' + err.message);
  }
});

// Tells the front-end whether we're signed in yet.
app.get('/api/status', (_req, res) => {
  res.json({
    authenticated: Boolean(loadSavedToken()),
    hasCredentials: Boolean(CLIENT_ID && CLIENT_SECRET),
  });
});

// The one endpoint the app really needs: upcoming padel matches.
app.get('/api/matches', async (_req, res) => {
  const auth = getAuthorizedClient();
  if (!auth) {
    return res
      .status(401)
      .json({ error: 'not_authenticated', authUrl: '/auth' });
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const now = new Date();
    const timeMax = new Date(now);
    timeMax.setDate(timeMax.getDate() + LOOKAHEAD_DAYS);

    const { data } = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: now.toISOString(), // only upcoming — never past matches
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    const matches = (data.items || [])
      .filter(isPadelEvent)
      .map(toMatch)
      .filter((m) => m.start); // drop anything without a start time

    res.json({ matches, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[padel-schedule] Calendar error:', err.message);
    // A revoked/expired token surfaces here — ask the user to reconnect.
    if (err.code === 401 || /invalid_grant/i.test(err.message)) {
      return res
        .status(401)
        .json({ error: 'not_authenticated', authUrl: '/auth' });
    }
    res.status(500).json({ error: 'calendar_error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎾 Padel Schedule running at http://localhost:${PORT}`);
  if (!loadSavedToken()) {
    console.log(
      `   First time? Open http://localhost:${PORT}/auth to connect Google Calendar.\n`
    );
  }
});
