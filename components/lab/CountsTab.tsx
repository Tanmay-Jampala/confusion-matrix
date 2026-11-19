"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { computeBinary, statusFor } from "@/lib/metrics";
import { D_LABEL, readout, type DKey } from "@/lib/derivation";
import { EVALUATOR_CALLOUT } from "@/content/site";
import Tex from "@/components/ui/Tex";
import Value from "@/components/ui/Value";
import CellIcon, { KIND_COLOR, KIND_LABEL } from "@/components/ui/CellIcon";
import MatrixEditor from "./MatrixEditor";

const TILES: { key: DKey; hint: string }[] = [
  { key: "accuracy", hint: "Share of all predictions that are correct" },
  { key: "precision", hint: "Of predicted positives, how many are right?" },
  { key: "recall", hint: "Of actual positives, how many were found?" },
  { key: "f1", hint: "Balance between precision and recall" },
  { key: "specificity", hint: "Of actual negatives, how many were cleared?" },
  { key: "errorRate", hint: "Share of all predictions that are wrong" },
];

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
      {(["correct", "alarm", "miss"] as const).map((k) => (
        <li key={k} className="flex items-center gap-2 caption text-taupe-light">
          <span className="grid h-5 w-5 place-items-center rounded-full" style={{ color: KIND_COLOR[k], background: `color-mix(in srgb, ${KIND_COLOR[k]} 18%, transparent)` }}>
            <CellIcon kind={k} size={11} />
          </span>
          {KIND_LABEL[k]}
        </li>
      ))}
    </ul>
  );
}

export function StatusBadge({ m }: { m: ReturnType<typeof computeBinary> }) {
  const st = statusFor(m);
  const tone = st.tone === "good" ? "var(--color-gold-bright)" : st.tone === "warn" ? "var(--color-lavender)" : "var(--color-taupe)";
  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <p className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: tone }} aria-hidden="true" />
        <span className="mono text-[12px]" style={{ color: tone }}>
          {st.label}
        </span>
      </p>
      <p className="caption text-taupe">{st.detail}</p>
    </div>
  );
}

export default function CountsTab() {
  const matrix = useStore((s) => s.matrix);
  const setDrawer = useStore((s) => s.setDrawer);
  const m = useMemo(() => computeBinary(matrix), [matrix]);
  const [heat, setHeat] = useState(false);
  const { tp, fn, fp, tn } = m.counts;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
      {/* left: editor */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono text-[11px] text-taupe">Rows = actual classes · Columns = model predictions</p>
          <button type="button" className="pill !h-9 !px-4 text-bone" aria-pressed={heat} onClick={() => setHeat(!heat)}>
            Heatmap {heat ? "on" : "off"}
          </button>
        </div>
        <MatrixEditor heat={heat} />
        <Legend />
        {heat && (
          <p className="caption text-taupe-light/85 max-w-prose">
            Colour intensity scales with each count; the numbers stay visible because colour alone is not an exact measurement. Large
            values on the diagonal (TP and TN) mean more correct than incorrect predictions; the off-diagonal cells are the two error types.
          </p>
        )}
        <p className="caption text-taupe">
          Enter whole numbers from 0 upward; everything on the page updates as you type. Positive class is shown in the first row.
        </p>
        <aside className="rounded-[14px] border border-gold/40 bg-gold/[0.06] p-5">
          <p className="mono text-[11px] text-gold-bright">{EVALUATOR_CALLOUT.title}</p>
          <p className="mt-2 text-taupe-light">{EVALUATOR_CALLOUT.body}</p>
        </aside>
      </div>

      {/* right: readouts */}
      <div className="flex flex-col gap-8">
        <StatusBadge m={m} />

        <div>
          <h3 className="mono mb-3 text-[11px] text-taupe">Evaluation metrics · select one to see the calculation</h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-live="polite">
            {TILES.map(({ key, hint }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setDrawer(key)}
                  className="metric-tile group flex h-full w-full flex-col gap-2 rounded-[12px] border border-bone/12 bg-smoke/60 p-4 text-left transition-[transform,border-color,background] duration-500 hover:-translate-y-1 hover:border-gold/60 hover:bg-smoke"
                >
                  <span className="mono flex items-center justify-between text-[10.5px] text-taupe">
                    {D_LABEL[key].replace(" (Sensitivity)", "")}
                    <span aria-hidden="true" className="text-gold transition-transform duration-500 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </span>
                  <span className="display text-[clamp(1.9rem,3vw,2.6rem)] leading-none text-bone">
                    <Value v={m[key]} />
                  </span>
                  <span className="caption text-taupe">{hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[14px] border border-bone/12 p-5">
          <p className="mono text-[11px] text-taupe">Matrix representation</p>
          <div className="mt-3 overflow-x-auto text-[1.05rem] text-bone">
            <Tex
              display
              tex={String.raw`C=\begin{bmatrix}TP & FN\\ FP & TN\end{bmatrix}=\begin{bmatrix}${tp} & ${fn}\\ ${fp} & ${tn}\end{bmatrix}`}
              label={`C equals TP ${tp}, FN ${fn}; FP ${fp}, TN ${tn}`}
            />
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-2">
            {[
              ["Actual positive (row 1): TP + FN", m.actualPos],
              ["Actual negative (row 2): FP + TN", m.actualNeg],
              ["Predicted positive (col 1): TP + FP", m.predPos],
              ["Predicted negative (col 2): FN + TN", m.predNeg],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-3 border-b border-bone/10 pb-1.5">
                <dt className="text-taupe">{k}</dt>
                <dd className="tabular text-bone">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-b border-bone/10 pb-1.5 sm:col-span-2">
              <dt className="text-taupe">Total cases</dt>
              <dd className="tabular text-bone">{m.total}</dd>
            </div>
          </dl>
          <p className="mono mt-4 text-[12px] text-gold-bright" aria-live="polite">
            Accuracy ratio: {readout("accuracy", m)}
          </p>
        </div>

        <p className="caption text-taupe" aria-live="polite">
          <span className="text-taupe-light">How your current values are used:</span> with TP={tp}, FN={fn}, FP={fp}, TN={tn}, total={m.total}: accuracy ={" "}
          {readout("accuracy", m)}; precision = {readout("precision", m)}; recall = {readout("recall", m)}.
        </p>
      </div>
    </div>
  );
}
