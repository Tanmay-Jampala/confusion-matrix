"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { attachWipe, gsap, pinProgress, useScene } from "@/lib/motion";
import { useMotion, useStore } from "@/lib/store";
import { computeBinary, type BinaryMetrics } from "@/lib/metrics";
import { pct } from "@/lib/format";
import { fracLine } from "@/lib/derivation";
import { MEASURES, ERROR_RATE } from "@/content/site";
import Value from "@/components/ui/Value";

const N = MEASURES.length;

function statLine(i: number, m: BinaryMetrics) {
  const meas = MEASURES[i];
  return `${meas.formula} · ${fracLine(m.parts[meas.key])}`;
}

/** Percentage ruler 0…100, styled like yard markers, with a marker at `value` (0..1 or null). */
function Ruler({ value, compact = false }: { value: number | null; compact?: boolean }) {
  const marks = Array.from({ length: 11 }, (_, i) => i * 10);
  return (
    <div className={`ruler relative w-full ${compact ? "h-[64px]" : "h-[clamp(90px,14vh,150px)]"}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px bg-bone/20" />
      {marks.map((v) => (
        <div key={v} className="absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center justify-between" style={{ left: `${v}%` }}>
          <span className={`yard display tabular ${v % 20 ? "max-sm:invisible" : ""} ${compact ? "text-[1.3rem]" : "text-[clamp(1.6rem,3.6vw,3.6rem)]"}`}>{v}</span>
          <span className="block h-[38%] w-px bg-bone/25" />
        </div>
      ))}
      {/* minor ticks */}
      {Array.from({ length: 51 }, (_, i) => i * 2).map((v) =>
        v % 10 ? <span key={v} className="absolute bottom-[12%] block h-2 w-px bg-bone/15" style={{ left: `${v}%` }} /> : null,
      )}
      <div className="ruler-marker absolute top-[8%] bottom-0 transition-[left,opacity] duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)]" style={{ left: `${(value ?? 0) * 100}%`, opacity: value === null ? 0.25 : 1 }}>
        <span className="absolute bottom-0 top-0 left-0 w-[2px] -translate-x-1/2 bg-gold-bright shadow-[0_0_18px_rgb(242_199_102/.7)]" />
        <span className="absolute -top-2 left-0 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[11px] border-x-transparent border-t-gold-bright" />
      </div>
      <style>{`.yard{color:transparent;-webkit-text-stroke:1.2px rgb(244 239 230 / .55);line-height:1}`}</style>
    </div>
  );
}

function PlayCard({ i, m, onOpen }: { i: number; m: BinaryMetrics; onOpen: () => void }) {
  const meas = MEASURES[i];
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onOpen}
        className="group grid h-14 w-14 shrink-0 place-items-center rounded-full border border-bone/30 text-bone transition-colors duration-500 hover:border-gold-bright hover:bg-gold-bright hover:text-ink-deep"
        aria-label={`Show the step-by-step calculation of ${meas.title}`}
      >
        <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
          <path d="M1 1.5v13l12-6.5z" fill="currentColor" />
        </svg>
      </button>
      <div>
        <p className="mono text-[13px] text-bone">{meas.title}</p>
        <p className="mono mt-1 text-[11px] text-taupe">{statLine(i, m)}</p>
        {meas.key === "accuracy" && (
          <p className="mono mt-1 text-[11px] text-taupe">
            Error rate {ERROR_RATE.formula} · {fracLine(m.parts.errorRate)} = {pct(m.errorRate)}
          </p>
        )}
      </div>
    </div>
  );
}

/** Counts up/down to the new value when the step or the counts change. */
function Numeral({ value }: { value: number | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(value ?? 0);
  const motion = useMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return;
    if (!motion) {
      el.textContent = pct(value);
      last.current = value;
      return;
    }
    const o = { v: last.current };
    const tw = gsap.to(o, { v: value, duration: 1, ease: "expo.out", onUpdate: () => void (el.textContent = pct(o.v)) });
    last.current = value;
    return () => void tw.kill();
  }, [value, motion]);
  if (value === null) return <Value v={null} />;
  return (
    <span ref={ref} className="tabular">
      {pct(value)}
    </span>
  );
}

export default function FiveMeasures() {
  const motion = useMotion();
  const matrix = useStore((s) => s.matrix);
  const setDrawer = useStore((s) => s.setDrawer);
  const m = useMemo(() => computeBinary(matrix), [matrix]);
  const [step, setStep] = useState(0);

  const track = useScene<HTMLDivElement>((el) => {
    const title = el.querySelector<HTMLElement>(".fm-title");
    pinProgress(el, (p) => {
      const s = Math.min(N - 1, Math.floor(p * N * 0.9999));
      setStep((prev) => (prev === s ? prev : s));
      if (title) title.style.transform = `translate3d(${(-p * 8).toFixed(2)}vw,0,0)`;
      el.style.setProperty("--fm-p", p.toFixed(4));
    });
  });

  const meas = MEASURES[step];
  const v = m[meas.key];

  return (
    <section id="measures" data-section data-theme="ink" aria-labelledby="measures-title" className="section wipe" ref={useWipe()}>
      <div className="grain-wrap" aria-hidden="true" data-pause>
        <div className="grain anim-loop" />
      </div>
      {motion ? (
        <div ref={track} className="pin-track" style={{ height: "var(--measures-h)" }}>
          <div className="pin-stage">
            <div className="wrap relative flex h-full flex-col justify-between pt-[calc(var(--header-h)+1rem)] pb-[4vh]">
              <div className="flex items-start justify-between gap-6">
                <h2 id="measures-title" className="fm-title giant leather-text will-change-transform md:whitespace-nowrap">
                  The five measures
                </h2>
              </div>

              <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto]">
                <div className="flex flex-col gap-3">
                  <p className="mono text-[11px] text-gold">
                    {String(step + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {meas.question}
                  </p>
                  <p className="display text-[length:var(--fs-numeral)] leading-[.8] text-bone" aria-live="polite">
                    <Numeral value={v} />
                  </p>
                </div>
                <div key={step} className="animate-row-in max-w-md">
                  <PlayCard i={step} m={m} onOpen={() => setDrawer(meas.key)} />
                </div>
              </div>

              <Ruler value={v} />

              <div className="flex items-center justify-between">
                <ol className="flex gap-2" aria-label="Measures">
                  {MEASURES.map((x, i) => (
                    <li key={x.key}>
                      <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-gold-bright" : "w-3 bg-bone/25"}`} />
                    </li>
                  ))}
                </ol>
                <p className="mono pr-14 text-[10.5px] text-taupe">Live values · follow the Lab</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="wrap section-pad flex flex-col gap-14">
          <h2 id="measures-title" className="giant leather-text">
            The five measures
          </h2>
          {MEASURES.map((x, i) => (
            <div key={x.key} className="flex flex-col gap-5 border-t border-bone/15 pt-8">
              <p className="mono text-[11px] text-gold">
                {String(i + 1).padStart(2, "0")} / 05 · {x.question}
              </p>
              <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto]">
                <p className="display text-[clamp(3.5rem,9vw,8rem)] leading-[.8] text-bone">
                  <Value v={m[x.key]} />
                </p>
                <PlayCard i={i} m={m} onOpen={() => setDrawer(x.key)} />
              </div>
              <Ruler value={m[x.key]} compact />
            </div>
          ))}
        </div>
      )}
      <style>{`
        :root{--measures-h:calc(150vh * ${N})}
        @media (max-width:767px){:root{--measures-h:calc(70vh * ${N})}}
      `}</style>
    </section>
  );
}

function useWipe() {
  return useScene<HTMLElement>((el) => {
    attachWipe(el);
  });
}
