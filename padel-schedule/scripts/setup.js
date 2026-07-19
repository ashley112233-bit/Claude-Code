// Padel Schedule — friendly local setup helper.
// Creates your .env from the example if it doesn't exist yet, then tells you
// exactly what to do next. Run with:  npm run setup

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('\n✅ .env already exists — nothing to create.');
} else {
  fs.copyFileSync(examplePath, envPath);
  console.log('\n✅ Created .env');
}

console.log(
  '\nNext:\n' +
    '  1. Open .env and paste your Google Calendar "secret iCal address"\n' +
    '     into CALENDAR_ICS_URL.\n' +
    '     (Google Calendar -> Settings -> your calendar -> Integrate calendar\n' +
    '      -> "Secret address in iCal format".)\n' +
    '  2. Run:  npm start\n' +
    '  3. Open http://localhost:3000\n'
);
