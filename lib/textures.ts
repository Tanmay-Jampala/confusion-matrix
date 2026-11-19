"use client";
/**
 * All textures are generated in the browser (no image files):
 *  - film grain: random noise tile
 *  - pebbled leather: SVG feTurbulence + feDiffuseLighting, rasterised once to a canvas tile
 * Each tile is exposed as a CSS custom property holding a blob: URL.
 */

let done: Promise<void> | null = null;

function grainTile(size = 160): Promise<string> {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return Promise.resolve("");
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return toUrl(c);
}

function leatherSvg(size: number, base: string, light: string, freq: number, seed: number, depth: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <filter id="l" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" stitchTiles="stitch" result="n"/>
    <feComponentTransfer in="n" result="b">
      <feFuncA type="table" tableValues="0 0 .35 .9 1 1"/>
    </feComponentTransfer>
    <feGaussianBlur in="b" stdDeviation=".6" result="bb"/>
    <feDiffuseLighting in="bb" surfaceScale="2.2" diffuseConstant="1.05" lighting-color="${light}" result="lit">
      <feDistantLight azimuth="225" elevation="48"/>
    </feDiffuseLighting>
    <feFlood flood-color="${base}" result="base"/>
    <feComposite in="lit" in2="base" operator="arithmetic" k1="${depth}" k2="0" k3="${1 - depth * 0.75}" k4="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#l)"/>
</svg>`;
}

function svgToTile(svg: string, size: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve("");
      ctx.drawImage(img, 0, 0, size, size);
      toUrl(c).then(resolve);
    };
    img.onerror = () => resolve("");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

function toUrl(c: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    if (!c.toBlob) return resolve(c.toDataURL());
    c.toBlob((b) => resolve(b ? URL.createObjectURL(b) : ""), "image/png");
  });
}

/** Leather via a Web Worker + OffscreenCanvas (no main-thread rasterisation). Falls back to the SVG filter path. */
type LeatherSpec = { size: number; base: [number, number, number]; hex: string; freq: number; seed: number; depth: number };
let worker: Worker | null | undefined;
function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" ? new Worker("/leather-worker.js") : null;
  } catch {
    worker = null;
  }
  return worker;
}
let nextId = 0;
function leatherTile(spec: LeatherSpec): Promise<string> {
  const w = getWorker();
  const fallback = () => svgToTile(leatherSvg(spec.size, spec.hex, "#ffffff", spec.freq * 0.9, spec.seed, spec.depth), spec.size);
  if (!w) return fallback();
  const id = ++nextId;
  return new Promise((resolve) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.id !== id) return;
      w.removeEventListener("message", onMsg);
      if (e.data.blob) resolve(URL.createObjectURL(e.data.blob));
      else fallback().then(resolve);
    };
    w.addEventListener("message", onMsg);
    w.postMessage({ id, size: spec.size, base: spec.base, freq: spec.freq, seed: spec.seed, depth: spec.depth });
  });
}

export function generateTextures(onStep?: () => void): Promise<void> {
  if (done) return done;
  const root = document.documentElement.style;
  const set = (name: string) => (url: string) => {
    if (url) root.setProperty(name, `url("${url}")`);
    onStep?.();
  };
  done = Promise.all([
    grainTile().then(set("--tex-grain")),
    leatherTile({ size: 512, base: [211, 200, 186], hex: "#d3c8ba", freq: 0.11, seed: 7, depth: 0.22 }).then(set("--tex-leather")),
    leatherTile({ size: 360, base: [108, 74, 162], hex: "#6c4aa2", freq: 0.12, seed: 11, depth: 0.5 }).then(set("--tex-leather-purple")),
  ]).then(() => undefined);
  return done;
}

export const TEXTURE_STEPS = 3;
