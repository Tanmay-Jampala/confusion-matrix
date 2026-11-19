import { describe, expect, it } from "vitest";
import {
  atThreshold,
  computeBinary,
  computeMulticlass,
  f1FromPR,
  fromLabels,
  LabelError,
  parseLabels,
  prCurve,
  reportSequences,
  rocCurve,
  statusFor,
  toSklearn,
} from "../lib/metrics";
import { seededScores } from "../lib/seededScores";
import { pct } from "../lib/format";

const close = (a: number | null, b: number, eps = 1e-4) => {
  expect(a).not.toBeNull();
  expect(Math.abs((a as number) - b)).toBeLessThanOrEqual(eps);
};

describe("computeBinary", () => {
  it("reproduces the report example 36/9/11/44", () => {
    const m = computeBinary({ tp: 36, fn: 9, fp: 11, tn: 44 });
    close(m.accuracy, 0.8, 1e-12);
    close(m.errorRate, 0.2, 1e-12);
    close(m.precision, 0.766);
    close(m.recall, 0.8, 1e-12);
    close(m.f1, 0.7826);
    close(m.specificity, 0.8, 1e-12);
    expect(m.total).toBe(100);
    expect(m.predPos).toBe(47);
    expect(m.predNeg).toBe(53);
    expect(m.actualPos).toBe(45);
    expect(m.actualNeg).toBe(55);
    expect(m.parts.f1).toMatchObject({ num: 72, den: 92 });
  });

  it("reproduces Model B 40/5/15/40", () => {
    const m = computeBinary({ tp: 40, fn: 5, fp: 15, tn: 40 });
    close(m.accuracy, 0.8, 1e-12);
    close(m.precision, 0.7273);
    close(m.recall, 0.8889);
    // The report (§5.12, §7.3) prints 80.81%, but 2TP/(2TP+FP+FN) = 80/100 = 0.80 exactly,
    // and 2PR/(P+R) with P = 40/55, R = 40/45 also gives 0.80. The site shows the computed value.
    close(m.f1, 0.8, 1e-12);
    expect(m.parts.f1).toMatchObject({ num: 80, den: 100 });
    close(m.specificity, 0.7273);
  });

  it("F1 from 2PR/(P+R) equals 2TP/(2TP+FP+FN)", () => {
    for (const c of [
      { tp: 36, fn: 9, fp: 11, tn: 44 },
      { tp: 40, fn: 5, fp: 15, tn: 40 },
      { tp: 1, fn: 7, fp: 3, tn: 0 },
      { tp: 999, fn: 2, fp: 13, tn: 5 },
    ]) {
      const m = computeBinary(c);
      close(f1FromPR(m.precision, m.recall), m.f1 as number, 1e-12);
    }
  });

  it("returns null (never NaN) for zero denominators", () => {
    const empty = computeBinary({ tp: 0, fn: 0, fp: 0, tn: 0 });
    for (const k of ["accuracy", "errorRate", "precision", "recall", "f1", "specificity"] as const) {
      expect(empty[k]).toBeNull();
    }
    const noPredPos = computeBinary({ tp: 0, fn: 5, fp: 0, tn: 5 });
    expect(noPredPos.precision).toBeNull();
    expect(noPredPos.f1).toBeNull();
    expect(noPredPos.recall).toBe(0);
    const noNeg = computeBinary({ tp: 5, fn: 0, fp: 0, tn: 0 });
    expect(noNeg.specificity).toBeNull();
    expect(pct(noNeg.specificity)).toBe("undefined");
  });

  it("sanitizes bad input to whole numbers >= 0", () => {
    const m = computeBinary({ tp: -3, fn: 2.7, fp: Number.NaN, tn: Infinity });
    expect(m.counts).toEqual({ tp: 0, fn: 2, fp: 0, tn: 0 });
  });
});

describe("fromLabels", () => {
  it("rebuilds 36/9/11/44 from the report's sequences", () => {
    const { actual, predicted } = reportSequences();
    const r = fromLabels(actual, predicted, 1);
    expect({ tp: r.tp, fn: r.fn, fp: r.fp, tn: r.tn }).toEqual({ tp: 36, fn: 9, fp: 11, tn: 44 });
    expect(r.sklearn).toEqual([
      [44, 11],
      [9, 36],
    ]);
  });

  it("works with class names and text input", () => {
    const a = parseLabels("spam, ham ham\nspam");
    const p = parseLabels("spam spam ham ham");
    expect(fromLabels(a, p, "spam")).toMatchObject({ tp: 1, fp: 1, fn: 1, tn: 1 });
  });

  it("validates input", () => {
    expect(() => fromLabels([], [], 1)).toThrow(LabelError);
    expect(() => fromLabels([1, 0], [1], 1)).toThrow(/different lengths/);
    expect(() => fromLabels(["a"], ["b"], "c")).toThrow(/does not appear/);
  });

  it("toSklearn uses [[TN, FP], [FN, TP]]", () => {
    expect(toSklearn({ tp: 1, fn: 2, fp: 3, tn: 4 })).toEqual([
      [4, 3],
      [2, 1],
    ]);
  });
});

describe("threshold", () => {
  const { scores, labels } = seededScores();

  it("is deterministic and has 45 positives / 55 negatives", () => {
    expect(seededScores()).toEqual(seededScores());
    expect(labels.filter((y) => y === 1)).toHaveLength(45);
    expect(labels.filter((y) => y === 0)).toHaveLength(55);
    expect(scores.every((s) => s >= 0 && s <= 1)).toBe(true);
  });

  it("gives exactly 36/9/11/44 at t = 0.5", () => {
    expect(atThreshold(scores, labels, 0.5)).toEqual({ tp: 36, fn: 9, fp: 11, tn: 44 });
  });

  it("extremes: t=0 predicts all positive, t>1 none", () => {
    expect(atThreshold(scores, labels, 0)).toEqual({ tp: 45, fn: 0, fp: 55, tn: 0 });
    expect(atThreshold(scores, labels, 1.01)).toEqual({ tp: 0, fn: 45, fp: 0, tn: 55 });
  });

  it("ROC runs from (0,0) to (1,1) with AUC in (0.5, 1]", () => {
    const { points, auc } = rocCurve(scores, labels);
    expect(points[0]).toMatchObject({ x: 0, y: 0 });
    expect(points.at(-1)).toMatchObject({ x: 1, y: 1 });
    expect(auc).toBeGreaterThan(0.5);
    expect(auc).toBeLessThanOrEqual(1);
  });

  it("PR curve contains the 0.5 operating point", () => {
    const { points } = prCurve(scores, labels);
    expect(points.some((p) => Math.abs(p.x - 0.8) < 1e-9 && Math.abs(p.y - 36 / 47) < 1e-9)).toBe(true);
  });
});

describe("computeMulticlass", () => {
  const m = [
    [30, 4, 2],
    [6, 25, 2],
    [1, 5, 25],
  ];
  const r = computeMulticlass(m);

  it("micro F1 equals accuracy for single-label multiclass", () => {
    close(r.micro.f1, r.accuracy as number, 1e-12);
    close(r.micro.precision, r.accuracy as number, 1e-12);
    close(r.accuracy, 0.8, 1e-12);
  });

  it("macro is the unweighted mean of per-class scores", () => {
    const mean = r.perClass.reduce((a, c) => a + (c.f1 as number), 0) / 3;
    close(r.macro.f1, mean, 1e-12);
  });

  it("weighted uses class support", () => {
    const w = r.perClass.reduce((a, c) => a + (c.recall as number) * c.support, 0) / r.total;
    close(r.weighted.recall, w, 1e-12);
    // weighted recall equals accuracy by construction
    close(r.weighted.recall, r.accuracy as number, 1e-12);
  });

  it("one-vs-rest counts add up", () => {
    for (const c of r.perClass) expect(c.tp + c.fp + c.fn + c.tn).toBe(100);
    expect(r.perClass[0]).toMatchObject({ tp: 30, fn: 6, fp: 7, support: 36 });
    // the default is chosen so per-class precision and recall differ, making macro and weighted averages differ
    expect(r.macro.f1).not.toBeCloseTo(r.weighted.f1 as number, 6);
  });

  it("k = 2 agrees with computeBinary (positive class first)", () => {
    const b = computeBinary({ tp: 36, fn: 9, fp: 11, tn: 44 });
    const mc = computeMulticlass([
      [36, 9],
      [11, 44],
    ]);
    close(mc.perClass[0].precision, b.precision as number, 1e-12);
    close(mc.perClass[0].recall, b.recall as number, 1e-12);
    close(mc.perClass[0].f1, b.f1 as number, 1e-12);
  });
});

describe("statusFor", () => {
  it("labels the report example as balanced", () => {
    expect(statusFor(computeBinary({ tp: 36, fn: 9, fp: 11, tn: 44 })).label).toBe("Balanced performance");
  });
  it("warns when imbalance hides poor recall", () => {
    expect(statusFor(computeBinary({ tp: 3, fn: 7, fp: 2, tn: 88 })).label).toBe("High accuracy may hide poor recall");
  });
  it("handles empty and undefined cases", () => {
    expect(statusFor(computeBinary({ tp: 0, fn: 0, fp: 0, tn: 0 })).label).toBe("No observations yet");
    expect(statusFor(computeBinary({ tp: 0, fn: 5, fp: 0, tn: 5 })).label).toBe("Some metrics undefined");
  });
});

describe("format", () => {
  it("formats to 2 decimals", () => {
    expect(pct(36 / 47)).toBe("76.60%");
    expect(pct(0.8)).toBe("80.00%");
    expect(pct(null)).toBe("undefined");
  });
});
