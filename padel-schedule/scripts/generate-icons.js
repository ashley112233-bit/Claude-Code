// Generates the PWA / Home Screen icons as real PNG files with no external
// dependencies. Draws a padel-green rounded tile with a white tennis-ball
// circle. Run with: npm run icons  (already committed, so rarely needed).

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'icons');

const GREEN = [10, 125, 60];
const BALL = [223, 245, 79]; // padel/tennis ball yellow-green
const WHITE = [255, 255, 255];

// Build an RGBA pixel buffer for one icon.
function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const ballR = size * 0.3;
  const corner = size * 0.22; // rounded-square radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Rounded-rectangle background (transparent outside the corners).
      const inRounded = insideRoundedRect(x, y, size, corner);
      let r = GREEN[0];
      let g = GREEN[1];
      let b = GREEN[2];
      let a = inRounded ? 255 : 0;

      // Ball in the middle.
      const d = Math.hypot(x - cx, y - cy);
      if (d < ballR) {
        r = BALL[0];
        g = BALL[1];
        b = BALL[2];
      }
      // The curved seam line across the ball.
      const seam = Math.abs(d - ballR * 0.62);
      if (d < ballR && seam < size * 0.012 && x > cx - ballR * 0.9) {
        r = WHITE[0];
        g = WHITE[1];
        b = WHITE[2];
      }

      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = a;
    }
  }
  return buf;
}

function insideRoundedRect(x, y, size, radius) {
  const min = radius;
  const max = size - radius;
  if (x >= min && x <= max) return true;
  if (y >= min && y <= max) return true;
  const cx = x < min ? min : max;
  const cy = y < min ? min : max;
  return Math.hypot(x - cx, y - cy) <= radius;
}

// --- Minimal PNG encoder --------------------------------------------------

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // compression, filter, interlace = 0

  // Add a filter byte (0 = none) at the start of each scanline.
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- Write files ----------------------------------------------------------

fs.mkdirSync(OUT, { recursive: true });
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };
for (const [name, size] of Object.entries(sizes)) {
  const png = encodePNG(size, draw(size));
  fs.writeFileSync(path.join(OUT, name), png);
  console.log('wrote', name, `(${size}x${size})`);
}
