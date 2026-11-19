"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "./store";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const EASE = {
  expo: "expo.out",
  wipe: "power3.inOut",
  ui: "power2.inOut",
};

/**
 * Coalesced ScrollTrigger.refresh(): many scenes mount (or hydrate lazily) close together,
 * and each full refresh forces a layout of the whole page. Batch them into one.
 */
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
export function requestRefresh(delay = 120) {
  if (typeof window === "undefined") return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), delay);
}

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Runs `build` inside a gsap.context only while motion is enabled.
 * Everything created (tweens, ScrollTriggers) is reverted when motion turns off or on unmount.
 */
export function useScene<T extends HTMLElement>(build: (root: T) => void | (() => void), deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const motion = useMotion();
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    let extra: void | (() => void);
    const ctx = gsap.context(() => {
      extra = build(el);
    }, el);
    requestRefresh();
    return () => {
      if (typeof extra === "function") extra();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion, ...deps]);
  return ref;
}

/** Progress (0..1) of a tall pin track whose sticky child fills the viewport. */
export function pinProgress(track: HTMLElement, onUpdate: (p: number) => void, snapSteps?: number) {
  return ScrollTrigger.create({
    trigger: track,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (st) => onUpdate(st.progress),
    snap: snapSteps
      ? { snapTo: 1 / snapSteps, duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: "power2.inOut", directional: true }
      : undefined,
  });
}

/** Diagonal wipe: drives --wipe from 1 (slanted, hidden edge) to 0 as the section's top reaches the top of the viewport. */
export function attachWipe(section: HTMLElement) {
  section.style.setProperty("--wipe", "1");
  return ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "top 15%",
    scrub: 0.4,
    onUpdate: (st) => section.style.setProperty("--wipe", String(1 - gsap.parseEase("power2.inOut")(st.progress))),
    onLeave: () => section.style.setProperty("--wipe", "0"),
  });
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Map p in [a,b] → [0,1] */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
