"use client";
import { useMemo, useRef, useState } from "react";
import { pinProgress, seg, useScene } from "@/lib/motion";
import { useMotion } from "@/lib/store";
import { reportSequences } from "@/lib/metrics";
import { CONSTRUCTION } from "@/content/site";

type Cell = "tp" | "fn" | "fp" | "tn";
const W = 760;
const H = 420;
// source grid on the left, four cells on the right (report layout)
const CELL_BOX: Record<Cell, { x: number; y: number }> = {
  tp: { x: 380, y: 40 },
  fn: { x: 572, y: 40 },
  fp: { x: 380, y: 232 },
  tn: { x: 572, y: 232 },
};
const CELL_W = 176;
const CELL_H = 176;
const CELL_COLOR: Record<Cell, string> = { tp: "var(--color-gold)", tn: "var(--color-gold)", fp: "var(--color-purple-display)", fn: "var(--color-taupe-deep)" };

const backOut = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** §5.6 construction: 100 paired labels fly into the four cells, one by one, with running tallies and validation checks. */
export default function Construction() {
  const motion = useMotion();
  const { actual, predicted } = useMemo(() => reportSequences(), []);
  const dots = useMemo(() => {
    const idx: Record<Cell, number> = { tp: 0, fn: 0, fp: 0, tn: 0 };
    return actual.map((a, i) => {
      const p = predicted[i];
      const cell: Cell = a === 1 ? (p === 1 ? "tp" : "fn") : p === 1 ? "fp" : "tn";
      const k = idx[cell]++;
      const sx = 30 + (i % 10) * 30;
      const sy = 60 + Math.floor(i / 10) * 30;
      const box = CELL_BOX[cell];
      const tx = box.x + 18 + (k % 8) * 20;
      const ty = box.y + 50 + Math.floor(k / 8) * 20;
      return { a, p, cell, sx, sy, tx, ty };
    });
  }, [actual, predicted]);

  const [placed, setPlaced] = useState(motion ? 0 : 100);
  const circles = useRef<(SVGCircleElement | null)[]>([]);

  const track = useScene<HTMLDivElement>((el) => {
    pinProgress(el, (p) => {
      const q = seg(p, 0.05, 0.85) * 100; // dots in flight
      let n = 0;
      dots.forEach((d, i) => {
        const t = Math.min(1, Math.max(0, q - i * 0.92) / 3.5);
        if (t >= 1) n++;
        const e = backOut(t);
        const c = circles.current[i];
        if (c) {
          c.setAttribute("cx", (d.sx + (d.tx - d.sx) * e).toFixed(1));
          c.setAttribute("cy", (d.sy + (d.ty - d.sy) * Math.min(1, e) - Math.sin(Math.min(1, t) * Math.PI) * 40).toFixed(1));
        }
      });
      setPlaced((prev) => (prev === n ? prev : n));
    });
    return () => {
      // motion turned off: show the completed matrix
      dots.forEach((d, i) => {
        const c = circles.current[i];
        if (c) {
          c.setAttribute("cx", String(d.tx));
          c.setAttribute("cy", String(d.ty));
        }
      });
      setPlaced(100);
    };
  });

  const tally = { tp: 0, fn: 0, fp: 0, tn: 0 } as Record<Cell, number>;
  dots.slice(0, placed).forEach((d) => tally[d.cell]++);
  const done = placed === 100;
  const checks = [
    ["Total = 100", tally.tp + tally.fn + tally.fp + tally.tn === 100],
    ["TP + FN = 45 (actual positives)", tally.tp + tally.fn === 45],
    ["TN + FP = 55 (actual negatives)", tally.tn + tally.fp === 55],
    ["TP + FP = 47 (predicted positives)", tally.tp + tally.fp === 47],
  ] as const;
  const current = placed > 0 && placed < 100 ? dots[placed - 1] : null;

  return (
    <div ref={track} className="pin-track mt-24" style={{ height: motion ? "var(--cons-h)" : "auto" }}>
      <div className="pin-stage flex flex-col justify-center gap-6 py-[calc(var(--header-h)*.6)]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-center">
          <div className="flex flex-col gap-4">
            <p className="mono text-[11px] text-[#6b430c]">Report § 5.6 · Construction</p>
            <h3 className="title !text-[clamp(2.2rem,4vw,3.6rem)]">Counting, one pair at a time</h3>
            <ol className="flex flex-col gap-1.5 text-[14.5px]">
              {CONSTRUCTION.steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="mono pt-0.5 text-[10.5px] text-[#6b430c]">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <ul className="grid grid-cols-1 gap-1 text-[13px] text-[#3d372f] sm:grid-cols-2">
              {CONSTRUCTION.rules.map(([rule, cell]) => (
                <li key={cell}>
                  {rule} → <strong className="font-extrabold text-ink-deep">{cell}</strong>
                </li>
              ))}
            </ul>
            <p className="mono min-h-[1.5em] text-[11px] text-ink-deep" aria-live="off">
              {current ? `#${placed} · actual ${current.a}, predicted ${current.p} → ${current.cell.toUpperCase()}` : done ? "All 100 observations counted" : "Scroll to count"}
            </p>
            <ul className="flex flex-col gap-1.5" aria-live="polite" aria-label="Validation checks">
              {checks.map(([label, ok]) => {
                const pass = ok && done;
                return (
                  <li key={label} className="flex items-center gap-2.5 text-[13.5px]">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full border transition-colors duration-500"
                      style={{ background: pass ? "#2f6b3a" : "transparent", borderColor: pass ? "#2f6b3a" : "rgb(23 18 32 / .35)", color: "#f4efe6" }}
                      aria-hidden="true"
                    >
                      {pass && (
                        <svg width="10" height="10" viewBox="0 0 16 16">
                          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                    <span className={pass ? "text-ink-deep" : "text-[#4f483f]"}>
                      {label} {pass ? "· passed" : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Construction: ${placed} of 100 observations counted. TP ${tally.tp}, FN ${tally.fn}, FP ${tally.fp}, TN ${tally.tn}.`}>
            <text x="30" y="34" style={{ font: "500 10px var(--font-mono)", letterSpacing: ".12em" }} fill="var(--color-ink-deep)">
              100 PAIRED LABELS · GOLD = ACTUAL POSITIVE
            </text>
            {(Object.keys(CELL_BOX) as Cell[]).map((c) => (
              <g key={c}>
                <rect x={CELL_BOX[c].x} y={CELL_BOX[c].y} width={CELL_W} height={CELL_H} rx="14" fill="rgb(240 228 212 / .7)" stroke={CELL_COLOR[c]} strokeWidth="2" />
                <text x={CELL_BOX[c].x + 16} y={CELL_BOX[c].y + 30} style={{ font: "800 22px var(--font-display)" }} fill="var(--color-ink-deep)">
                  {c.toUpperCase()}
                </text>
                <text x={CELL_BOX[c].x + CELL_W - 16} y={CELL_BOX[c].y + 32} textAnchor="end" style={{ font: "900 30px var(--font-display)" }} fill="var(--color-ink-deep)">
                  {tally[c]}
                </text>
              </g>
            ))}
            <text x="468" y="28" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".12em" }} fill="var(--color-ink-deep)">PRED +</text>
            <text x="660" y="28" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".12em" }} fill="var(--color-ink-deep)">PRED −</text>
            {dots.map((d, i) => (
              <circle
                key={i}
                ref={(el) => {
                  circles.current[i] = el;
                }}
                cx={motion ? d.sx : d.tx}
                cy={motion ? d.sy : d.ty}
                r="7"
                fill={d.a === 1 ? "var(--color-gold)" : "var(--color-purple-display)"}
                stroke={d.a === d.p ? "none" : "var(--color-ink-deep)"}
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>
      <style>{`:root{--cons-h:240vh}@media (max-width:767px){:root{--cons-h:170vh}}`}</style>
    </div>
  );
}
