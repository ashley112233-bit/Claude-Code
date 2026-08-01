/* Post-build step: make dist/index.html openable straight from the Finder.
 *
 * Vite writes <script type="module" crossorigin src="...">. Browsers block
 * module scripts loaded over file:// (they are fetched under CORS rules, and
 * file:// has no origin), so a double-clicked index.html would load the HTML
 * and CSS but never run the JavaScript — no opening sequence, no bead
 * threading, no working enquiry form.
 *
 * The bundle is already built as a classic IIFE (see vite.config.js), so it
 * only needs the module attributes removed to run as an ordinary script.
 * This changes nothing about how the site behaves on a real web host.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'dist', 'index.html');

if (!existsSync(indexPath)) {
  console.error('make-openable: dist/index.html not found — run the build first.');
  process.exit(1);
}

const original = readFileSync(indexPath, 'utf8');

const patched = original
  // <script type="module" crossorigin src="..."> -> <script defer src="...">
  //
  // `defer` is essential, not cosmetic. Vite puts the script in <head>, and a
  // module script is deferred implicitly. A plain classic script there would
  // execute before <body> exists, so every getElementById would return null
  // and nothing on the page would work.
  .replace(/<script\s+type="module"\s+crossorigin\s+src=/g, '<script defer src=')
  .replace(/<script\s+type="module"\s+src=/g, '<script defer src=')
  // modulepreload hints are meaningless for a classic script
  .replace(/\s*<link\s+rel="modulepreload"[^>]*>/g, '')
  // A `crossorigin` stylesheet is fetched under CORS rules, which file://
  // cannot satisfy — the page would load completely unstyled.
  .replace(/<link\s+rel="stylesheet"\s+crossorigin\s+href=/g, '<link rel="stylesheet" href=');

writeFileSync(indexPath, patched, 'utf8');

const problems = [];
if (/type="module"/.test(patched)) problems.push('a module script');
if (/<script(?![^>]*\bdefer\b)[^>]*\ssrc="\.\/assets\//.test(patched)) {
  problems.push('a non-deferred bundle script (it would run before <body> exists)');
}
if (/crossorigin/.test(patched.replace(/<link rel="preconnect"[^>]*>/g, ''))) {
  problems.push('a crossorigin asset');
}
if (problems.length) {
  console.error(`make-openable: WARNING — dist/index.html still contains ${problems.join(' and ')}.`);
  process.exitCode = 1;
} else {
  console.log('make-openable: dist/index.html can be opened directly in a browser.');
}
