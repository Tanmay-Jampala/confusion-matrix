"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { computeMulticlass, sanitizeCount } from "@/lib/metrics";
import { pct } from "@/lib/format";
import { AVERAGING, MULTICLASS_DEFAULT } from "@/content/site";
import Value from "@/components/ui/Value";

const EXTRA = ["Gearbox", "Pump"];

export default function MulticlassTab() {
  const { classes, matrix } = useStore((s) => s.multi);
  const setMulti = useStore((s) => s.setMulti);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const r = useMemo(() => computeMulticlass(matrix), [matrix]);
  const k = classes.length;

  const setCell = (i: number, j: number, v: number) => setMulti({ classes, matrix: matrix.map((row, a) => row.map((c, b) => (a === i && b === j ? sanitizeCount(v) : c))) });
  const addClass = () => {
    if (k >= 5) return;
    const name = [...MULTICLASS_DEFAULT.classes, ...EXTRA].find((n) => !classes.includes(n)) ?? `Class ${k + 1}`;
    setMulti({ classes: [...classes, name], matrix: [...matrix.map((r) => [...r, 0]), Array(k + 1).fill(0)] });
  };
  const removeClass = () => {
    if (k <= 2) return;
    setMulti({ classes: classes.slice(0, -1), matrix: matrix.slice(0, -1).map((r) => r.slice(0, -1)) });
  };
  const reset = () => setMulti({ classes: [...MULTICLASS_DEFAULT.classes], matrix: MULTICLASS_DEFAULT.matrix.map((r) => [...r]) });
  const rowSum = matrix.map((row) => row.reduce((a, b) => a + b, 0));
  const max = Math.max(1, ...matrix.flat());

  const hoverText = hover
    ? hover[0] === hover[1]
      ? `Actual ${classes[hover[0]]} predicted as ${classes[hover[1]]}: ${matrix[hover[0]][hover[1]]} times (correct).`
      : `Actual ${classes[hover[0]]} predicted as ${classes[hover[1]]}: ${matrix[hover[0]][hover[1]]} times.`
    : "Hover or focus a cell to read it as a sentence.";

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-4">
          <p className="text-taupe-light max-w-prose">
            A machine fault classified as one of {k} mutually exclusive types. Entry C<sub>ij</sub> counts observations of actual class <em>i</em> predicted as{" "}
            <em>j</em>; the diagonal holds the correct predictions. <span className="text-taupe">Counts are illustrative.</span>
          </p>
          <div className="overflow-x-auto no-scrollbar -mx-1 px-1" data-lenis-prevent>
            <table className="border-separate border-spacing-1.5">
              <caption className="sr-only">Multiclass confusion matrix: rows are actual classes, columns are predicted classes</caption>
              <thead>
                <tr>
                  <th className="mono pr-2 text-left text-[10px] text-taupe font-medium" scope="col">
                    Actual ↓ / Pred →
                  </th>
                  {classes.map((c) => (
                    <th key={c} scope="col" className="mono min-w-[56px] px-1 text-[10.5px] text-taupe font-medium">
                      {c}
                    </th>
                  ))}
                  <th scope="col" className="mono px-1 text-[10px] text-taupe font-medium">
                    Support
                  </th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <th scope="row" className="mono pr-2 text-left text-[10.5px] text-bone font-medium">
                      {classes[i]}
                    </th>
                    {row.map((v, j) => {
                      const diag = i === j;
                      const color = diag ? "var(--color-gold)" : "var(--color-lavender)";
                      const a = v / max;
                      return (
                        <td key={j}>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={v}
                            aria-label={`Actual ${classes[i]}, predicted ${classes[j]}`}
                            onChange={(e) => setCell(i, j, Number(e.target.value.replace(/\D/g, "").slice(0, 5) || 0))}
                            onMouseEnter={() => setHover([i, j])}
                            onMouseLeave={() => setHover(null)}
                            onFocus={() => setHover([i, j])}
                            onBlur={() => setHover(null)}
                            className="display tabular h-14 w-14 rounded-[10px] border text-center text-[1.6rem] outline-none focus-visible:ring-2 focus-visible:ring-gold-bright sm:h-16 sm:w-16 sm:text-[1.9rem]"
                            style={{
                              borderColor: `color-mix(in srgb, ${color} ${diag ? 70 : 35}%, transparent)`,
                              background: `color-mix(in srgb, ${color} ${Math.round(6 + a * (diag ? 55 : 40))}%, var(--color-ink-deep))`,
                              color: diag && a > 0.6 ? "var(--color-ink-deep)" : "var(--color-bone)",
                            }}
                          />
                        </td>
                      );
                    })}
                    <td className="mono px-2 text-center text-[11px] text-taupe tabular">{rowSum[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="caption min-h-[2.6em] text-gold-bright" aria-live="polite">
            {hoverText}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="pill text-bone" onClick={addClass} disabled={k >= 5} aria-disabled={k >= 5}>
              + Add class
            </button>
            <button type="button" className="pill text-bone" onClick={removeClass} disabled={k <= 2} aria-disabled={k <= 2}>
              − Remove class
            </button>
            <button type="button" className="pill text-taupe" onClick={reset}>
              Reset example
            </button>
          </div>
          <p className="mono text-[10.5px] text-taupe">k = {k} · between 2 and 5 classes</p>
        </div>

        <div className="flex flex-col gap-5" aria-live="polite">
          <div className="flex items-baseline justify-between border-b border-bone/12 pb-3">
            <span className="mono text-[11px] text-taupe">Overall accuracy · diagonal / total</span>
            <span className="display text-[2.6rem] leading-none text-gold-bright">
              <Value v={r.accuracy} />
            </span>
          </div>
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full min-w-[440px] text-[13px]">
              <caption className="mono mb-2 text-left text-[10.5px] text-taupe">Averages</caption>
              <thead>
                <tr className="mono text-[10.5px] text-taupe">
                  <th scope="col" className="py-2 text-left font-medium">Average</th>
                  <th scope="col" className="text-right font-medium">Precision</th>
                  <th scope="col" className="text-right font-medium">Recall</th>
                  <th scope="col" className="text-right font-medium">F1</th>
                </tr>
              </thead>
              <tbody>
                {(["macro", "micro", "weighted"] as const).map((a) => (
                  <tr key={a} className="border-t border-bone/10">
                    <th scope="row" className="py-2 text-left font-normal capitalize text-bone">
                      {a}
                    </th>
                    <td className="text-right text-bone"><Value v={r[a].precision} /></td>
                    <td className="text-right text-bone"><Value v={r[a].recall} /></td>
                    <td className="text-right text-bone"><Value v={r[a].f1} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3">
            {AVERAGING.map((a) => (
              <li key={a.key} className="caption text-taupe-light">
                <span className="mono mr-2 text-[10.5px] text-gold">{a.title}</span>
                {a.body}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[640px] text-[13px]">
          <caption className="mono mb-3 text-left text-[10.5px] text-taupe">Per class, one-versus-rest: the class is “positive”, every other class is “negative”</caption>
          <thead>
            <tr className="mono text-[10.5px] text-taupe">
              {["Class", "Support", "TP", "FP", "FN", "TN", "Precision", "Recall", "F1"].map((h, i) => (
                <th key={h} scope="col" className={`py-2 font-medium ${i ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.perClass.map((c, i) => (
              <tr key={i} className="border-t border-bone/10 tabular">
                <th scope="row" className="py-2 text-left font-normal text-bone">
                  {classes[i]}
                </th>
                <td className="text-right text-taupe">{c.support}</td>
                <td className="text-right text-gold-bright">{c.tp}</td>
                <td className="text-right text-lavender">{c.fp}</td>
                <td className="text-right text-cta-yellow">{c.fn}</td>
                <td className="text-right text-taupe">{c.tn}</td>
                <td className="text-right text-bone"><Value v={c.precision} /></td>
                <td className="text-right text-bone"><Value v={c.recall} /></td>
                <td className="text-right text-bone"><Value v={c.f1} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="caption text-taupe max-w-prose">
        Check: micro F1 ({pct(r.micro.f1)}) equals accuracy ({pct(r.accuracy)}) because, in single-label multiclass, every error is one false positive for one
        class and one false negative for another.
      </p>
    </div>
  );
}
