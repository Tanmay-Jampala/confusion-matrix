"use client";
import { useStore, type Convention } from "@/lib/store";

type K = "tp" | "fn" | "fp" | "tn";
const POS: Record<Convention, Record<K, [number, number]>> = {
  report: { tp: [0, 0], fn: [0, 1], fp: [1, 0], tn: [1, 1] },
  sklearn: { tn: [0, 0], fp: [0, 1], fn: [1, 0], tp: [1, 1] },
};
const AXES: Record<Convention, { rows: string[]; cols: string[]; tex: string }> = {
  report: { rows: ["Actual positive", "Actual negative"], cols: ["Pred. positive", "Pred. negative"], tex: "[[TP, FN], [FP, TN]]" },
  sklearn: { rows: ["Actual 0 (neg.)", "Actual 1 (pos.)"], cols: ["Pred. 0", "Pred. 1"], tex: "[[TN, FP], [FN, TP]]" },
};
const COLOR: Record<K, string> = { tp: "var(--color-gold)", tn: "var(--color-gold)", fp: "var(--color-purple-display)", fn: "var(--color-taupe-deep)" };

/** Report layout ⇄ scikit-learn layout. Same counts, different positions: always check the axis order. */
export default function ConventionToggle() {
  const conv = useStore((s) => s.convention);
  const setConv = useStore((s) => s.setConvention);
  const m = useStore((s) => s.matrix);
  const a = AXES[conv];

  return (
    <div className="mt-24 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
      <div className="flex flex-col gap-4">
        <p className="mono text-[11px] text-[#6b430c]">Report § 5.3 · § 6.2 · Check the axis order</p>
        <h3 className="title !text-[clamp(2.2rem,4vw,3.6rem)]">Same counts, different layout</h3>
        <p className="max-w-prose text-[#3d372f]">
          This site and the report&apos;s §5.4 show the positive row first. scikit-learn and MATLAB, with labels ordered [0, 1], put the negative class first, so the
          same model prints as <span className="mono normal-case tracking-normal">[[{m.tn}, {m.fp}], [{m.fn}, {m.tp}]]</span>. Both are valid when the labels are
          stated; reading one as the other silently swaps TP with TN and FP with FN.
        </p>
        <div role="radiogroup" aria-label="Matrix layout" className="flex flex-wrap gap-2">
          {(["report", "sklearn"] as const).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={conv === c} onClick={() => setConv(c)} className="pill">
              {c === "report" ? "Report layout [[TP, FN],[FP, TN]]" : "scikit-learn [[TN, FP],[FN, TP]]"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[460px]" aria-live="polite">
        <p className="mono mb-3 text-center text-[11px] text-ink-deep">C = {a.tex}</p>
        <div className="grid grid-cols-[84px_1fr_1fr] grid-rows-[28px_1fr_1fr] gap-2">
          <span />
          {a.cols.map((c) => (
            <span key={c} className="mono self-end text-center text-[10px] text-[#4f483f]">
              {c}
            </span>
          ))}
          {a.rows.map((r, i) => (
            <span key={r} className="mono flex items-center text-[10px] leading-tight text-[#4f483f]" style={{ gridRow: i + 2, gridColumn: 1 }}>
              {r}
            </span>
          ))}
          <div className="relative col-span-2 col-start-2 row-span-2 row-start-2 aspect-square">
            {(Object.keys(COLOR) as K[]).map((k) => {
              const [r, c] = POS[conv][k];
              return (
                <div
                  key={k}
                  className="absolute flex h-[calc(50%-4px)] w-[calc(50%-4px)] flex-col justify-between rounded-[14px] p-3 transition-transform duration-[900ms] ease-[cubic-bezier(.65,.05,.36,1)] motion-reduce:transition-none"
                  style={{
                    transform: `translate(calc(${c * 100}% + ${c * 8}px), calc(${r * 100}% + ${r * 8}px))`,
                    background: COLOR[k],
                    color: k === "tp" || k === "tn" ? "var(--color-ink-deep)" : "var(--color-bone)",
                  }}
                >
                  <span className="mono text-[11px]">{k.toUpperCase()}</span>
                  <span className="display tabular text-[clamp(2.4rem,6vw,4rem)] leading-none">{m[k]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
