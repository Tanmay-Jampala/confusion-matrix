"use client";
import { useId } from "react";
import type { Ratio } from "@/lib/metrics";
import { pct, UNDEFINED_NOTE } from "@/lib/format";

/** A percentage, or the word "undefined" with an explanatory tooltip (keyboard-focusable). */
export default function Value({ v, className = "" }: { v: Ratio; className?: string }) {
  const id = useId();
  if (v !== null) return <span className={`tabular ${className}`}>{pct(v)}</span>;
  return (
    <span className={`undef-wrap relative inline-block ${className}`}>
      <span tabIndex={0} aria-describedby={id} className="undef cursor-help border-b border-dashed border-current italic opacity-80">
        undefined
      </span>
      <span id={id} role="tooltip" className="undef-tip">
        {UNDEFINED_NOTE}
      </span>
      <style>{`
        .undef-tip{position:absolute;left:0;top:calc(100% + 8px);z-index:30;width:min(300px,80vw);padding:.75rem .9rem;border-radius:10px;background:var(--color-bone);color:var(--color-ink-deep);font:400 12.5px/1.45 var(--font-body);letter-spacing:0;text-transform:none;font-style:normal;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .25s var(--ease-ui),transform .25s var(--ease-ui);box-shadow:0 18px 40px -12px rgb(0 0 0 / .6)}
        .undef-wrap:hover .undef-tip,.undef:focus-visible + .undef-tip{opacity:1;transform:none}
      `}</style>
    </span>
  );
}
