/**
 * Pure, framework-free metric engine.
 * Every number shown on the site is computed here.
 * A ratio whose denominator is zero is mathematically undefined and is returned as `null`.
 */

export type Binary = { tp: number; fn: number; fp: number; tn: number };
export type Ratio = number | null;
export type Fraction = { num: number; den: number; value: Ratio };

export const REPORT_EXAMPLE: Binary = { tp: 36, fn: 9, fp: 11, tn: 44 };
export const MODEL_B: Binary = { tp: 40, fn: 5, fp: 15, tn: 40 };

export function ratio(num: number, den: number): Ratio {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  const v = num / den;
  return Number.isFinite(v) ? v : null;
}

const frac = (num: number, den: number): Fraction => ({ num, den, value: ratio(num, den) });

export type BinaryMetrics = {
  counts: Binary;
  total: number;
  correct: number;
  incorrect: number;
  actualPos: number;
  actualNeg: number;
  predPos: number;
  predNeg: number;
  accuracy: Ratio;
  errorRate: Ratio;
  precision: Ratio;
  recall: Ratio;
  f1: Ratio;
  specificity: Ratio;
  parts: {
    accuracy: Fraction;
    errorRate: Fraction;
    precision: Fraction;
    recall: Fraction;
    f1: Fraction;
    specificity: Fraction;
  };
};

/** Clamp any input to a non-negative whole number. */
export function sanitizeCount(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.floor(v);
}

export function computeBinary(c: Binary): BinaryMetrics {
  const tp = sanitizeCount(c.tp);
  const fn = sanitizeCount(c.fn);
  const fp = sanitizeCount(c.fp);
  const tn = sanitizeCount(c.tn);
  const total = tp + fn + fp + tn;
  const correct = tp + tn;
  const incorrect = fp + fn;
  const parts = {
    accuracy: frac(correct, total),
    errorRate: frac(incorrect, total),
    precision: frac(tp, tp + fp),
    recall: frac(tp, tp + fn),
    // F1 = 2TP / (2TP + FP + FN); undefined whenever precision or recall is undefined.
    f1: tp + fp === 0 || tp + fn === 0 ? { num: 2 * tp, den: 2 * tp + fp + fn, value: null } : frac(2 * tp, 2 * tp + fp + fn),
    specificity: frac(tn, tn + fp),
  };
  return {
    counts: { tp, fn, fp, tn },
    total,
    correct,
    incorrect,
    actualPos: tp + fn,
    actualNeg: fp + tn,
    predPos: tp + fp,
    predNeg: fn + tn,
    accuracy: parts.accuracy.value,
    errorRate: parts.errorRate.value,
    precision: parts.precision.value,
    recall: parts.recall.value,
    f1: parts.f1.value,
    specificity: parts.specificity.value,
    parts,
  };
}

/** Harmonic mean of precision and recall, 2PR/(P+R). */
export function f1FromPR(p: Ratio, r: Ratio): Ratio {
  if (p === null || r === null) return null;
  // P = R = 0 means TP = 0 with FP, FN > 0; the equivalent form 2TP/(2TP+FP+FN) is then exactly 0.
  if (p + r === 0) return 0;
  return ratio(2 * p * r, p + r);
}

/** scikit-learn layout with labels=[negative, positive]: [[TN, FP], [FN, TP]]. */
export function toSklearn(c: Binary): [[number, number], [number, number]] {
  return [
    [c.tn, c.fp],
    [c.fn, c.tp],
  ];
}

/** Report layout, positive row first: [[TP, FN], [FP, TN]]. */
export function toReportLayout(c: Binary): [[number, number], [number, number]] {
  return [
    [c.tp, c.fn],
    [c.fp, c.tn],
  ];
}

/* ------------------------------------------------------------------ labels */

export class LabelError extends Error {
  constructor(
    public code: "EMPTY" | "LENGTH_MISMATCH" | "POSITIVE_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "LabelError";
  }
}

/** Split free text on commas, whitespace or newlines. */
export function parseLabels(text: string): string[] {
  return text
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Distinct classes in order of first appearance across both sequences. */
export function detectClasses(actual: readonly string[], predicted: readonly string[]): string[] {
  const seen: string[] = [];
  for (const v of [...actual, ...predicted]) if (!seen.includes(v)) seen.push(v);
  return seen;
}

export function fromLabels(
  actual: readonly (string | number)[],
  predicted: readonly (string | number)[],
  positive: string | number,
): Binary & { sklearn: [[number, number], [number, number]] } {
  if (actual.length === 0 || predicted.length === 0) throw new LabelError("EMPTY", "Both label lists must contain at least one value.");
  if (actual.length !== predicted.length)
    throw new LabelError(
      "LENGTH_MISMATCH",
      `The lists have different lengths (${actual.length} actual, ${predicted.length} predicted). Each position must refer to the same observation.`,
    );
  const pos = String(positive);
  const a = actual.map(String);
  const p = predicted.map(String);
  if (!a.includes(pos) && !p.includes(pos)) throw new LabelError("POSITIVE_NOT_FOUND", `The positive class "${pos}" does not appear in either list.`);
  const c: Binary = { tp: 0, fn: 0, fp: 0, tn: 0 };
  for (let i = 0; i < a.length; i++) {
    const ap = a[i] === pos;
    const pp = p[i] === pos;
    if (ap && pp) c.tp++;
    else if (ap) c.fn++;
    else if (pp) c.fp++;
    else c.tn++;
  }
  return { ...c, sklearn: toSklearn(c) };
}

/** The report's own sequences (§6.2): 1 = positive (defective). */
export function reportSequences(): { actual: number[]; predicted: number[] } {
  const rep = (v: number, n: number) => Array.from({ length: n }, () => v);
  return {
    actual: [...rep(1, 45), ...rep(0, 55)],
    predicted: [...rep(1, 36), ...rep(0, 9), ...rep(1, 11), ...rep(0, 44)],
  };
}

/* --------------------------------------------------------------- threshold */

/** Predict positive iff score >= t. */
export function atThreshold(scores: readonly number[], labels: readonly (0 | 1)[], t: number): Binary {
  const c: Binary = { tp: 0, fn: 0, fp: 0, tn: 0 };
  for (let i = 0; i < scores.length; i++) {
    const pred = scores[i] >= t;
    if (labels[i] === 1) pred ? c.tp++ : c.fn++;
    else pred ? c.fp++ : c.tn++;
  }
  return c;
}

export type CurvePoint = { t: number; x: number; y: number };

function sweepThresholds(scores: readonly number[]): number[] {
  const uniq = Array.from(new Set(scores)).sort((a, b) => b - a);
  return [Infinity, ...uniq, -Infinity];
}

/** ROC: x = FPR, y = TPR, from strictest to loosest threshold. */
export function rocCurve(scores: readonly number[], labels: readonly (0 | 1)[]): { points: CurvePoint[]; auc: number } {
  const points = sweepThresholds(scores).map((t) => {
    const c = atThreshold(scores, labels, t);
    return { t, x: ratio(c.fp, c.fp + c.tn) ?? 0, y: ratio(c.tp, c.tp + c.fn) ?? 0 };
  });
  let auc = 0;
  for (let i = 1; i < points.length; i++) auc += ((points[i].x - points[i - 1].x) * (points[i].y + points[i - 1].y)) / 2;
  return { points, auc };
}

/** PR: x = recall, y = precision. Thresholds with no positive predictions are skipped (precision undefined). */
export function prCurve(scores: readonly number[], labels: readonly (0 | 1)[]): { points: CurvePoint[]; ap: number } {
  const points: CurvePoint[] = [];
  for (const t of sweepThresholds(scores)) {
    const c = atThreshold(scores, labels, t);
    const p = ratio(c.tp, c.tp + c.fp);
    const r = ratio(c.tp, c.tp + c.fn);
    if (p !== null && r !== null) points.push({ t, x: r, y: p });
  }
  // Average precision: sum over recall steps of precision at that step.
  let ap = 0;
  let prevR = 0;
  for (const pt of points) {
    ap += (pt.x - prevR) * pt.y;
    prevR = pt.x;
  }
  return { points, ap };
}

/* -------------------------------------------------------------- multiclass */

export type ClassStats = {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  support: number;
  precision: Ratio;
  recall: Ratio;
  f1: Ratio;
};

export type Averages = { precision: Ratio; recall: Ratio; f1: Ratio };

export type MulticlassMetrics = {
  k: number;
  total: number;
  correct: number;
  accuracy: Ratio;
  perClass: ClassStats[];
  macro: Averages;
  micro: Averages;
  weighted: Averages;
};

const mean = (xs: Ratio[]): Ratio => {
  if (xs.length === 0 || xs.some((x) => x === null)) return null;
  return (xs as number[]).reduce((a, b) => a + b, 0) / xs.length;
};

const weightedMean = (xs: Ratio[], w: number[]): Ratio => {
  const W = w.reduce((a, b) => a + b, 0);
  if (W === 0) return null;
  let s = 0;
  for (let i = 0; i < xs.length; i++) {
    if (w[i] === 0) continue; // classes with no support carry no weight
    if (xs[i] === null) return null;
    s += (xs[i] as number) * w[i];
  }
  return s / W;
};

/** Rows = actual class i, columns = predicted class j. */
export function computeMulticlass(matrix: readonly (readonly number[])[]): MulticlassMetrics {
  const k = matrix.length;
  const m = matrix.map((row) => row.map(sanitizeCount));
  const total = m.flat().reduce((a, b) => a + b, 0);
  const rowSum = m.map((r) => r.reduce((a, b) => a + b, 0));
  const colSum = Array.from({ length: k }, (_, j) => m.reduce((a, r) => a + (r[j] ?? 0), 0));
  const perClass: ClassStats[] = m.map((_, i) => {
    const tp = m[i][i] ?? 0;
    const fn = rowSum[i] - tp;
    const fp = colSum[i] - tp;
    const tn = total - tp - fn - fp;
    const precision = ratio(tp, tp + fp);
    const recall = ratio(tp, tp + fn);
    return { tp, fp, fn, tn, support: rowSum[i], precision, recall, f1: f1FromPR(precision, recall) };
  });
  const correct = perClass.reduce((a, c) => a + c.tp, 0);
  const sTP = correct;
  const sFP = perClass.reduce((a, c) => a + c.fp, 0);
  const sFN = perClass.reduce((a, c) => a + c.fn, 0);
  const microP = ratio(sTP, sTP + sFP);
  const microR = ratio(sTP, sTP + sFN);
  const support = perClass.map((c) => c.support);
  return {
    k,
    total,
    correct,
    accuracy: ratio(correct, total),
    perClass,
    macro: {
      precision: mean(perClass.map((c) => c.precision)),
      recall: mean(perClass.map((c) => c.recall)),
      f1: mean(perClass.map((c) => c.f1)),
    },
    micro: { precision: microP, recall: microR, f1: f1FromPR(microP, microR) },
    weighted: {
      precision: weightedMean(perClass.map((c) => c.precision), support),
      recall: weightedMean(perClass.map((c) => c.recall), support),
      f1: weightedMean(perClass.map((c) => c.f1), support),
    },
  };
}

/* ------------------------------------------------------------------ status */

export type Status = { label: string; tone: "good" | "neutral" | "warn"; detail: string };

export function statusFor(m: BinaryMetrics): Status {
  const { accuracy: a, precision: p, recall: r } = m;
  if (m.total === 0) return { label: "No observations yet", tone: "neutral", detail: "Enter at least one count to evaluate the model." };
  if (a === null || p === null || r === null || m.specificity === null)
    return { label: "Some metrics undefined", tone: "warn", detail: "At least one denominator is zero, so that ratio cannot be computed." };
  const minority = Math.min(m.actualPos, m.actualNeg) / m.total;
  if (minority < 0.3 && a >= 0.8 && r < 0.6)
    return { label: "High accuracy may hide poor recall", tone: "warn", detail: "The classes are imbalanced: the majority class inflates accuracy while many positives are missed." };
  if (r - p > 0.15) return { label: "Catches most positives, many false alarms", tone: "warn", detail: "Recall is well above precision: few misses, but many flagged items are actually negative." };
  if (p - r > 0.15) return { label: "Cautious: reliable alarms, misses positives", tone: "warn", detail: "Precision is well above recall: flagged items are usually right, but many positives slip through." };
  if (a >= 0.9 && p >= 0.9 && r >= 0.9) return { label: "Strong performance", tone: "good", detail: "Accuracy, precision and recall are all at least 90%." };
  if (a >= 0.7 && p >= 0.7 && r >= 0.7) return { label: "Balanced performance", tone: "good", detail: "Accuracy, precision and recall are all at least 70% and close to each other." };
  return { label: "Weak performance", tone: "warn", detail: "At least one of accuracy, precision or recall is below 70%." };
}
