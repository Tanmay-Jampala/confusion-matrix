"use client";
import { useStore } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import LogoMark from "./LogoMark";

export default function Header() {
  const open = useStore((s) => s.menuOpen);
  const setOpen = useStore((s) => s.setMenuOpen);
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="wrap grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center gap-4 pointer-events-auto">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("top");
            }}
            aria-label="Confusion Matrix, back to top"
            className="hdr-ink"
          >
            <LogoMark size={28} />
          </a>
          <span className="mono hdr-muted hidden xl:inline text-[11px]">Applications of matrices · Classification</span>
        </div>
        <div className="text-center pointer-events-auto">
          <p className="display hdr-ink text-[clamp(1.25rem,2.1vw,1.9rem)] tracking-[-0.01em]">Confusion Matrix</p>
          <p className="mono hdr-muted hidden sm:block mt-1 text-[10px]">Experiential learning · Mathematics</p>
        </div>
        <div className="flex justify-end pointer-events-auto">
          <button
            type="button"
            className="burger hdr-ink grid h-11 w-11 place-items-center"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(!open)}
          >
            <svg width="30" height="18" viewBox="0 0 30 18" aria-hidden="true">
              <path d="M6 4 L26 1" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M4 16 L24 13" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <style>{`
        .site-header { --hdr: var(--color-bone); --hdr-m: var(--color-taupe); transition: color .5s var(--ease-ui); }
        html[data-header="light"] .site-header { --hdr: var(--color-ink-deep); --hdr-m: #4f483f; }
        html[data-menu="open"] .site-header { --hdr: var(--color-bone); --hdr-m: var(--color-taupe); }
        .hdr-ink { color: var(--hdr); transition: color .5s var(--ease-ui); }
        .hdr-muted { color: var(--hdr-m); transition: color .5s var(--ease-ui); }
        .burger svg path { transition: transform .5s var(--ease-expo); transform-origin: 15px 9px; }
        .burger[aria-expanded="true"] svg path:first-child { transform: translateY(5.5px) rotate(14deg); }
        .burger[aria-expanded="true"] svg path:last-child { transform: translateY(-5.5px) rotate(-26deg); }
      `}</style>
    </header>
  );
}
