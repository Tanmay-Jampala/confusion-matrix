"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";
import { generateTextures, TEXTURE_STEPS } from "@/lib/textures";
import { useStore } from "@/lib/store";
import LogoMark from "./LogoMark";

/**
 * Real progress: fonts (40%) + three generated textures (15% each) + window load (15%).
 * The displayed counter eases toward the real value; minimum on-screen time 900 ms.
 */
export default function Loader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const target = useRef(0);
  const shown = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const setLoaded = useStore((s) => s.setLoaded);

  useEffect(() => {
    const start = performance.now();
    const add = (n: number) => (target.current = Math.min(100, target.current + n));
    const fonts = (document.fonts?.ready ?? Promise.resolve()).then(() => add(40));
    const tex = generateTextures(() => add(45 / TEXTURE_STEPS));
    const load =
      document.readyState === "complete"
        ? Promise.resolve().then(() => add(15))
        : new Promise<void>((r) => window.addEventListener("load", () => (add(15), r()), { once: true }));
    // never trap the user behind the loader
    const failSafe = setTimeout(() => (target.current = 100), 6000);

    // timer-driven (not rAF) so the loader also completes in background tabs, where rAF is paused
    let timer = 0 as unknown as ReturnType<typeof setTimeout>;
    let finished = false;
    const tick = () => {
      shown.current += (target.current - shown.current) * 0.14 + 0.2;
      if (shown.current > target.current) shown.current = target.current;
      setPct(Math.round(shown.current));
      if (shown.current >= 99.5 && performance.now() - start > 900) {
        finished = true;
        return finish();
      }
      timer = setTimeout(tick, 16);
    };
    timer = setTimeout(tick, 16);
    void Promise.all([fonts, tex, load]);

    const finish = () => {
      setPct(100);
      clearTimeout(failSafe);
      const reduced = document.documentElement.dataset.motion === "off";
      const el = root.current;
      // GSAP runs on rAF, which is paused in hidden tabs: skip the exit animation there
      if (!el || document.hidden) return done();
      // and if frames are throttled anyway (background/embedded views), never leave the loader up
      setTimeout(done, 1800);
      if (reduced) {
        if (el) gsap.to(el, { opacity: 0, duration: 0.3, onComplete: done });
        else done();
        return;
      }
      gsap
        .timeline({ onComplete: done })
        .to(mark.current, { scale: 2.4, duration: 0.7, ease: "expo.inOut" }, 0)
        .to(el, { clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)", duration: 0.9, ease: "power3.inOut" }, 0.35);
    };
    let isDone = false;
    const done = () => {
      if (isDone) return;
      isDone = true;
      setGone(true);
      setLoaded();
      document.documentElement.dataset.loaded = "true";
    };
    return () => {
      if (!finished) clearTimeout(timer);
      clearTimeout(failSafe);
    };
  }, [setLoaded]);

  if (gone) return null;
  return (
    <div
      ref={root}
      className="loader fixed inset-0 z-[100] grid place-items-center bg-ink-deep text-bone"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="flex flex-col items-center gap-5">
        <div ref={mark}>
          <LogoMark size={40} />
        </div>
        <span className="mono tabular text-taupe" aria-hidden="true">
          {pct}%
        </span>
      </div>
    </div>
  );
}
