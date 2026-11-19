/**
 * Deterministic, seeded model scores for the Threshold tab.
 * 45 positives + 55 negatives, built so that at t = 0.50 (predict positive iff score >= t)
 * the confusion matrix is exactly TP 36, FN 9, FP 11, TN 44 — the report's example.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round3 = (x: number) => Math.round(x * 1000) / 1000;

/** n draws in [lo, hi]; `shape` < 1 skews toward hi, > 1 skews toward lo. */
function band(rand: () => number, n: number, lo: number, hi: number, shape: number): number[] {
  return Array.from({ length: n }, () => round3(lo + (hi - lo) * Math.pow(rand(), shape)));
}

export type ScoredSet = { scores: number[]; labels: (0 | 1)[] };

export function seededScores(seed = 2026): ScoredSet {
  const rand = mulberry32(seed);
  const items: { s: number; y: 0 | 1 }[] = [
    // actual positives: 36 above the line (TP), 9 below it (FN)
    ...band(rand, 36, 0.5, 0.98, 0.6).map((s) => ({ s, y: 1 as const })),
    ...band(rand, 9, 0.12, 0.495, 0.55).map((s) => ({ s, y: 1 as const })),
    // actual negatives: 11 above the line (FP), 44 below it (TN)
    ...band(rand, 11, 0.5, 0.86, 1.7).map((s) => ({ s, y: 0 as const })),
    ...band(rand, 44, 0.02, 0.495, 1.25).map((s) => ({ s, y: 0 as const })),
  ];
  // deterministic Fisher–Yates shuffle so the classes interleave
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return { scores: items.map((d) => d.s), labels: items.map((d) => d.y) };
}

export const DEFAULT_THRESHOLD = 0.5;
