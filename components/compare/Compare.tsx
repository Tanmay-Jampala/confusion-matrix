"use client";
import { useMemo, useState } from "react";
import { pinProgress, useScene } from "@/lib/motion";
import { useMotion } from "@/lib/store";
import { computeBinary, MODEL_B, REPORT_EXAMPLE, type Binary } from "@/lib/metrics";
import { pct } from "@/lib/format";
import { COMPARE } from "@/content/site";
import Section from "@/components/ui/Section";
import Value from "@/components/ui/Value";

const A = computeBinary(REPORT_EXAMPLE);
const B = computeBinary(MODEL_B);
const ROWS = [
  ["accuracy", "Accuracy"],
  ["precision", "Precision"],
  ["recall", "Recall"],
  ["f1", "F1-score"],
  ["specificity", "Specificity"],
] as const;

function MiniHeat({ c, label }: { c: Binary; label: string }) {
  const max = Math.max(c.tp, c.fn, c.fp, c.tn);
  const cells: [keyof Binary, string, string][] = [
    ["tp", "TP", "var(--color-gold)"],
    ["fn", "FN · miss", "var(--color-cta-yellow)"],
    ["fp", "FP · false alarm", "var(--color-lavender)"],
    ["tn", "TN", "var(--color-gold)"],
  ];
  return (
    <div className="grid grid-cols-2 gap-1.5" role="img" aria-label={`${label}: TP ${c.tp}, FN ${c.fn}, FP ${c.fp}, TN ${c.tn}`}>
      {cells.map(([k, l, col]) => {
        const a = c[k] / max;
        return (
          <div
            key={k}
            className="flex aspect-[5/4] flex-col justify-between rounded-[10px] p-2.5"
            style={{ background: `color-mix(in srgb, ${col} ${Math.round(14 + a * 70)}%, var(--color-smoke))`, color: a > 0.6 ? "var(--color-ink-deep)" : "var(--color-bone)" }}
          >
            <span className="mono text-[9.5px]">{l}</span>
            <span className="display tabular text-[2.4rem] leading-none">{c[k]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Mirrored bars: Model A grows left, Model B grows right. */
function MirroredBars() {
  return (
    <div className="flex flex-col gap-3" role="img" aria-label={ROWS.map(([k, l]) => `${l}: A ${pct(A[k])}, B ${pct(B[k])}`).join("; ")}>
      <div className="mono grid grid-cols-[1fr_96px_1fr] text-[10px] text-taupe">
        <span className="text-right">Model A</span>
        <span />
        <span>Model B</span>
      </div>
      {ROWS.map(([k, l]) => (
        <div key={k} className="grid grid-cols-[1fr_96px_1fr] items-center gap-0">
          <div className="flex items-center justify-end gap-2">
            <span className="mono text-[10.5px] text-bone tabular">{pct(A[k])}</span>
            <span className="bar-grow block h-3 origin-right rounded-l-full bg-gold" style={{ width: `${(A[k] ?? 0) * 100 * 0.62}%` }} />
          </div>
          <span className="mono text-center text-[9.5px] text-taupe">{l}</span>
          <div className="flex items-center gap-2">
            <span className="bar-grow block h-3 origin-left rounded-r-full bg-lavender" style={{ width: `${(B[k] ?? 0) * 100 * 0.62}%` }} />
            <span className="mono text-[10.5px] text-bone tabular">{pct(B[k])}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Compare() {
  const motion = useMotion();
  const [priority, setPriority] = useState<"miss" | "alarm">("miss");
  const preferred = priority === "miss" ? "B" : "A";

  const track = useScene<HTMLDivElement>((el) => {
    const strip = el.querySelector<HTMLElement>(".cmp-strip");
    if (!strip) return;
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;
    pinProgress(el, (p) => {
      const dist = Math.max(0, strip.scrollWidth - (strip.parentElement?.clientWidth ?? window.innerWidth));
      strip.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    });
  });

  const cards = useMemo(
    () => [
      {
        key: "a",
        rot: "-1.6deg",
        body: (
          <>
            <p className="mono text-[11px] text-gold">Model A · 36 / 9 / 11 / 44</p>
            <MiniHeat c={REPORT_EXAMPLE} label="Model A" />
            <p className="caption text-taupe-light">More conservative about predicting positive: fewer false alarms (11), more misses (9).</p>
          </>
        ),
      },
      {
        key: "b",
        rot: "1.4deg",
        body: (
          <>
            <p className="mono text-[11px] text-lavender">Model B · 40 / 5 / 15 / 40</p>
            <MiniHeat c={MODEL_B} label="Model B" />
            <p className="caption text-taupe-light">Detects more actual positives: fewer misses (5), more false alarms (15).</p>
          </>
        ),
      },
      {
        key: "same",
        rot: "-0.8deg",
        body: (
          <>
            <p className="mono text-[11px] text-taupe">Accuracy, both models</p>
            <p className="display text-[5.5rem] leading-[.8] text-bone">{pct(A.accuracy)}</p>
            <p className="mono text-[11px] text-taupe">
              A: ({REPORT_EXAMPLE.tp} + {REPORT_EXAMPLE.tn}) / {A.total} · B: ({MODEL_B.tp} + {MODEL_B.tn}) / {B.total}
            </p>
            <p className="caption text-taupe-light">{COMPARE.intro}</p>
          </>
        ),
      },
      {
        key: "bars",
        rot: "1.1deg",
        body: (
          <>
            <p className="mono text-[11px] text-taupe">Where they differ</p>
            <MirroredBars />
          </>
        ),
      },
    ],
    [],
  );

  return (
    <Section id="compare" theme="smoke" grain label="Same accuracy, different mistakes">
      <div ref={track} className="pin-track cmp-track" style={{ height: motion ? "var(--cmp-h)" : "auto" }}>
        <div className="pin-stage flex flex-col justify-center gap-10 pt-[var(--header-h)]">
          <div className="wrap">
            <p className="mono text-[11px] text-gold">04 · Compare · Report § 5.12, § 7.3</p>
            <h2 className="giant mt-3 !text-[clamp(3.4rem,9vw,10rem)] text-bone">
              {COMPARE.headline[0]}
              <br />
              <span className="text-gold-bright">{COMPARE.headline[1]}</span>
            </h2>
          </div>
          <div className="overflow-hidden max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory no-scrollbar" data-lenis-prevent-touch>
            <div className="cmp-strip flex w-max gap-5 px-[var(--page-x)] pb-6 will-change-transform">
              {cards.map((c, i) => (
                <article
                  key={c.key}
                  className="anim-loop animate-card-float flex w-[min(380px,82vw)] shrink-0 snap-center flex-col gap-4 rounded-[18px] border border-bone/12 bg-ink-deep/85 p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/.8)]"
                  style={{ ["--float-r" as string]: c.rot, animationDelay: `${i * -1.7}s` }}
                >
                  {c.body}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap pb-28 pt-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-[14px]">
              <caption className="mono mb-3 text-left text-[11px] text-taupe">Same 100 observations · 45 actual positives · 55 actual negatives</caption>
              <thead>
                <tr className="mono text-[10.5px] text-taupe">
                  <th scope="col" className="py-2 text-left font-medium">Measure</th>
                  <th scope="col" className="text-right font-medium text-gold">Model A</th>
                  <th scope="col" className="text-right font-medium text-lavender">Model B</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {(["tp", "fn", "fp", "tn"] as const).map((k) => (
                  <tr key={k} className="border-t border-bone/10">
                    <th scope="row" className="py-2 text-left font-normal text-taupe">{k.toUpperCase()}</th>
                    <td className="text-right text-bone">{REPORT_EXAMPLE[k]}</td>
                    <td className="text-right text-bone">{MODEL_B[k]}</td>
                  </tr>
                ))}
                {ROWS.map(([k, l]) => {
                  const a = A[k] ?? 0;
                  const b = B[k] ?? 0;
                  return (
                    <tr key={k} className="border-t border-bone/10">
                      <th scope="row" className="py-2 text-left font-normal text-bone">{l}</th>
                      <td className={`text-right ${a > b ? "text-gold-bright" : "text-bone"}`}><Value v={A[k]} /></td>
                      <td className={`text-right ${b > a ? "text-lavender" : "text-bone"}`}><Value v={B[k]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="caption mt-4 text-taupe">{COMPARE.f1Note}</p>
          </div>

          <div className="flex flex-col gap-5">
            <p className="mono text-[11px] text-taupe">What matters more?</p>
            <div role="radiogroup" aria-label="What matters more?" className="flex flex-wrap gap-2">
              {(
                [
                  ["miss", "Missing a positive"],
                  ["alarm", "False alarms"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" role="radio" aria-checked={priority === k} className="pill text-bone" onClick={() => setPriority(k)}>
                  {l}
                </button>
              ))}
            </div>
            <div aria-live="polite" className="rounded-[16px] border p-6 transition-colors duration-500" style={{ borderColor: preferred === "A" ? "var(--color-gold)" : "var(--color-lavender)" }}>
              <p className="display text-[3rem] leading-none" style={{ color: preferred === "A" ? "var(--color-gold-bright)" : "var(--color-lavender)" }}>
                Model {preferred} may be preferred
              </p>
              <p className="mt-3 text-taupe-light">{priority === "miss" ? COMPARE.missFirst : COMPARE.alarmFirst}</p>
            </div>
            <p className="text-taupe">{COMPARE.noWinner}</p>
          </div>
        </div>
      </div>
      <style>{`
        :root{--cmp-h:300vh}
        @media (max-width:767px){:root{--cmp-h:auto}.cmp-strip{transform:none!important}}
        .bar-grow{animation:bar-grow 1.2s var(--ease-expo) both}
        @keyframes bar-grow{from{transform:scaleX(0)}}
      `}</style>
    </Section>
  );
}
