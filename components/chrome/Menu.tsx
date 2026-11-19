"use client";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { useStore, useMotion } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { COURSE_LINE } from "@/content/site";
import { asset } from "@/lib/paths";

const LINKS = [
  ["Home", "top"],
  ["Matrix", "mathematics"],
  ["Metrics", "measures"],
  ["Lab", "lab"],
  ["Compare", "compare"],
  ["Applications", "applications"],
  ["Code", "code"],
  ["Results", "results"],
  ["Team", "team"],
] as const;

export default function Menu() {
  const open = useStore((s) => s.menuOpen);
  const setOpen = useStore((s) => s.setMenuOpen);
  const motion = useMotion();
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useFocusTrap(panel, open, close);

  useEffect(() => {
    document.documentElement.dataset.menu = open ? "open" : "closed";
    const el = panel.current;
    if (!el) return;
    if (open) {
      el.style.visibility = "visible";
      if (motion) {
        gsap.fromTo(el, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.8, ease: "power3.inOut" });
        gsap.fromTo(el.querySelectorAll(".menu-link"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.045, delay: 0.25 });
      } else el.style.clipPath = "none";
    } else if (el.style.visibility === "visible") {
      if (motion)
        gsap.to(el, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", duration: 0.6, ease: "power3.inOut", onComplete: () => void (el.style.visibility = "hidden") });
      else el.style.visibility = "hidden";
    }
  }, [open, motion]);

  return (
    <div
      ref={panel}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-40 bg-ink-deep text-bone"
      style={{ visibility: "hidden" }}
    >
      <div className="grain-wrap">
        <div className="grain" />
      </div>
      <nav className="wrap relative flex h-full flex-col justify-between pt-[calc(var(--header-h)+1rem)] pb-8" aria-label="Sections">
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 xl:grid-cols-3">
          {LINKS.map(([label, id], i) => (
            <li key={id} className="overflow-hidden">
              <a
                href={`#${id}`}
                className="menu-link display group flex items-baseline gap-3 py-1 text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[0.95] text-bone hover:text-gold-bright focus-visible:text-gold-bright transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setTimeout(() => scrollToId(id), motion ? 350 : 0);
                }}
              >
                <span className="mono text-[11px] text-taupe group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 border-t border-bone/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex gap-6 text-[15px]">
            <a href={asset("/report.pdf")} className="link-draw" download>
              Report PDF
            </a>
            <a
              href="#references"
              className="link-draw"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                setTimeout(() => scrollToId("references"), motion ? 350 : 0);
              }}
            >
              References
            </a>
          </div>
          <p className="text-[11px] text-taupe">{COURSE_LINE}</p>
        </div>
      </nav>
    </div>
  );
}
