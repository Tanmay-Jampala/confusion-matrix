"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/motion";
import { useMotion, useStore } from "@/lib/store";
import { computeBinary } from "@/lib/metrics";
import { D_LABEL, derivation, readout } from "@/lib/derivation";
import { ERROR_RATE, MEASURES } from "@/content/site";
import { UNDEFINED_NOTE } from "@/lib/format";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import Tex from "@/components/ui/Tex";
import Value from "@/components/ui/Value";

/** Step-by-step derivation drawer ("click to learn"), substituting the current counts. */
export default function DerivationDrawer() {
  const key = useStore((s) => s.drawer);
  const setDrawer = useStore((s) => s.setDrawer);
  const matrix = useStore((s) => s.matrix);
  const reset = useStore((s) => s.resetToReport);
  const motion = useMotion();
  const panel = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setDrawer(null), [setDrawer]);
  const open = key !== null;
  useFocusTrap(panel, open, close);

  const m = useMemo(() => computeBinary(matrix), [matrix]);
  const info = key && key !== "errorRate" ? MEASURES.find((x) => x.key === key) : null;

  useEffect(() => {
    const p = panel.current;
    const s = shade.current;
    if (!p || !s) return;
    if (open) {
      p.style.visibility = s.style.visibility = "visible";
      if (motion) {
        gsap.fromTo(p, { xPercent: 104 }, { xPercent: 0, duration: 0.8, ease: "expo.out" });
        gsap.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(p.querySelectorAll(".d-step"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.07, delay: 0.2 });
      } else {
        gsap.set(p, { xPercent: 0 });
        gsap.set(s, { opacity: 1 });
      }
    } else if (p.style.visibility === "visible") {
      const hide = () => void (p.style.visibility = s.style.visibility = "hidden");
      if (motion) {
        gsap.to(p, { xPercent: 104, duration: 0.55, ease: "power3.in", onComplete: hide });
        gsap.to(s, { opacity: 0, duration: 0.4 });
      } else hide();
    }
  }, [open, motion]);

  const lines = key ? derivation(key, m) : [];
  const value = key ? m[key] : null;

  return (
    <>
      <div ref={shade} className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-[2px]" style={{ visibility: "hidden" }} onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[560px] flex-col overflow-y-auto bg-ink-deep text-bone shadow-[-30px_0_80px_-20px_rgb(0_0_0/0.7)] border-l border-bone/10"
        style={{ visibility: "hidden" }}
        data-lenis-prevent
      >
        {key && (
          <div className="flex flex-col gap-7 p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono text-[11px] text-taupe">Step-by-step · current counts</p>
                <h2 id="drawer-title" className="title mt-2 !text-[clamp(2.4rem,5vw,3.6rem)]">
                  {D_LABEL[key]}
                </h2>
              </div>
              <button type="button" onClick={close} className="pill !h-11 !w-11 !justify-center !p-0 text-bone" aria-label="Close calculation">
                ✕
              </button>
            </div>
            {info && <p className="text-taupe-light d-step">{info.question}</p>}
            <p className="mono text-[11px] text-taupe d-step">
              TP = {m.counts.tp} · FN = {m.counts.fn} · FP = {m.counts.fp} · TN = {m.counts.tn} · Total = {m.total}
            </p>
            <ol className="flex flex-col gap-3">
              {lines.map((l, i) => (
                <li key={i} className="d-step flex items-start gap-4 rounded-[12px] border border-bone/10 bg-smoke/50 px-4 py-3">
                  <span className="mono mt-2 text-[10.5px] text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1 overflow-x-auto text-[1.02rem]">
                    <Tex tex={l} display />
                  </div>
                </li>
              ))}
            </ol>
            <div className="d-step flex items-baseline justify-between gap-4 border-y border-bone/12 py-5">
              <span className="mono text-[11px] text-taupe">Result</span>
              <span className="display text-[clamp(2.8rem,6vw,4rem)] text-gold-bright" aria-live="polite">
                <Value v={value} />
              </span>
            </div>
            <p className="mono text-[11.5px] text-taupe d-step">{readout(key, m)}</p>
            {value === null && <p className="caption text-taupe-light d-step">{UNDEFINED_NOTE}</p>}
            {info && <p className="text-taupe-light d-step leading-relaxed">{info.interpretation}</p>}
            {key === "errorRate" && (
              <div className="d-step">
                <Tex tex={ERROR_RATE.tex} display />
                <p className="text-taupe-light mt-2">
                  Error rate is the share of observations classified incorrectly. When every observation is counted exactly once, accuracy and error rate add up to 100%.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 d-step">
              <button type="button" className="pill text-bone" onClick={reset}>
                Reset to report example
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
