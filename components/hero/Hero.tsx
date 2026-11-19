"use client";
import { useCallback, useEffect, useRef } from "react";
import { gsap, pinProgress, seg, useScene } from "@/lib/motion";
import { useMotion, useStore } from "@/lib/store";
import { reportSequences } from "@/lib/metrics";
import { INTRO, TITLE } from "@/content/site";
import HeroMatrix3D from "./HeroMatrix3D";
import Handwriting from "./Handwriting";

/** Embossed sand-on-sand pattern of interlocking matrix brackets and grid cells. */
function MonogramPattern() {
  const motif = (
    <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 14H20v52h18" />
      <path d="M122 14h18v52h-18" />
      <rect x="52" y="22" width="24" height="24" rx="5" />
      <rect x="84" y="22" width="24" height="24" rx="5" />
      <rect x="52" y="54" width="24" height="24" rx="5" transform="translate(16 40)" />
      <path d="M118 94h-18v52h18M42 94h18v52H42" />
      <rect x="68" y="102" width="24" height="24" rx="5" transform="translate(-48 -8)" />
      <path d="M0 80h160M80 0v160" strokeWidth="1.2" opacity=".5" />
    </g>
  );
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="mono" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(-8) scale(1.6)">
          <g transform="translate(1.2 1.2)" stroke="rgb(255 250 240 / .55)">{motif}</g>
          <g transform="translate(-1 -1)" stroke="rgb(96 80 60 / .28)">{motif}</g>
        </pattern>
        <radialGradient id="mono-fade" cx="50%" cy="48%" r="62%">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity=".15" />
        </radialGradient>
        <mask id="mono-mask">
          <rect width="100%" height="100%" fill="url(#mono-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#mono)" mask="url(#mono-mask)" />
    </svg>
  );
}

/** A collectible-style card describing the illustrative dataset, with the two aligned label sequences. */
function DatasetCard() {
  const { actual, predicted } = reportSequences();
  const pos = actual.filter((v) => v === 1).length;
  return (
    <div className="card-gold anim-loop animate-card-float relative w-[min(250px,62vw)] rounded-[14px] bg-ink-deep p-4 text-bone" style={{ ["--float-r" as string]: "-2.5deg" }}>
      <div className="flex items-center justify-between">
        <span className="mono text-[9.5px] text-gold">Dataset card</span>
        <span className="mono text-[9.5px] text-taupe">No. 01</span>
      </div>
      <p className="display mt-3 text-[4.4rem] leading-[.8] text-gold-bright tabular">{actual.length}</p>
      <p className="mono mt-1 text-[10.5px] leading-snug">
        Observations · Illustrative
        <br />
        Positive = defective
      </p>
      <div className="mt-4 flex flex-col gap-1.5" aria-hidden="true">
        {[
          ["Actual", actual],
          ["Pred.", predicted],
        ].map(([label, seq]) => (
          <div key={label as string} className="flex items-center gap-2">
            <span className="mono w-12 shrink-0 text-[8.5px] text-taupe">{label as string}</span>
            <span className="flex h-3 flex-1 overflow-hidden rounded-[2px]">
              {(seq as number[]).map((v, i) => (
                <span key={i} className="h-full flex-1" style={{ background: v === 1 ? "var(--color-gold)" : "var(--color-purple-fog)" }} />
              ))}
            </span>
          </div>
        ))}
      </div>
      <div className="mono mt-3 flex justify-between border-t border-bone/15 pt-2 text-[9.5px] text-taupe">
        <span>Actual + {pos}</span>
        <span>Actual − {actual.length - pos}</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const motion = useMotion();
  const loaded = useStore((s) => s.loaded);
  const drawFn = useRef<((p: number) => void) | null>(null);
  const register = useCallback((fn: (p: number) => void) => {
    drawFn.current = fn;
  }, []);

  const track = useScene<HTMLDivElement>((el) => {
    const matrix = el.querySelector<HTMLElement>(".hero-matrix");
    const left = el.querySelector<HTMLElement>(".hero-left");
    const right = el.querySelector<HTMLElement>(".hero-right");
    drawFn.current?.(0);
    pinProgress(el, (p) => {
      drawFn.current?.(seg(p, 0.02, 0.55));
      if (matrix) matrix.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}vh, 0) scale(${(1 - p * 0.08).toFixed(3)})`;
      if (left) left.style.transform = `translate3d(0, ${(-p * 14).toFixed(2)}vh, 0)`;
      if (right) right.style.transform = `translate3d(0, ${(-p * 9).toFixed(2)}vh, 0)`;
    });
    return () => drawFn.current?.(1);
  });

  // rise in after the loader
  useEffect(() => {
    if (!loaded || !motion) return;
    const el = track.current?.querySelector(".hero-rise");
    if (el) gsap.fromTo(el, { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 1.6, ease: "expo.out", delay: 0.1 });
  }, [loaded, motion, track]);

  return (
    <div ref={track} className="pin-track hero-track" style={{ height: "var(--hero-h)" }} data-section data-theme="sand">
      <div className="pin-stage leather text-ink-deep">
        <MonogramPattern />
        <div className="wrap relative grid h-full grid-rows-[auto_1fr_auto] pt-[calc(var(--header-h)+.5rem)] pb-6">
          <div className="flex flex-col items-center gap-1">
          <p className="mono text-[10px] text-[#4f483f] xl:hidden">Applications of matrices · Classification</p>
          <h1 className="mono mx-auto max-w-[48ch] text-center text-[11px] leading-relaxed text-[#4f483f]">{TITLE}</h1>
          </div>

          <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
            <div className="hero-left order-2 flex flex-col items-center gap-4 md:order-1 md:items-start md:self-end md:pb-[6vh]">
              <div className="max-md:-my-8 max-md:scale-[.74]">
                <DatasetCard />
              </div>
              <p className="caption hidden max-w-[30ch] text-[#3d372f] sm:block">{INTRO.heroLeftCaption}</p>
            </div>
            <div className="hero-matrix order-1 flex justify-center md:order-2">
              <div className="hero-rise">
                <HeroMatrix3D />
              </div>
            </div>
            <div className="hero-right order-3 hidden flex-col items-end gap-3 text-right md:flex md:self-start md:pt-[8vh]">
              <Handwriting register={register} className="w-[min(440px,31vw)] drop-shadow-[0_1px_0_rgb(255_255_255/0.5)]" />
              <p className="caption max-w-[30ch] text-[#3d372f]">{INTRO.heroRightCaption}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-[#4f483f]" aria-hidden="true">
            <span className="mono text-[10px]">Scroll</span>
            <span className="anim-loop block h-6 w-px animate-scroll-hint-bob bg-current" />
          </div>
        </div>
      </div>
      <style>{`
        :root{--hero-h:220vh}
        @media (max-width:767px){:root{--hero-h:160vh}}
        [data-motion="off"] .hero-track .pin-stage{min-height:100svh}
      `}</style>
    </div>
  );
}
