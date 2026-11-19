"use client";
import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/** Smooth-scroll to an element id (falls back to native jump when motion is off). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
  // move focus for keyboard and screen-reader users
  const focusTarget = (el.querySelector("h2, h1") as HTMLElement | null) ?? el;
  if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
  focusTarget.focus({ preventScroll: true });
}
