"use client";
import { useMemo } from "react";
import { useMotion, useStore, type LabTab } from "@/lib/store";
import { computeBinary, REPORT_EXAMPLE } from "@/lib/metrics";
import { pct } from "@/lib/format";
import { scrollToId } from "@/lib/scroll";
import { CONCLUSION, FUTURE, RESULTS } from "@/content/site";
import Section from "@/components/ui/Section";
import Value from "@/components/ui/Value";

const R = computeBinary(REPORT_EXAMPLE);
const ROWS = [
  ["accuracy", "Accuracy", RESULTS.interpretations.accuracy(R.correct, R.total)],
  ["errorRate", "Error rate", RESULTS.interpretations.errorRate(R.incorrect, R.total)],
  ["precision", "Precision", RESULTS.interpretations.precision()],
  ["recall", "Recall", RESULTS.interpretations.recall()],
  ["f1", "F1-score", RESULTS.interpretations.f1()],
  ["specificity", "Specificity", RESULTS.interpretations.specificity()],
] as const;

export default function Results() {
  const matrix = useStore((s) => s.matrix);
  const source = useStore((s) => s.source);
  const setLabTab = useStore((s) => s.setLabTab);
  const motion = useMotion();
  const live = useMemo(() => computeBinary(matrix), [matrix]);
  const isReport = source === "report";
  const { tp, fn, fp, tn } = REPORT_EXAMPLE;

  const tryIt = (tab: LabTab) => {
    setLabTab(tab);
    setTimeout(() => scrollToId("lab"), motion ? 50 : 0);
  };

  return (
    <Section id="results" theme="sand" wipe leather label="Results">
      <div className="wrap section-pad text-ink-deep">
        <p className="mono text-[11px] text-[#6b430c]" data-reveal>
          07 · Results · Report § 7
        </p>
        <h2 className="giant mt-3" data-reveal>
          Results
        </h2>
        <p className="mt-6 max-w-[60ch] text-[17px] leading-snug" data-reveal>
          {RESULTS.intro}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          {/* 7.1 */}
          <div data-reveal>
            <p className="mono mb-4 text-[11px] text-[#4f483f]">§ 7.1 · Actual vs predicted · scikit-learn order [0, 1]</p>
            <div className="overflow-x-auto">
              <table className="editorial w-full min-w-[420px]">
                <thead>
                  <tr>
                    <th scope="col">Actual ↓ / Predicted →</th>
                    <th scope="col">Negative (0)</th>
                    <th scope="col">Positive (1)</th>
                    <th scope="col">Row total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Negative (0)</th>
                    <td>TN = {tn}</td>
                    <td>FP = {fp}</td>
                    <td className="total">{R.actualNeg}</td>
                  </tr>
                  <tr>
                    <th scope="row">Positive (1)</th>
                    <td>FN = {fn}</td>
                    <td>TP = {tp}</td>
                    <td className="total">{R.actualPos}</td>
                  </tr>
                  <tr>
                    <th scope="row">Column total</th>
                    <td className="total">{R.predNeg}</td>
                    <td className="total">{R.predPos}</td>
                    <td className="total">{R.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5 text-[14px] text-[#3d372f]">
              Checks: {tn} + {fp} + {fn} + {tp} = {R.total}; actual negatives = {R.actualNeg}; actual positives = {R.actualPos}; predicted negatives = {R.predNeg};
              predicted positives = {R.predPos}. Correct = {tn} + {tp} = {R.correct}; incorrect = {fp} + {fn} = {R.incorrect}.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <div className="grid w-40 shrink-0 grid-cols-2 gap-1" role="img" aria-label={`Heatmap of [[${tn}, ${fp}], [${fn}, ${tp}]]`}>
                {[tn, fp, fn, tp].map((v, i) => {
                  const a = v / Math.max(tn, fp, fn, tp);
                  return (
                    <span key={i} className="display grid aspect-square place-items-center rounded-[8px] text-[1.5rem]" style={{ background: `color-mix(in srgb, var(--color-purple-rich) ${Math.round(12 + a * 78)}%, var(--color-taupe-light))`, color: a > 0.5 ? "var(--color-bone)" : "var(--color-ink-deep)" }}>
                      {v}
                    </span>
                  );
                })}
              </div>
              <p className="caption text-[#3d372f]">{RESULTS.heatmap}</p>
            </div>
          </div>

          {/* 7.2 */}
          <div data-reveal>
            <p className="mono mb-4 text-[11px] text-[#4f483f]">§ 7.2 · Metric summary</p>
            <div className="overflow-x-auto">
              <table className="editorial w-full min-w-[520px]">
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">Value</th>
                    <th scope="col">Interpretation</th>
                    {!isReport && <th scope="col">Your matrix</th>}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([k, l, interp]) => (
                    <tr key={k}>
                      <th scope="row">{l}</th>
                      <td className="display !text-[1.6rem] tabular">{pct(R[k])}</td>
                      <td className="interp">{interp}</td>
                      {!isReport && (
                        <td className="tabular">
                          <Value v={live[k]} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isReport && <p className="caption mt-3 text-[#4f483f]">“Your matrix” follows the counts set in the Lab; the other columns are the report&apos;s example.</p>}
            <p className="mt-5 rounded-[14px] border border-ink-deep/20 bg-taupe-light/60 p-5 text-[14px] text-[#3d372f]">{RESULTS.caveat}</p>
          </div>
        </div>

        {/* conclusion */}
        <div className="mt-28 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,.6fr)_minmax(0,1.4fr)]">
          <h2 id="conclusion" className="title" data-reveal>
            Conclusion
          </h2>
          <div className="flex flex-col gap-6" data-reveal>
            {CONCLUSION.map((p) => (
              <p key={p.slice(0, 24)} className="text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.45]">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* future scope */}
        <div className="mt-28">
          <h2 id="future" className="title" data-reveal>
            Future scope
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {FUTURE.map((f, i) => (
              <li key={f.title} className="flex flex-col gap-3 border-t border-ink-deep/25 pt-5" data-reveal>
                <span className="display text-[5rem] leading-[.8] text-[#6b430c]" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[19px] font-extrabold">{f.title}</h3>
                <p className="text-[#3d372f]">{f.body}</p>
                {f.tab && (
                  <button type="button" onClick={() => tryIt(f.tab!)} className="link-draw mono self-start text-[11px] text-ink-deep">
                    Try it in the Lab ↗
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <style>{`
        .editorial{border-collapse:collapse;font-size:14.5px}
        .editorial th,.editorial td{padding:.85rem .9rem .85rem 0;border-bottom:1px solid rgb(23 18 32 / .22);text-align:left;vertical-align:baseline}
        .editorial thead th{font:500 10.5px var(--font-mono);letter-spacing:.14em;text-transform:uppercase;color:#4f483f;border-bottom:1.5px solid var(--color-ink-deep)}
        .editorial tbody th{font-weight:800}
        .editorial .total{font-family:var(--font-mono);font-weight:500}
        .editorial .interp{color:#3d372f}
      `}</style>
    </Section>
  );
}
