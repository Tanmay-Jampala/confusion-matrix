import type { BinaryMetrics, Fraction } from "./metrics";
import { dec, pct } from "./format";

export type DKey = "accuracy" | "errorRate" | "precision" | "recall" | "f1" | "specificity";

export const D_LABEL: Record<DKey, string> = {
  accuracy: "Accuracy",
  errorRate: "Error rate",
  precision: "Precision",
  recall: "Recall (Sensitivity)",
  f1: "F1-Score",
  specificity: "Specificity",
};

const pctTex = (v: number | null) => pct(v).replace("%", String.raw`\%`);

/** Stat line, e.g. "(36 + 44) / 100 = 80.00%" */
export function readout(key: DKey, m: BinaryMetrics): string {
  const { tp, fn, fp, tn } = m.counts;
  const v = m.parts[key];
  const r = pct(v.value);
  switch (key) {
    case "accuracy":
      return `(${tp} + ${tn}) / ${m.total} = ${r}`;
    case "errorRate":
      return `(${fp} + ${fn}) / ${m.total} = ${r}`;
    case "precision":
      return `${tp} / (${tp} + ${fp}) = ${r}`;
    case "recall":
      return `${tp} / (${tp} + ${fn}) = ${r}`;
    case "specificity":
      return `${tn} / (${tn} + ${fp}) = ${r}`;
    case "f1":
      return `2·${tp} / (2·${tp} + ${fp} + ${fn}) = ${r}`;
  }
}

/** Compact "num / den" for mono stat lines. */
export const fracLine = (f: Fraction) => `${f.num} / ${f.den}`;

/** Line-by-line KaTeX derivation using the current counts. */
export function derivation(key: DKey, m: BinaryMetrics): string[] {
  const { tp, fn, fp, tn } = m.counts;
  const f = m.parts[key];
  const end = (name: string): string[] =>
    f.value === null
      ? [String.raw`${name}=\dfrac{${f.num}}{0}\;\Rightarrow\;\text{undefined}`]
      : [String.raw`${name}=\dfrac{${f.num}}{${f.den}}`, String.raw`${name}\approx ${dec(f.value)} = ${pctTex(f.value)}`];
  switch (key) {
    case "accuracy":
      return [
        String.raw`\text{Accuracy}=\dfrac{TP+TN}{TP+TN+FP+FN}`,
        String.raw`=\dfrac{${tp}+${tn}}{${tp}+${tn}+${fp}+${fn}}`,
        ...end(""),
      ];
    case "errorRate":
      return [
        String.raw`\text{Error rate}=\dfrac{FP+FN}{\text{Total}}`,
        String.raw`=\dfrac{${fp}+${fn}}{${m.total}}`,
        ...end("").map((l) => l),
        ...(m.accuracy !== null ? [String.raw`\text{Check: Accuracy}+\text{Error rate}=${pctTex(m.accuracy)}+${pctTex(m.errorRate)}=100\%`] : []),
      ];
    case "precision":
      return [String.raw`\text{Precision}=\dfrac{TP}{TP+FP}`, String.raw`=\dfrac{${tp}}{${tp}+${fp}}`, ...end("")];
    case "recall":
      return [String.raw`\text{Recall}=\dfrac{TP}{TP+FN}`, String.raw`=\dfrac{${tp}}{${tp}+${fn}}`, ...end("")];
    case "specificity":
      return [String.raw`\text{Specificity}=\dfrac{TN}{TN+FP}`, String.raw`=\dfrac{${tn}}{${tn}+${fp}}`, ...end("")];
    case "f1": {
      const P = m.precision;
      const R = m.recall;
      if (P === null || R === null)
        return [
          String.raw`F_1=\dfrac{2\,P\,R}{P+R}`,
          String.raw`P=${P === null ? String.raw`\text{undefined}` : dec(P)},\quad R=${R === null ? String.raw`\text{undefined}` : dec(R)}`,
          String.raw`\Rightarrow F_1\ \text{is undefined}`,
        ];
      return [
        String.raw`F_1=\dfrac{2\,P\,R}{P+R}`,
        String.raw`P=\tfrac{${tp}}{${tp + fp}}\approx ${dec(P)},\quad R=\tfrac{${tp}}{${tp + fn}}\approx ${dec(R)}`,
        String.raw`F_1=\dfrac{2\times ${dec(P)}\times ${dec(R)}}{${dec(P)}+${dec(R)}}`,
        String.raw`\text{Equivalently } F_1=\dfrac{2TP}{2TP+FP+FN}=\dfrac{${2 * tp}}{${2 * tp}+${fp}+${fn}}=\dfrac{${f.num}}{${f.den}}`,
        String.raw`F_1\approx ${dec(f.value)} = ${pctTex(f.value)}`,
      ];
    }
  }
}
