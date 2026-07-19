// Padel Schedule — Express server
//
// Reads your Google Calendar through its private "secret iCal address" and
// shows only your upcoming padel matches. No Google sign-in, no OAuth — just
// one calendar link you paste into CALENDAR_ICS_URL. Works the same whether
// it runs on your Mac or on a free cloud host.

import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ical from 'node-ical';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Config ---------------------------------------------------------------

const PORT = process.env.PORT || 3000;
// The private iCal (.ics) URL from your Google Calendar settings.
const ICS_URL = process.env.CALENDAR_ICS_URL;
// How many days into the future to look. Default 30.
const LOOKAHEAD_DAYS = Number(process.env.LOOKAHEAD_DAYS || 30);

// Words that mark an event as a padel match. Matched case-insensitively
// against the event title, description and location.
const MATCH_KEYWORDS = ['playtomic', 'padel'];

if (!ICS_URL) {
  console.warn(
    '\n[padel-schedule] No CALENDAR_ICS_URL set yet.\n' +
      'Copy .env.example to .env and paste your Google Calendar "secret iCal ' +
      'address" into CALENDAR_ICS_URL.\n'
  );
}

// --- Padel filtering ------------------------------------------------------

function isPadelEvent(ev) {
  const haystack = [ev.summary, ev.description, ev.location]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return MATCH_KEYWORDS.some((word) => haystack.includes(word));
}

// Turn a parsed VEVENT (with a specific start/end) into the shape the UI needs.
function toMatch(ev, start, end) {
  const allDay = ev.datetype === 'date'; // DATE value = no clock time
  return {
    id: (ev.uid || ev.summary || 'match') + '@' + start.toISOString(),
    title: ev.summary || 'Padel match',
    start: start.toISOString(),
    end: end ? end.toISOString() : null,
    allDay,
    venue: ev.location || '',
    description: ev.description || '',
  };
}

// Expand one VEVENT into every occurrence that falls in [now, timeMax].
// Handles both single events and simple recurring ones (weekly games, etc.).
function occurrencesInWindow(ev, now, timeMax) {
  const out = [];
  const start = ev.start instanceof Date ? ev.start : new Date(ev.start);
  const end = ev.end instanceof Date ? ev.end : ev.end ? new Date(ev.end) : null;
  const durationMs = end ? end.getTime() - start.getTime() : 0;

  if (!ev.rrule) {
    // Single event: keep it if it hasn't finished yet and is within the window.
    const effectiveEnd = end || start;
    if (effectiveEnd >= now && start <= timeMax) out.push(toMatch(ev, start, end));
    return out;
  }

  // Recurring event: ask the rule for occurrences in the window.
  try {
    const dates = ev.rrule.between(now, timeMax, true);
    const exdates = Object.keys(ev.exdate || {});
    for (const d of dates) {
      const key = d.toISOString().slice(0, 10);
      if (exdates.some((x) => x.startsWith(key))) continue; // skip cancelled
      const occEnd = durationMs ? new Date(d.getTime() + durationMs) : null;
      if ((occEnd || d) >= now) out.push(toMatch(ev, d, occEnd));
    }
  } catch {
    // If a rule is malformed, fall back to the base event.
    if ((end || start) >= now && start <= timeMax) out.push(toMatch(ev, start, end));
  }
  return out;
}

// --- Express app ----------------------------------------------------------

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Tells the front-end whether a calendar link is configured.
app.get('/api/status', (_req, res) => {
  res.json({ configured: Boolean(ICS_URL) });
});

// The one endpoint the app really needs: upcoming padel matches.
app.get('/api/matches', async (_req, res) => {
  if (!ICS_URL) {
    return res.status(400).json({ error: 'not_configured' });
  }

  try {
    const response = await fetch(ICS_URL);
    if (!response.ok) {
      throw new Error(`Calendar returned HTTP ${response.status}`);
    }
    const text = await response.text();
    const data = ical.sync.parseICS(text);

    const now = new Date();
    const timeMax = new Date(now);
    timeMax.setDate(timeMax.getDate() + LOOKAHEAD_DAYS);

    let matches = [];
    for (const item of Object.values(data)) {
      if (!item || item.type !== 'VEVENT') continue;
      if (!isPadelEvent(item)) continue;
      matches = matches.concat(occurrencesInWindow(item, now, timeMax));
    }

    matches.sort((a, b) => new Date(a.start) - new Date(b.start));

    res.json({ matches, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[padel-schedule] Calendar error:', err.message);
    res.status(502).json({ error: 'calendar_error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎾 Padel Schedule running at http://localhost:${PORT}`);
  if (!ICS_URL) {
    console.log('   Add your calendar link to .env, then reload.\n');
  }
});
