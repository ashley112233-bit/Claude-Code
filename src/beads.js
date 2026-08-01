/* =========================================================================
   C J Jewellery — bead assembly engine
   -------------------------------------------------------------------------
   Renders a strand of beads onto a canvas and threads them onto a cord as
   a scroll-driven progress value moves from 0 to 1.

   Beads are drawn as vector shapes (radial gradients + specular highlight +
   iridescent rim) rather than photographs. This is deliberate: no isolated
   photographs of individual beads exist, and inventing them from photos of
   finished pieces would misrepresent the product.

   SWAPPING IN REAL BEAD PHOTOGRAPHS LATER
   ---------------------------------------
   Each bead already carries everything a photo needs: position, radius and
   rotation. To use real cut-outs, load them once into an array of Image
   objects and replace the body of drawBead() with a drawImage() call:

       ctx.drawImage(img, -r, -r, r * 2, r * 2);

   inside the existing translate/rotate transform. Nothing else has to
   change — the threading motion, depth ordering and scrub all keep working.
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

/* Point on a cubic bezier. */
function bezierPoint(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/* Tangent angle on a cubic bezier, for orienting disc beads. */
function bezierAngle(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  const dx =
    3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy =
    3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return Math.atan2(dy, dx);
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

  function curve() {
    const cx = width / 2;
    const cy = height * 0.5;
    const span = Math.min(width * (width < 620 ? 0.88 : 0.76), 820);
    const sag = Math.min(height * 0.2, 150);
    return {
      p0: { x: cx - span / 2, y: cy - sag * 0.4 },
      p1: { x: cx - span / 4, y: cy + sag },
      p2: { x: cx + span / 4, y: cy + sag },
      p3: { x: cx + span / 2, y: cy - sag * 0.4 },
    };
  }

  function build() {
    const rand = mulberry32(seed);
    // Bead count is driven by how many can sit at a readable size across the
    // strand, not by a fixed number — on a phone that means far fewer beads.
    count = width < 620 ? 14 : width < 1000 ? 24 : 34;
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
        radiusJitter: 0.86 + rand() * 0.3,
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

  function drawBead(bead, x, y, r, angle, depth, alpha) {
    const pal = paletteFor(bead.kind);
    const isDisc = bead.kind !== 'pearl';

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Soft contact shadow grounds the bead against the cord.
    ctx.shadowColor = 'rgba(58, 44, 38, 0.28)';
    ctx.shadowBlur = r * 0.9 * depth;
    ctx.shadowOffsetY = r * 0.22;

    const body = ctx.createRadialGradient(
      -r * 0.34,
      -r * 0.4,
      r * 0.06,
      0,
      0,
      r * 1.05
    );
    body.addColorStop(0, pal.core);
    body.addColorStop(0.45, pal.mid);
    body.addColorStop(1, pal.edge);
    ctx.fillStyle = body;

    ctx.beginPath();
    if (isDisc) {
      // Flat heishi-style disc, seen slightly on edge.
      const rx = r * 0.62;
      ctx.ellipse(0, 0, rx, r, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Iridescent rim — the optical signature. A thin arc of blush shading
    // into powder blue along the lower-right edge, as light wraps a pearl.
    const rim = ctx.createLinearGradient(-r, -r, r, r);
    rim.addColorStop(0, 'rgba(232, 180, 184, 0)');
    rim.addColorStop(0.45, 'rgba(232, 180, 184, 0.55)');
    rim.addColorStop(0.72, 'rgba(169, 196, 212, 0.6)');
    rim.addColorStop(1, 'rgba(169, 196, 212, 0)');
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(0.6, r * 0.16);
    ctx.beginPath();
    if (isDisc) {
      ctx.ellipse(0, 0, r * 0.62, r, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    }
    ctx.stroke();

    // Specular highlight.
    ctx.globalAlpha = alpha * 0.9;
    const spec = ctx.createRadialGradient(
      -r * 0.36,
      -r * 0.42,
      0,
      -r * 0.36,
      -r * 0.42,
      r * 0.5
    );
    spec.addColorStop(0, 'rgba(255,255,255,0.95)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.ellipse(-r * 0.34, -r * 0.4, r * 0.4, r * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
    // Beads are sized off the strand span rather than raw viewport width, so
    // they stay physically legible on a phone instead of shrinking to dots.
    // Sized so neighbouring beads just overlap along the curve — a strung
    // bracelet reads as a continuous run, not a row of separated dots.
    const span = Math.abs(c.p3.x - c.p0.x);
    const baseRadius = Math.min(Math.max(span / count / 1.45, 10), 24);

    // Cord: a fine luminous line that brightens as beads settle onto it.
    ctx.save();
    const cordAlpha = 0.16 + p * 0.34;
    const cord = ctx.createLinearGradient(c.p0.x, c.p0.y, c.p3.x, c.p3.y);
    cord.addColorStop(0, `rgba(176, 141, 87, 0)`);
    cord.addColorStop(0.15, `rgba(176, 141, 87, ${cordAlpha})`);
    cord.addColorStop(0.85, `rgba(176, 141, 87, ${cordAlpha})`);
    cord.addColorStop(1, `rgba(176, 141, 87, 0)`);
    ctx.strokeStyle = cord;
    ctx.lineWidth = Math.max(1, baseRadius * 0.09);
    ctx.beginPath();
    ctx.moveTo(c.p0.x, c.p0.y);
    ctx.bezierCurveTo(c.p1.x, c.p1.y, c.p2.x, c.p2.y, c.p3.x, c.p3.y);
    ctx.stroke();
    ctx.restore();

    // Each bead gets a stagger window. Windows overlap so beads queue along
    // the cord rather than arriving one fully-settled at a time.
    const windowSize = 0.55;
    const staggerSpan = 1 - windowSize;

    const drawList = [];

    for (const bead of beads) {
      const start = (bead.slot / Math.max(1, count - 1)) * staggerSpan;
      const local = clamp01((p - start) / windowSize);

      // Phase A: fly from scatter to the threading end of the cord.
      // Phase B: slide along the cord to the bead's final position.
      const flyEnd = 0.42;
      const entry = bezierPoint(0, c.p0, c.p1, c.p2, c.p3);

      let x;
      let y;
      let angle;
      let depth = 1;

      if (local <= 0) {
        // Still scattered, waiting to be threaded.
        const driftX = c.p0.x + (bead.sx - 0.5) * width * 1.05;
        const driftY = c.p0.y + (bead.sy - 0.5) * height * 1.15;
        x = driftX;
        y = driftY;
        angle = bead.spin;
        depth = bead.sz;
      } else if (local < flyEnd) {
        const f = easeOutCubic(local / flyEnd);
        const driftX = c.p0.x + (bead.sx - 0.5) * width * 1.05;
        const driftY = c.p0.y + (bead.sy - 0.5) * height * 1.15;
        x = driftX + (entry.x - driftX) * f;
        y = driftY + (entry.y - driftY) * f;
        angle = bead.spin * (1 - f);
        depth = bead.sz + (1 - bead.sz) * f;
      } else {
        const f = easeInOutCubic((local - flyEnd) / (1 - flyEnd));
        const t = bead.t * f;
        const pt = bezierPoint(t, c.p0, c.p1, c.p2, c.p3);
        x = pt.x;
        y = pt.y;
        angle = bezierAngle(t, c.p0, c.p1, c.p2, c.p3);
        depth = 1;
      }

      // Settled beads breathe very slightly, so the finished strand never
      // looks like a frozen diagram.
      if (local >= 1) {
        const breathe = Math.sin(bead.wobble + p * 2.2) * baseRadius * 0.04;
        y += breathe;
      }

      const r = baseRadius * bead.radiusJitter * (0.72 + depth * 0.28);
      const alpha = local <= 0 ? 0.32 + bead.sz * 0.25 : Math.min(1, 0.5 + local * 0.9);

      drawList.push({ bead, x, y, r, angle, depth, alpha });
    }

    // Painter's algorithm: distant beads first.
    drawList.sort((a, b) => a.depth - b.depth);
    for (const item of drawList) {
      drawBead(item.bead, item.x, item.y, item.r, item.angle, item.depth, item.alpha);
    }

    // Clasps fasten as the last bead settles, completing the piece.
    const claspAlpha = clamp01((p - 0.88) / 0.12);
    if (claspAlpha > 0) {
      const a0 = bezierPoint(0, c.p0, c.p1, c.p2, c.p3);
      const a1 = bezierPoint(1, c.p0, c.p1, c.p2, c.p3);
      drawClasp(a0.x, a0.y, baseRadius, bezierAngle(0, c.p0, c.p1, c.p2, c.p3), claspAlpha);
      drawClasp(a1.x, a1.y, baseRadius, bezierAngle(1, c.p0, c.p1, c.p2, c.p3) + Math.PI, claspAlpha);
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
