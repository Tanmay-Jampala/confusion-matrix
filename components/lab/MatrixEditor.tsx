"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Binary } from "@/lib/metrics";
import { CELL_INFO } from "@/content/site";
import CellIcon, { KIND_COLOR } from "@/components/ui/CellIcon";

type K = keyof Binary;
const ORDER: K[][] = [
  ["tp", "fn"],
  ["fp", "tn"],
];

function CellInput({ k, heat, max }: { k: K; heat: boolean; max: number }) {
  const value = useStore((s) => s.matrix[k]);
  const setCell = useStore((s) => s.setCell);
  const [text, setText] = useState(String(value));
  const info = CELL_INFO[k];
  const color = KIND_COLOR[info.kind];
  // keep the text box in sync when the matrix changes elsewhere (labels, threshold, reset)
  useEffect(() => {
    setText((t) => (Number(t) === value && t !== "" ? t : String(value)));
  }, [value]);

  const commit = (raw: string) => {
    const cleaned = raw.replace(/[^\d]/g, "").slice(0, 6);
    setText(cleaned);
    if (cleaned !== "") setCell(k, Number(cleaned));
  };
  const intensity = max > 0 ? value / max : 0;
  // dark text only on bright gold / yellow fills; lavender stays dark enough for bone text
  const darkText = heat && intensity > 0.55 && info.kind !== "alarm";
  const id = `cell-${k}`;
  return (
    <div
      className="cell relative flex min-h-[148px] flex-col justify-between rounded-[14px] border p-3 sm:p-4 transition-colors duration-500"
      style={{
        borderColor: `color-mix(in srgb, ${color} 55%, transparent)`,
        background: heat
          ? `color-mix(in srgb, ${color} ${Math.round(8 + intensity * 62)}%, var(--color-ink-deep))`
          : `color-mix(in srgb, ${color} 7%, transparent)`,
      }}
    >
      <label htmlFor={id} className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
          <CellIcon kind={info.kind} size={13} />
        </span>
        <span className="mono text-[11px]" style={{ color: darkText ? "var(--color-ink-deep)" : "var(--color-bone)" }}>
          {info.short} <span className="opacity-75">· {info.name}</span>
        </span>
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
        <button
          type="button"
          className="stepper"
          aria-label={`Decrease ${info.name}`}
          onClick={() => setCell(k, Math.max(0, value - 1))}
          disabled={value <= 0}
        >
          −
        </button>
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          autoComplete="off"
          value={text}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => text === "" && setText(String(value))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") (e.preventDefault(), setCell(k, value + 1));
            if (e.key === "ArrowDown") (e.preventDefault(), setCell(k, Math.max(0, value - 1)));
          }}
          aria-describedby={`${id}-def`}
          style={{ color: darkText ? "var(--color-ink-deep)" : "var(--color-bone)" }}
          className="display tabular w-full min-w-0 bg-transparent max-sm:order-first max-sm:basis-full text-center text-[clamp(2.6rem,5vw,4.2rem)] leading-none outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-gold-bright"
        />
        <button type="button" className="stepper" aria-label={`Increase ${info.name}`} onClick={() => setCell(k, value + 1)}>
          +
        </button>
      </div>
      <p id={`${id}-def`} className="caption" style={{ color: darkText ? "var(--color-ink-deep)" : "rgb(240 228 212 / .8)" }}>
        {info.def}
      </p>
    </div>
  );
}

export default function MatrixEditor({ heat }: { heat: boolean }) {
  const m = useStore((s) => s.matrix);
  const max = Math.max(m.tp, m.fn, m.fp, m.tn);
  return (
    <div>
      <div className="grid grid-cols-[22px_1fr_1fr] gap-2 sm:grid-cols-[28px_1fr_1fr] sm:gap-3" role="group" aria-label="Confusion matrix counts. Rows are actual classes, columns are model predictions.">
        <div />
        <p className="mono text-center text-[10.5px] text-taupe">Predicted positive</p>
        <p className="mono text-center text-[10.5px] text-taupe">Predicted negative</p>
        {ORDER.map((row, i) => (
          <div key={i} className="contents">
            <p className="mono flex items-center justify-center text-[10.5px] text-taupe [writing-mode:vertical-rl] rotate-180">
              {i === 0 ? "Actual positive" : "Actual negative"}
            </p>
            {row.map((k) => (
              <CellInput key={k} k={k} heat={heat} max={max} />
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .stepper{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:999px;border:1px solid rgb(244 239 230 / .22);color:var(--color-bone);font:500 20px/1 var(--font-mono);transition:background .3s var(--ease-ui),color .3s var(--ease-ui)}
        .stepper:hover:not(:disabled){background:var(--color-bone);color:var(--color-ink-deep)}
        .stepper:disabled{opacity:.3;cursor:not-allowed}
      `}</style>
    </div>
  );
}
