"use client";
import { useEffect, useRef } from "react";

/**
 * A hand-drawn single-stroke alphabet (only the glyphs we need), so the equation
 * C = [[TP, FN], [FP, TN]] can "write itself" with stroke-dashoffset.
 */
const G: Record<string, { w: number; d: string[] }> = {
  C: { w: 10, d: ["M9 2.6C7.6.6 3.1.1 1.5 3.9-.1 7.9 1.5 13.4 5.4 13.6c2.2.1 3.4-1 4.1-2.2"] },
  "=": { w: 10, d: ["M1 5.6 9 5.1", "M1.3 9.1 9.3 8.6"] },
  "[": { w: 6.5, d: ["M5.8.1 2.3.4 2 13.9 5.9 13.7"] },
  "]": { w: 6.5, d: ["M.8.2 4.6.3 4.9 14 .9 13.8"] },
  T: { w: 10.5, d: ["M.4 1 10.2.4", "M5.4.7 5 14"] },
  P: { w: 9.5, d: ["M1.5 14 1.7.7C6.1-.2 9.5 1.1 9.1 4.1 8.8 7 5.4 7.6 1.8 7.2"] },
  F: { w: 9, d: ["M1.6 14 1.7.7 8.8.4", "M1.7 6.9 7.1 6.6"] },
  N: { w: 10.5, d: ["M1.2 14 1.4.5 9 13.8 9.3.2"] },
  ",": { w: 4, d: ["M2.4 12.5c.7 1.1.3 2.7-1.2 3.7"] },
  " ": { w: 3.4, d: [] },
};

const TEXT = "C = [[TP, FN], [FP, TN]]";

export default function Handwriting({ register, className = "" }: { register?: (draw: (p: number) => void) => void; className?: string }) {
  const svg = useRef<SVGSVGElement>(null);

  // lay out glyphs
  // deterministic wobble: baseline drift and per-glyph tilt make the strokes read as hand-written
  let x = 0;
  const strokes: { d: string; t: string }[] = [];
  [...TEXT].forEach((ch, i) => {
    const g = G[ch];
    const dy = Math.sin(i * 1.7) * 0.7 + i * 0.06;
    const rot = Math.sin(i * 2.3 + 1) * 3.2;
    g.d.forEach((d) => strokes.push({ d, t: `translate(${x.toFixed(2)} ${dy.toFixed(2)}) rotate(${rot.toFixed(2)} ${g.w / 2} 7)` }));
    x += g.w + 1.1 + Math.sin(i * 3.1) * 0.35;
  });
  const width = x;

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const paths = Array.from(el.querySelectorAll<SVGPathElement>("path"));
    const n = paths.length;
    const draw = (p: number) => {
      const t = p * n;
      paths.forEach((path, i) => {
        const local = Math.min(1, Math.max(0, t - i));
        path.style.strokeDashoffset = String(1 - local);
      });
    };
    draw(1);
    register?.(draw);
  }, [register]);

  return (
    <svg
      ref={svg}
      viewBox={`-2 -3 ${width + 4} 24`}
      className={className}
      role="img"
      aria-label="C equals the matrix with rows TP, FN and FP, TN"
      style={{ overflow: "visible" }}
    >
      <g transform="skewX(-12)" fill="none" stroke="var(--color-lavender)" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((s, i) => (
          <path key={i} d={s.d} transform={s.t} pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: 0 }} />
        ))}
      </g>
    </svg>
  );
}
