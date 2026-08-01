/* =========================================================================
   C J Jewellery — bead assembly engine
   -------------------------------------------------------------------------
   Renders a strand of beads onto a canvas and threads them onto a cord as
   a scroll-driven progress value moves from 0 to 1.

   Beads are drawn as vector shapes (radial gradients + specular highlight +
   iridescent rim) rather than photographs. This is deliberate: no isolated
   photographs of individual beads exist, and inventing them from photos of
   finished pieces would misrepresent the product.

   A real bracelet is roughly 8 inches with around 150 small beads, so that
   is what the strand renders. At that count the beads must be blitted, not
   drawn: building three canvas gradients per bead per frame (450 gradient
   objects a frame) would stutter badly. Instead each bead type is painted
   once into an offscreen sprite and then stamped with drawImage.

   SWAPPING IN REAL BEAD PHOTOGRAPHS LATER
   ---------------------------------------
   The sprite approach is already the shape this needs. Load each photograph
   into an Image and put it in the SPRITES map in place of the generated
   canvas — drawBead() stamps whatever it finds there, so the threading
   motion, depth ordering and scroll control keep working untouched.
   ========================================================================= */

/* Deterministic PRNG so the composition is identical on every load. */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* The strand is a bracelet lying open on a surface: an ellipse with a small
   gap at the top where the clasp closes. This matches how the real pieces are
   photographed, and it gives 150 beads room to be seen — laid out as a
   shallow arc instead, they collapse into a hairline. */
function ringPoint(ring, t) {
  const a = ring.startA + t * ring.sweep;
  return { x: ring.cx + ring.rx * Math.cos(a), y: ring.cy + ring.ry * Math.sin(a) };
}

/* Tangent angle on the ellipse, for orienting disc beads. */
function ringAngle(ring, t) {
  const a = ring.startA + t * ring.sweep;
  return Math.atan2(ring.ry * Math.cos(a), -ring.rx * Math.sin(a));
}

/* Ramanujan's approximation — accurate enough to space beads evenly. */
function ellipsePerimeter(rx, ry) {
  return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
}

const BEAD_TYPES = [
  { kind: 'pearl', weight: 5 },
  { kind: 'blush', weight: 2 },
  { kind: 'powder', weight: 2 },
  { kind: 'gold', weight: 1 },
];

function pickKind(r) {
  const total = BEAD_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let n = r * total;
  for (const t of BEAD_TYPES) {
    n -= t.weight;
    if (n <= 0) return t.kind;
  }
  return 'pearl';
}

export function createAssembly(canvas, options = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const seed = options.seed ?? 11;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let beads = [];
  let count = 0;
  let progress = 0;
  let needsDraw = true;
  const scratchList = [];

  const CLASP_GAP = 0.3; // radians of open cord at the top, where it fastens

  function curve() {
    const rx = Math.min(width * 0.4, 340);
    const ry = Math.min(height * 0.4, rx * 0.7);
    return {
      cx: width / 2,
      cy: height / 2,
      rx,
      ry,
      // Start just past the top gap and sweep all the way round to it.
      startA: -Math.PI / 2 + CLASP_GAP / 2,
      sweep: Math.PI * 2 - CLASP_GAP,
    };
  }

  function build() {
    const rand = mulberry32(seed);
    // A real C J Jewellery bracelet is about 8 inches with roughly 150 small
    // beads, so the full strand is 150. Narrower screens step down only
    // because the beads would otherwise fall below a visible size.
    count = width < 620 ? 90 : width < 1000 ? 120 : 150;
    beads = [];

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      beads.push({
        t,
        kind: pickKind(rand()),
        // Scatter origin, expressed in normalised space so it survives resize.
        sx: rand(),
        sy: rand(),
        sz: 0.45 + rand() * 0.9, // depth: <1 further away, >1 nearer
        spin: (rand() - 0.5) * Math.PI * 2,
        wobble: rand() * Math.PI * 2,
        // Small beads on a strand are fairly uniform; heavy size jitter reads
        // as sloppiness rather than as handmade.
        radiusJitter: 0.93 + rand() * 0.14,
      });
    }

    // Threading order: the bead that ends furthest along the cord is
    // threaded on first, exactly as it works by hand.
    beads.sort((a, b) => b.t - a.t);
    beads.forEach((bead, index) => {
      bead.slot = index;
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    needsDraw = true;
    draw();
  }

  /* ---- bead painting ---------------------------------------------------- */

  function paletteFor(kind) {
    switch (kind) {
      case 'blush':
        return { core: '#f7dfe0', mid: '#e8b4b8', edge: '#c2848b' };
      case 'powder':
        return { core: '#e4eff5', mid: '#a9c4d4', edge: '#7196ab' };
      case 'gold':
        return { core: '#f2e3c6', mid: '#cfae74', edge: '#9c7940' };
      default:
        return { core: '#ffffff', mid: '#fbf3ea', edge: '#d9c6b6' };
    }
  }

  /* Offscreen sprites, painted once. SPRITE is the sprite canvas size and
     SPRITE_R the bead radius inside it — the margin leaves room for the
     baked-in contact shadow so it is never clipped. */
  const SPRITE = 128;
  const SPRITE_R = 44;
  const SPRITES = new Map();

  function buildSprite(kind) {
    const c = document.createElement('canvas');
    c.width = SPRITE;
    c.height = SPRITE;
    const g = c.getContext('2d');
    const pal = paletteFor(kind);
    const isDisc = kind !== 'pearl';
    const r = SPRITE_R;
    const cx = SPRITE / 2;
    const cy = SPRITE / 2;

    g.translate(cx, cy);

    g.shadowColor = 'rgba(58, 44, 38, 0.3)';
    g.shadowBlur = r * 0.5;
    g.shadowOffsetY = r * 0.16;

    const body = g.createRadialGradient(-r * 0.34, -r * 0.4, r * 0.06, 0, 0, r * 1.05);
    body.addColorStop(0, pal.core);
    body.addColorStop(0.45, pal.mid);
    body.addColorStop(1, pal.edge);
    g.fillStyle = body;
    g.beginPath();
    if (isDisc) g.ellipse(0, 0, r * 0.62, r, 0, 0, Math.PI * 2);
    else g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();

    g.shadowColor = 'transparent';
    g.shadowBlur = 0;
    g.shadowOffsetY = 0;

    // Iridescent rim — blush shading into powder blue, as light wraps a pearl.
    const rim = g.createLinearGradient(-r, -r, r, r);
    rim.addColorStop(0, 'rgba(232, 180, 184, 0)');
    rim.addColorStop(0.45, 'rgba(232, 180, 184, 0.55)');
    rim.addColorStop(0.72, 'rgba(169, 196, 212, 0.6)');
    rim.addColorStop(1, 'rgba(169, 196, 212, 0)');
    g.strokeStyle = rim;
    g.lineWidth = r * 0.16;
    g.beginPath();
    if (isDisc) g.ellipse(0, 0, r * 0.62, r, 0, 0, Math.PI * 2);
    else g.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    g.stroke();

    const spec = g.createRadialGradient(-r * 0.36, -r * 0.42, 0, -r * 0.36, -r * 0.42, r * 0.5);
    spec.addColorStop(0, 'rgba(255,255,255,0.95)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = spec;
    g.beginPath();
    g.ellipse(-r * 0.34, -r * 0.4, r * 0.4, r * 0.3, -0.5, 0, Math.PI * 2);
    g.fill();

    return c;
  }

  function spriteFor(kind) {
    let s = SPRITES.get(kind);
    if (!s) {
      s = buildSprite(kind);
      SPRITES.set(kind, s);
    }
    return s;
  }

  function drawBead(bead, x, y, r, angle, depth, alpha) {
    const sprite = spriteFor(bead.kind);
    const size = (r / SPRITE_R) * SPRITE;
    const half = size / 2;
    ctx.globalAlpha = alpha;
    if (bead.kind === 'pearl') {
      // A sphere looks the same at any rotation, so the common case skips the
      // transform stack entirely — with 150 beads a frame that matters.
      ctx.drawImage(sprite, x - half, y - half, size, size);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.drawImage(sprite, -half, -half, size, size);
      ctx.restore();
    }
  }

  function drawClasp(x, y, r, angle, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(176, 141, 87, 0.95)';
    ctx.lineWidth = Math.max(1, r * 0.28);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, Math.PI * 0.25, Math.PI * 1.75);
    ctx.stroke();
    ctx.restore();
  }

  /* ---- frame ------------------------------------------------------------ */

  function draw() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    const c = curve();
    const p = clamp01(progress);
    // Beads sit shoulder to shoulder around the ring, as they do on a real
    // strand. Radius follows the spacing between them, so the run stays
    // continuous at any count or screen size.
    const arc = ellipsePerimeter(c.rx, c.ry) * (c.sweep / (Math.PI * 2));
    const baseRadius = Math.max((arc / count) * 0.58, 2.6);

    // Cord: a fine line that brightens as beads settle onto it.
    ctx.save();
    ctx.strokeStyle = `rgba(176, 141, 87, ${0.18 + p * 0.3})`;
    ctx.lineWidth = Math.max(0.8, baseRadius * 0.16);
    ctx.beginPath();
    ctx.ellipse(c.cx, c.cy, c.rx, c.ry, 0, c.startA, c.startA + c.sweep);
    ctx.stroke();
    ctx.restore();

    // Each bead gets a stagger window. Windows overlap so beads queue along
    // the cord rather than arriving one fully-settled at a time.
    const windowSize = 0.55;
    const staggerSpan = 1 - windowSize;

    // Reused across frames: allocating 150 objects per frame during a scrub
    // creates enough garbage to show up as stutter.
    const drawList = scratchList;
    let n = 0;

    for (const bead of beads) {
      const start = (bead.slot / Math.max(1, count - 1)) * staggerSpan;
      const local = clamp01((p - start) / windowSize);

      // Phase A: fly from scatter to the open end of the cord.
      // Phase B: slide round the ring to the bead's final position.
      const flyEnd = 0.42;
      const entry = ringPoint(c, 0);

      let x;
      let y;
      let angle;
      let depth = 1;

      const driftX = c.cx + (bead.sx - 0.5) * width * 1.1;
      const driftY = c.cy + (bead.sy - 0.5) * height * 1.2;

      if (local <= 0) {
        // Still loose, waiting to be threaded.
        x = driftX;
        y = driftY;
        angle = bead.spin;
        depth = bead.sz;
      } else if (local < flyEnd) {
        const f = easeOutCubic(local / flyEnd);
        x = driftX + (entry.x - driftX) * f;
        y = driftY + (entry.y - driftY) * f;
        angle = bead.spin * (1 - f);
        depth = bead.sz + (1 - bead.sz) * f;
      } else {
        const f = easeInOutCubic((local - flyEnd) / (1 - flyEnd));
        const t = bead.t * f;
        const pt = ringPoint(c, t);
        x = pt.x;
        y = pt.y;
        angle = ringAngle(c, t);
        depth = 1;
      }

      // Settled beads breathe very slightly, so the finished strand never
      // looks like a frozen diagram.
      if (local >= 1) {
        const breathe = Math.sin(bead.wobble + p * 2.2) * baseRadius * 0.04;
        y += breathe;
      }

      const r = baseRadius * bead.radiusJitter * (0.72 + depth * 0.28);
      // Loose beads sit back quietly so the cloud reads as depth, not clutter;
      // they come up to full strength as each one is threaded on.
      const alpha = local <= 0 ? 0.16 + bead.sz * 0.2 : Math.min(1, 0.42 + local * 1.0);

      let slot = drawList[n];
      if (!slot) slot = drawList[n] = {};
      slot.bead = bead; slot.x = x; slot.y = y;
      slot.r = r; slot.angle = angle; slot.depth = depth; slot.alpha = alpha;
      n++;
    }

    // Painter's algorithm: distant beads first. Once everything is threaded
    // they all share depth 1, so the sort can be skipped entirely.
    const view = drawList.length === n ? drawList : drawList.slice(0, n);
    if (p < 1) view.sort((a, b) => a.depth - b.depth);
    for (let i = 0; i < n; i++) {
      const item = view[i];
      drawBead(item.bead, item.x, item.y, item.r, item.angle, item.depth, item.alpha);
    }
    ctx.globalAlpha = 1;

    // The clasp closes the gap at the top as the last bead settles.
    const claspAlpha = clamp01((p - 0.88) / 0.12);
    if (claspAlpha > 0) {
      const a0 = ringPoint(c, 0);
      const a1 = ringPoint(c, 1);
      const claspR = baseRadius * 2.4;
      drawClasp(a0.x, a0.y, claspR, ringAngle(c, 0), claspAlpha);
      drawClasp(a1.x, a1.y, claspR, ringAngle(c, 1) + Math.PI, claspAlpha);
    }

    needsDraw = false;
  }

  function setProgress(value) {
    const next = clamp01(value);
    if (Math.abs(next - progress) < 0.0005 && !needsDraw) return;
    progress = next;
    draw();
  }

  resize();

  return {
    resize,
    setProgress,
    getProgress: () => progress,
    destroy() {
      beads = [];
    },
  };
}

/* =========================================================================
   Small standalone bead renderer, used for the bespoke colour swatches so
   they match the strand rather than being flat CSS circles.
   ========================================================================= */
export function paintSwatch(canvas, kind) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = canvas.getBoundingClientRect().width || 40;
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;

  const palettes = {
    blush: { core: '#f7dfe0', mid: '#e8b4b8', edge: '#c2848b' },
    powder: { core: '#e4eff5', mid: '#a9c4d4', edge: '#7196ab' },
    cream: { core: '#ffffff', mid: '#faf3ea', edge: '#ddcbb9' },
    charcoal: { core: '#6d6560', mid: '#3a3430', edge: '#1d1a17' },
    gold: { core: '#f2e3c6', mid: '#cfae74', edge: '#9c7940' },
    rose: { core: '#f0cdd2', mid: '#c97f86', edge: '#96545c' },
    pearl: { core: '#ffffff', mid: '#fbf3ea', edge: '#d9c6b6' },
  };
  const pal = palettes[kind] || palettes.pearl;

  const body = ctx.createRadialGradient(cx - r * 0.34, cy - r * 0.4, r * 0.06, cx, cy, r * 1.05);
  body.addColorStop(0, pal.core);
  body.addColorStop(0.45, pal.mid);
  body.addColorStop(1, pal.edge);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  const rim = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  rim.addColorStop(0, 'rgba(232, 180, 184, 0)');
  rim.addColorStop(0.45, 'rgba(232, 180, 184, 0.5)');
  rim.addColorStop(0.72, 'rgba(169, 196, 212, 0.55)');
  rim.addColorStop(1, 'rgba(169, 196, 212, 0)');
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(0.6, r * 0.15);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  const spec = ctx.createRadialGradient(
    cx - r * 0.36,
    cy - r * 0.42,
    0,
    cx - r * 0.36,
    cy - r * 0.42,
    r * 0.5
  );
  spec.addColorStop(0, 'rgba(255,255,255,0.95)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.34, cy - r * 0.4, r * 0.38, r * 0.28, -0.5, 0, Math.PI * 2);
  ctx.fill();
}
