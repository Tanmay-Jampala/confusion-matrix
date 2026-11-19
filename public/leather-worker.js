/*
 * Generates a seamless pebbled-leather tile off the main thread.
 * Tileable value noise (2 octaves) -> soft threshold into "pebbles" -> height map ->
 * normals -> Lambert lighting from the top-left -> multiplied into the base colour.
 * Message in:  { id, size, base: [r,g,b], freq, seed, depth }
 * Message out: { id, blob }  (PNG)
 */
self.onmessage = async (e) => {
  const { id, size, base, freq, seed, depth } = e.data;
  try {
    const blob = await make(size, base, freq, seed, depth);
    self.postMessage({ id, blob });
  } catch (err) {
    self.postMessage({ id, error: String(err) });
  }
};

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function lattice(n, seed) {
  const r = rng(seed);
  const g = new Float32Array(n * n);
  for (let i = 0; i < g.length; i++) g[i] = r();
  return g;
}

/** Tileable bicubic-smoothed value noise with period n cells over `size` pixels. */
function noiseLayer(size, n, seed) {
  const g = lattice(n, seed);
  const out = new Float32Array(size * size);
  const s = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    const fy = (y / size) * n;
    const y0 = Math.floor(fy) % n;
    const y1 = (y0 + 1) % n;
    const ty = s(fy - Math.floor(fy));
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * n;
      const x0 = Math.floor(fx) % n;
      const x1 = (x0 + 1) % n;
      const tx = s(fx - Math.floor(fx));
      const a = g[y0 * n + x0] + (g[y0 * n + x1] - g[y0 * n + x0]) * tx;
      const b = g[y1 * n + x0] + (g[y1 * n + x1] - g[y1 * n + x0]) * tx;
      out[y * size + x] = a + (b - a) * ty;
    }
  }
  return out;
}

/** Tileable Worley noise: returns F1 and F2 distances (in cell units) for every pixel. */
function worley(size, cells, seed) {
  const r = rng(seed);
  const px = new Float32Array(cells * cells);
  const py = new Float32Array(cells * cells);
  for (let i = 0; i < cells * cells; i++) {
    px[i] = 0.15 + r() * 0.7;
    py[i] = 0.15 + r() * 0.7;
  }
  const f1 = new Float32Array(size * size);
  const f2 = new Float32Array(size * size);
  const scale = cells / size;
  for (let y = 0; y < size; y++) {
    const gy = y * scale;
    const cy = Math.floor(gy);
    for (let x = 0; x < size; x++) {
      const gx = x * scale;
      const cx = Math.floor(gx);
      let d1 = 9, d2 = 9;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const nx = cx + ox, ny = cy + oy;
          const wx = ((nx % cells) + cells) % cells, wy = ((ny % cells) + cells) % cells;
          const k = wy * cells + wx;
          const dx = nx + px[k] - gx, dy = ny + py[k] - gy;
          const d = dx * dx + dy * dy;
          if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
        }
      }
      f1[y * size + x] = Math.sqrt(d1);
      f2[y * size + x] = Math.sqrt(d2);
    }
  }
  return { f1, f2 };
}

async function make(size, base, freq, seed, depth) {
  // pebbles: raised cells separated by narrow grooves (F2 - F1 is small near cell borders)
  const cells = Math.max(6, Math.round(size * freq * 0.62));
  const { f1, f2 } = worley(size, cells, seed);
  const fine = noiseLayer(size, cells * 3, seed + 7);
  const h = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) {
    const edge = Math.min(1, (f2[i] - f1[i]) / 0.32);
    const dome = 1 - Math.min(1, f1[i] / 0.85);
    h[i] = Math.pow(edge, 0.55) * (0.65 + 0.35 * dome) + (fine[i] - 0.5) * 0.06;
  }
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const lx = -0.55, ly = -0.55, lz = 0.63; // light from top-left
  const k = 2.6;
  for (let y = 0; y < size; y++) {
    const ym = ((y - 1 + size) % size) * size;
    const yp = ((y + 1) % size) * size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const dx = (h[y * size + xp] - h[y * size + xm]) * k;
      const dy = (h[yp + x] - h[ym + x]) * k;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const lambert = Math.max(0, (-dx * lx - dy * ly + lz) * inv);
      // grooves slightly darker; centred so the average stays the base colour
      const shade = 1 - depth * 0.72 + depth * lambert * 1.05 - (1 - h[i0(x, y, size)]) * depth * 0.18;
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, base[0] * shade);
      img.data[i + 1] = Math.min(255, base[1] * shade);
      img.data[i + 2] = Math.min(255, base[2] * shade);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

function i0(x, y, size) {
  return y * size + x;
}
