// Padel Schedule — front-end logic
// Fetches upcoming padel matches and groups them into Today / Tomorrow / Upcoming.

const els = {
  status: document.getElementById('status'),
  matches: document.getElementById('matches'),
  updated: document.getElementById('updated'),
  refresh: document.getElementById('refresh-btn'),
};

// --- Date helpers ---------------------------------------------------------

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Which bucket does this match belong in, relative to now?
function bucketFor(startISO) {
  const today = startOfDay(new Date());
  const day = startOfDay(new Date(startISO));
  const diffDays = Math.round((day - today) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return 'Upcoming';
}

function formatDate(startISO) {
  return new Date(startISO).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// --- Rendering ------------------------------------------------------------

function mapsLink(venue) {
  return (
    'https://maps.apple.com/?q=' + encodeURIComponent(venue) // opens Apple Maps on iPhone
  );
}

function matchCard(m) {
  const card = document.createElement('article');
  card.className = 'match';

  const title = document.createElement('h3');
  title.className = 'title';
  title.textContent = m.title;
  card.appendChild(title);

  card.appendChild(row('Date', formatDate(m.start)));

  if (!m.allDay) {
    const timeText =
      formatTime(m.start) + (m.end ? ' – ' + formatTime(m.end) : '');
    card.appendChild(row('Time', timeText, 'time'));
  }

  if (m.venue) {
    card.appendChild(row('Venue', m.venue, 'venue'));
  }

  if (m.venue) {
    const actions = document.createElement('div');
    actions.className = 'match-actions';
    const maps = document.createElement('a');
    maps.className = 'maps-btn';
    maps.href = mapsLink(m.venue);
    maps.target = '_blank';
    maps.rel = 'noopener';
    maps.textContent = '📍 Maps';
    actions.appendChild(maps);
    card.appendChild(actions);
  }

  return card;
}

function row(label, value, valueClass) {
  const el = document.createElement('div');
  el.className = 'row';
  const l = document.createElement('span');
  l.className = 'label';
  l.textContent = label;
  const v = document.createElement('span');
  if (valueClass) v.className = valueClass;
  v.textContent = value;
  el.appendChild(l);
  el.appendChild(v);
  return el;
}

function render(matches) {
  els.matches.innerHTML = '';

  if (!matches.length) {
    els.matches.innerHTML =
      '<p class="empty">No upcoming padel matches.<br>Book one on Playtomic 🎾</p>';
    return;
  }

  const groups = { Today: [], Tomorrow: [], Upcoming: [] };
  for (const m of matches) groups[bucketFor(m.start)].push(m);

  for (const name of ['Today', 'Tomorrow', 'Upcoming']) {
    const list = groups[name];
    if (!list.length) continue;
    const h = document.createElement('h2');
    h.className = 'group-title';
    h.textContent = name;
    els.matches.appendChild(h);
    for (const m of list) els.matches.appendChild(matchCard(m));
  }
}

function showSetupNeeded() {
  els.matches.innerHTML =
    '<div class="empty">No calendar link set yet.<br>' +
    'Add your Google Calendar <strong>secret iCal address</strong> to ' +
    '<code>CALENDAR_ICS_URL</code>, then Refresh.</div>';
}

function showError(message) {
  els.matches.innerHTML =
    '<p class="error">Could not load matches.<br>' +
    (message || '') +
    '</p>';
}

// --- Data -----------------------------------------------------------------

async function load() {
  els.status.textContent = 'Loading…';
  els.matches.classList.add('loading');
  els.refresh.disabled = true;

  try {
    const res = await fetch('/api/matches', { cache: 'no-store' });

    if (res.status === 400) {
      els.status.textContent = '';
      showSetupNeeded();
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Server error');
    }

    const data = await res.json();
    render(data.matches);
    els.status.textContent = '';
    els.updated.textContent =
      'Updated ' + new Date(data.updatedAt).toLocaleTimeString();
  } catch (err) {
    els.status.textContent = '';
    showError(err.message);
  } finally {
    els.matches.classList.remove('loading');
    els.refresh.disabled = false;
  }
}

els.refresh.addEventListener('click', load);
load();

// Register the service worker so the app is installable to the Home Screen.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}
