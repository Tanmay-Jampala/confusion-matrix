"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { atThreshold, computeBinary, prCurve, rocCurve, type CurvePoint } from "@/lib/metrics";
import { seededScores } from "@/lib/seededScores";
import { pct } from "@/lib/format";
import { THRESHOLD_CAPTION } from "@/content/site";
import Value from "@/components/ui/Value";
import { KIND_COLOR } from "@/components/ui/CellIcon";

const DATA = seededScores();
const ROC = rocCurve(DATA.scores, DATA.labels);
const PR = prCurve(DATA.scores, DATA.labels);

function outcome(score: number, y: 0 | 1, t: number) {
  const p = score >= t;
  if (y === 1) return p ? "tp" : "fn";
  return p ? "fp" : "tn";
}
const OUT_COLOR = { tp: KIND_COLOR.correct, tn: KIND_COLOR.correct, fp: KIND_COLOR.alarm, fn: KIND_COLOR.miss } as const;

/** Dot strip: positives above the axis, negatives below; colour + shape encode the outcome. */
function ScoreStrip({ t }: { t: number }) {
  const W = 640;
  const H = 210;
  const padX = 20;
  const x = (s: number) => padX + s * (W - 2 * padX);
  // stack dots that land in the same 0.02-wide bin
  const stacks = useMemo(() => {
    const bins = new Map<string, number>();
    return DATA.scores.map((s, i) => {
      const y = DATA.labels[i];
      const key = `${y}-${Math.round(s * 50)}`;
      const n = bins.get(key) ?? 0;
      bins.set(key, n + 1);
      return { s, y, n };
    });
  }, []);
  const mid = H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Score distribution of 100 observations with the threshold at ${t.toFixed(2)}`}>
      <rect x={x(t)} y="0" width={Math.max(0, x(1) - x(t))} height={H} fill="rgb(242 199 102 / 0.05)" />
      <line x1={padX} x2={W - padX} y1={mid} y2={mid} stroke="rgb(244 239 230 / .25)" />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={mid - 4} y2={mid + 4} stroke="rgb(244 239 230 / .35)" />
        </g>
      ))}
      <text x={padX} y="14" className="fill-taupe" style={{ font: "500 10px var(--font-mono)", letterSpacing: ".12em" }}>
        ACTUAL POSITIVE (45)
      </text>
      <text x={padX} y={H - 6} className="fill-taupe" style={{ font: "500 10px var(--font-mono)", letterSpacing: ".12em" }}>
        ACTUAL NEGATIVE (55)
      </text>
      {stacks.map(({ s, y, n }, i) => {
        const o = outcome(s, y, t);
        const cy = y === 1 ? mid - 12 - n * 11 : mid + 12 + n * 11;
        const c = OUT_COLOR[o];
        const isError = o === "fp" || o === "fn";
        return isError ? (
          <circle key={i} cx={x(s)} cy={cy} r="4" fill="none" stroke={c} strokeWidth="1.8" />
        ) : (
          <circle key={i} cx={x(s)} cy={cy} r="4.4" fill={c} opacity={o === "tn" ? 0.55 : 1} />
        );
      })}
      <line x1={x(t)} x2={x(t)} y1="18" y2={H - 18} stroke="var(--color-bone)" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={Math.min(x(t) + 6, W - 70)} y="30" fill="var(--color-bone)" style={{ font: "500 11px var(--font-mono)" }}>
        t = {t.toFixed(2)}
      </text>
    </svg>
  );
}

function Curve({ title, points, xLabel, yLabel, op, area, areaLabel }: { title: string; points: CurvePoint[]; xLabel: string; yLabel: string; op: { x: number; y: number } | null; area: number; areaLabel: string }) {
  const S = 220;
  const p = 30;
  const sx = (v: number) => p + v * (S - p - 8);
  const sy = (v: number) => S - p - v * (S - p - 8);
  const d = points.map((pt, i) => `${i ? "L" : "M"}${sx(pt.x).toFixed(1)},${sy(pt.y).toFixed(1)}`).join("");
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="mono flex justify-between text-[10.5px] text-taupe">
        <span>{title}</span>
        <span>
          {areaLabel} {area.toFixed(3)}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[280px]" role="img" aria-label={`${title}. Current operating point ${op ? `${xLabel} ${pct(op.x)}, ${yLabel} ${pct(op.y)}` : "undefined"}.`}>
        <rect x={sx(0)} y={sy(1)} width={sx(1) - sx(0)} height={sy(0) - sy(1)} fill="none" stroke="rgb(244 239 230 / .15)" />
        {[0.25, 0.5, 0.75].map((g) => (
          <g key={g} stroke="rgb(244 239 230 / .06)">
            <line x1={sx(g)} x2={sx(g)} y1={sy(0)} y2={sy(1)} />
            <line x1={sx(0)} x2={sx(1)} y1={sy(g)} y2={sy(g)} />
          </g>
        ))}
        {title.startsWith("ROC") && <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="rgb(244 239 230 / .2)" strokeDasharray="3 3" />}
        <path d={d} fill="none" stroke="var(--color-lavender)" strokeWidth="2" strokeLinejoin="round" />
        {op && (
          <g>
            <circle cx={sx(op.x)} cy={sy(op.y)} r="9" fill="rgb(242 199 102 / .2)" />
            <circle cx={sx(op.x)} cy={sy(op.y)} r="4.5" fill="var(--color-gold-bright)" />
          </g>
        )}
        <text x={sx(0.5)} y={S - 6} textAnchor="middle" fill="var(--color-taupe)" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }}>
          {xLabel.toUpperCase()}
        </text>
        <text x="10" y={sy(0.5)} textAnchor="middle" transform={`rotate(-90 10 ${sy(0.5)})`} fill="var(--color-taupe)" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }}>
          {yLabel.toUpperCase()}
        </text>
      </svg>
    </figure>
  );
}

export default function ThresholdTab() {
  const setThreshold = useStore((s) => s.setThreshold);
  const stored = useStore((s) => s.threshold);
  const source = useStore((s) => s.source);
  const [t, setT] = useState(stored);
  const c = useMemo(() => atThreshold(DATA.scores, DATA.labels, t), [t]);
  const m = useMemo(() => computeBinary(c), [c]);

  const onChange = (v: number) => {
    setT(v);
    setThreshold(v, atThreshold(DATA.scores, DATA.labels, v));
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
        <div className="flex flex-col gap-5">
          <p className="text-taupe-light max-w-prose">
            100 model scores (45 actual positives, 55 actual negatives), generated deterministically from a fixed seed so that the threshold 0.50 reproduces the
            report&apos;s matrix exactly. The model predicts positive when its score is at least the threshold.
          </p>
          <ScoreStrip t={t} />
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor="threshold" className="mono text-[11px] text-bone">
                Decision threshold
              </label>
              <output htmlFor="threshold" className="display text-[2rem] leading-none text-gold-bright tabular">
                {t.toFixed(2)}
              </output>
            </div>
            <input
              id="threshold"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={t}
              onChange={(e) => onChange(Number(e.target.value))}
              aria-valuetext={`Threshold ${t.toFixed(2)}: precision ${pct(m.precision)}, recall ${pct(m.recall)}`}
              className="range w-full"
            />
            <div className="mono flex justify-between text-[10px] text-taupe">
              <span>0 · everything positive</span>
              <button type="button" className="link-draw text-gold" onClick={() => onChange(0.5)}>
                Back to 0.50
              </button>
              <span>1 · nothing positive</span>
            </div>
          </div>
          <p className="caption text-taupe-light max-w-prose">{THRESHOLD_CAPTION}</p>
        </div>

        <div className="flex flex-col gap-5" aria-live="polite">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["tp", "TP", c.tp],
                ["fn", "FN", c.fn],
                ["fp", "FP", c.fp],
                ["tn", "TN", c.tn],
              ] as const
            ).map(([k, label, v]) => (
              <div key={k} className="rounded-[12px] border p-3" style={{ borderColor: `color-mix(in srgb, ${OUT_COLOR[k]} 50%, transparent)` }}>
                <p className="mono text-[10.5px]" style={{ color: OUT_COLOR[k] }}>
                  {label}
                </p>
                <p className="display text-[2.4rem] leading-none text-bone tabular">{v}</p>
              </div>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13.5px]">
            {(
              [
                ["Accuracy", m.accuracy],
                ["Precision", m.precision],
                ["Recall", m.recall],
                ["F1-score", m.f1],
                ["Specificity", m.specificity],
                ["Error rate", m.errorRate],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-bone/10 pb-1.5">
                <dt className="text-taupe">{k}</dt>
                <dd className="text-bone">
                  <Value v={v} />
                </dd>
              </div>
            ))}
          </dl>
          {source === "threshold" && <p className="caption text-taupe">This matrix is now the shared matrix used across the page.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-[720px]">
        <Curve
          title="Precision–recall curve"
          points={PR.points}
          xLabel="Recall"
          yLabel="Precision"
          op={m.precision !== null && m.recall !== null ? { x: m.recall, y: m.precision } : null}
          area={PR.ap}
          areaLabel="AP"
        />
        <Curve
          title="ROC curve"
          points={ROC.points}
          xLabel="False positive rate"
          yLabel="Recall (TPR)"
          op={m.specificity !== null && m.recall !== null ? { x: 1 - m.specificity, y: m.recall } : null}
          area={ROC.auc}
          areaLabel="AUC"
        />
      </div>
      <p className="caption text-taupe max-w-prose">
        The gold point is the current threshold. ROC curves and their area add insight, but they should not replace an evaluation that reflects the costs of
        each error in the application.
      </p>
      <style>{`
        .range{-webkit-appearance:none;appearance:none;height:44px;background:transparent}
        .range::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:linear-gradient(90deg,var(--color-gold) 0 ${t * 100}%,rgb(244 239 230 / .2) ${t * 100}% 100%)}
        .range::-moz-range-track{height:3px;border-radius:2px;background:rgb(244 239 230 / .2)}
        .range::-moz-range-progress{height:3px;background:var(--color-gold)}
        .range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;margin-top:-11.5px;border-radius:50%;background:var(--color-bone);border:6px solid var(--color-ink-deep);box-shadow:0 0 0 1.5px var(--color-gold)}
        .range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--color-bone);border:5px solid var(--color-ink-deep);box-shadow:0 0 0 1.5px var(--color-gold)}
      `}</style>
    </div>
  );
}
