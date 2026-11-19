"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, requestRefresh, ScrollTrigger } from "@/lib/motion";
import { useMotion, useStore } from "@/lib/store";
import { setLenis } from "@/lib/scroll";

const STORAGE_KEY = "cm-motion";

/** Global motion wiring: reduced-motion detection, Lenis ↔ ScrollTrigger, header theme, reveals, off-screen pausing. */
export default function MotionProvider() {
  const motion = useMotion();
  const setSystemReduced = useStore((s) => s.setSystemReduced);
  const setMotionOverride = useStore((s) => s.setMotionOverride);
  const motionOverride = useStore((s) => s.motionOverride);

  // while the menu or the derivation drawer is open, the page behind is inert (not focusable, hidden from AT) and does not scroll
  const menuOpen = useStore((s) => s.menuOpen);
  const drawer = useStore((s) => s.drawer);
  useEffect(() => {
    const main = document.getElementById("main");
    const blocked = menuOpen || drawer !== null;
    if (main) main.inert = blocked;
    document.documentElement.style.overflow = blocked ? "hidden" : "";
    return () => {
      if (main) main.inert = false;
    };
  }, [menuOpen, drawer]);

  // system preference + saved override
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener("change", onChange);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "on") setMotionOverride(true);
      else if (saved === "off") setMotionOverride(false);
    } catch {}
    return () => mq.removeEventListener("change", onChange);
  }, [setSystemReduced, setMotionOverride]);

  useEffect(() => {
    try {
      if (motionOverride === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, motionOverride ? "on" : "off");
    } catch {}
  }, [motionOverride]);

  // data-motion + Lenis
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
    if (!motion) {
      setLenis(null);
      requestRefresh(0);
      return;
    }
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    requestRefresh(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [motion]);

  // header theme follows the section under the header line
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = 48;
      const sections = document.querySelectorAll<HTMLElement>("[data-theme][data-section]");
      let theme = "ink";
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) theme = s.dataset.theme || theme;
      });
      document.documentElement.dataset.header = theme === "sand" ? "light" : "dark";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // reveals + pausing off-screen loops + refresh ScrollTrigger when layout height changes
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const pause = new IntersectionObserver((entries) =>
      entries.forEach((e) => e.target.classList.toggle("is-offscreen", !e.isIntersecting)),
    );
    const scan = () => {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => reveal.observe(el));
      document.querySelectorAll("[data-pause]").forEach((el) => pause.observe(el));
    };
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    let t: ReturnType<typeof setTimeout>;
    let lastH = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(t);
      t = setTimeout(() => requestRefresh(0), 200);
    });
    ro.observe(document.body);
    return () => {
      reveal.disconnect();
      pause.disconnect();
      mo.disconnect();
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  return null;
}
