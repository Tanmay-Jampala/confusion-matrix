/** Five generated mini-visuals (SVG + CSS animation), one per concept. Colours via tokens. */

const ink = "var(--color-ink-deep)";
const gold = "var(--color-gold)";
const lav = "var(--color-purple-display)";

export function VizModels() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="14" y={34 + i * 22} width="26" height="16" rx="4" fill="none" stroke={ink} strokeWidth="1.6" />
      ))}
      <text x="27" y="26" textAnchor="middle" style={{ font: "500 10px var(--font-mono)" }} fill={ink}>
        x
      </text>
      <path className="flow" d="M44 75H82" stroke={ink} strokeWidth="1.6" strokeDasharray="4 4" />
      <rect x="84" y="50" width="48" height="50" rx="10" fill={ink} />
      <text x="108" y="81" textAnchor="middle" style={{ font: "800 18px var(--font-display)" }} fill={gold}>
        f
      </text>
      <path className="flow" d="M134 75H162" stroke={ink} strokeWidth="1.6" strokeDasharray="4 4" />
      <circle cx="178" cy="75" r="13" fill={gold} className="pulse" />
      <text x="178" y="79" textAnchor="middle" style={{ font: "500 11px var(--font-mono)" }} fill={ink}>
        ŷ
      </text>
    </svg>
  );
}

export function VizSplit() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={16 + i * 17.5} y={40 + ((i * 37) % 23)} width="12" height={70 - ((i * 37) % 23)} rx="3" fill={i < 8 ? ink : lav} opacity={i < 8 ? 0.85 : 1} />
      ))}
      <line className="split-line" x1="155" x2="155" y1="26" y2="120" stroke={gold} strokeWidth="2.4" />
      <text x="80" y="134" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }} fill={ink}>
        TRAIN
      </text>
      <text x="172" y="134" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }} fill={lav}>
        TEST
      </text>
    </svg>
  );
}

export function VizMatrices() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => (
          <rect key={`${r}-${c}`} className="cell-blink" style={{ animationDelay: `${(r * 5 + c) * 0.11}s` }} x={18 + c * 18} y={22 + r * 18} width="14" height="14" rx="3" fill={ink} opacity=".75" />
        )),
      )}
      <text x="62" y="140" textAnchor="middle" style={{ font: "500 9px var(--font-mono)" }} fill={ink}>
        X ∈ ℝⁿˣᵖ
      </text>
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          <rect x="128" y={22 + r * 18} width="14" height="14" rx="7" fill={r % 3 ? lav : gold} />
          <rect x="160" y={22 + r * 18} width="14" height="14" rx="7" fill={r === 4 ? gold : r % 3 ? lav : gold} />
        </g>
      ))}
      <text x="135" y="140" textAnchor="middle" style={{ font: "500 9px var(--font-mono)" }} fill={ink}>
        y
      </text>
      <text x="167" y="140" textAnchor="middle" style={{ font: "500 9px var(--font-mono)" }} fill={ink}>
        ŷ
      </text>
    </svg>
  );
}

export function VizConfusion() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      <path d="M48 20h-8v112h8M152 20h8v112h-8" fill="none" stroke={ink} strokeWidth="2.4" />
      {[
        [56, 26, gold, "TP", true],
        [104, 26, lav, "FN", false],
        [56, 78, lav, "FP", false],
        [104, 78, gold, "TN", true],
      ].map(([x, y, c, t, d]) => (
        <g key={t as string}>
          <rect x={x as number} y={y as number} width="42" height="46" rx="8" fill={c as string} className={d ? "pulse" : undefined} opacity={d ? 1 : 0.55} />
          <text x={(x as number) + 21} y={(y as number) + 28} textAnchor="middle" style={{ font: "800 15px var(--font-display)" }} fill={ink}>
            {t as string}
          </text>
        </g>
      ))}
      <path className="flow" d="M52 22 150 130" stroke={ink} strokeWidth="1.2" strokeDasharray="3 5" opacity=".6" />
    </svg>
  );
}

export function VizTypes() {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden="true">
      <g className="cycle cycle-1">
        {[0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={70 + c * 32} y={30 + r * 32} width="28" height="28" rx="5" fill={r === c ? gold : lav} opacity={r === c ? 1 : 0.55} />))}
        <text x="100" y="120" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }} fill={ink}>BINARY 2×2</text>
      </g>
      <g className="cycle cycle-2">
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={62 + c * 26} y={22 + r * 26} width="22" height="22" rx="4" fill={r === c ? gold : lav} opacity={r === c ? 1 : 0.5} />))}
        <text x="100" y="120" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }} fill={ink}>MULTICLASS k×k</text>
      </g>
      <g className="cycle cycle-3">
        {["A", "B", "C"].map((l, i) => (
          <g key={l}>
            <rect x={44 + i * 40} y="46" width="32" height="20" rx="10" fill={i === 1 ? "none" : gold} stroke={ink} strokeWidth="1.4" />
            <text x={60 + i * 40} y="60" textAnchor="middle" style={{ font: "500 10px var(--font-mono)" }} fill={ink}>{l}</text>
          </g>
        ))}
        <text x="100" y="120" textAnchor="middle" style={{ font: "500 9px var(--font-mono)", letterSpacing: ".1em" }} fill={ink}>MULTILABEL</text>
      </g>
    </svg>
  );
}

export const VIZ: Record<string, () => React.ReactElement> = {
  models: VizModels,
  split: VizSplit,
  matrices: VizMatrices,
  confusion: VizConfusion,
  types: VizTypes,
};

export const VIZ_CSS = `
.flow{animation:flow 1.4s linear infinite}
@keyframes flow{to{stroke-dashoffset:-16}}
.pulse{animation:pulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes pulse{50%{transform:scale(1.06);filter:brightness(1.12)}}
.split-line{animation:split 5s var(--ease-expo) infinite}
@keyframes split{0%,100%{transform:translateX(0)}50%{transform:translateX(-18px)}}
.cell-blink{animation:blink 3.3s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:.75}12%{opacity:.2}}
.cycle{opacity:0;animation:cyc 7.5s infinite}
.cycle-2{animation-delay:2.5s}.cycle-3{animation-delay:5s}
@keyframes cyc{0%{opacity:0}4%,30%{opacity:1}34%,100%{opacity:0}}
[data-motion="off"] .cycle-1{opacity:1}
`;
