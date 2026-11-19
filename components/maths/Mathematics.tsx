"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Flip } from "gsap/Flip";
import { gsap } from "@/lib/motion";
import { useMotion } from "@/lib/store";
import { CONCEPTS, INTRO } from "@/content/site";
import Section from "@/components/ui/Section";
import Tex from "@/components/ui/Tex";
import { VIZ, VIZ_CSS } from "./MiniVisuals";
import Construction from "./Construction";
import ConventionToggle from "./ConventionToggle";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

export default function Mathematics() {
  const motion = useMotion();
  const [open, setOpen] = useState<string | null>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const choose = (id: string | null) => {
    if (motion && root.current) flipState.current = Flip.getState(root.current.querySelectorAll("[data-flip-id]"));
    setOpen(id);
  };

  // shared-layout transition: the tile's visual morphs into the reading panel's visual
  useLayoutEffect(() => {
    const st = flipState.current;
    flipState.current = null;
    if (st && root.current) {
      Flip.from(st, { duration: 0.85, ease: "expo.inOut", absolute: true, scale: true, nested: true });
    }
    if (open && panelRef.current) {
      if (motion) gsap.fromTo(panelRef.current.querySelectorAll(".rp-in"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, delay: 0.25, ease: "expo.out" });
      panelRef.current.focus({ preventScroll: true });
    }
  }, [open, motion]);

  const concept = CONCEPTS.find((c) => c.id === open);

  return (
    <Section id="mathematics" theme="sand" wipe leather label="The mathematics">
      <div ref={root} className="wrap section-pad text-ink-deep">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="mono text-[11px] text-[#6b430c]" data-reveal>
              02 · The mathematics
            </p>
            <h2 className="title mt-3" data-reveal>
              {INTRO.question}
            </h2>
          </div>
          <div className="flex flex-col gap-3" data-reveal>
            <p className="mono text-[11px] text-[#4f483f]">Learning goal</p>
            <p className="text-[17px] leading-snug">{INTRO.goal}</p>
            <p className="text-[#3d372f]">{INTRO.lede}</p>
          </div>
        </div>

        {/* five concept tiles */}
        <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Concepts">
          {CONCEPTS.map((c, i) => {
            const V = VIZ[c.id];
            const active = open === c.id;
            return (
              <li key={c.id} data-reveal style={{ transitionDelay: `${i * 0.08}s` }}>
                <button
                  type="button"
                  onClick={() => choose(active ? null : c.id)}
                  aria-expanded={active}
                  aria-controls="reading-panel"
                  className={`group flex h-full w-full flex-col gap-3 rounded-[16px] border p-3 text-left transition-[transform,background,border-color,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_40px_-24px_rgb(23_18_32/.55)] ${active ? "border-ink-deep bg-taupe-light" : "border-ink-deep/20 bg-taupe-light/55 hover:bg-taupe-light"}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-sand/70">
                    {!active && (
                      <div data-flip-id={`viz-${c.id}`} className="h-full w-full">
                        <V />
                      </div>
                    )}
                  </div>
                  <span className="mono text-[10.5px] text-[#6b430c]">§ {c.n}</span>
                  <span className="display text-[1.55rem] leading-[.9]">{c.title}</span>
                  <span className="mono text-[10.5px] normal-case tracking-normal text-[#4f483f]">{c.short}</span>
                  <span className="link-draw mono mt-auto self-start text-[10.5px]">{active ? "Close" : "Read more"}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          id="reading-panel"
          ref={panelRef}
          tabIndex={-1}
          aria-live="polite"
          className={`outline-none ${concept ? "mt-6" : ""}`}
        >
          {concept && (
            <article className="grid grid-cols-1 gap-8 rounded-[20px] bg-ink-deep p-6 text-bone sm:p-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]" aria-labelledby="rp-title">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-sand">
                <div data-flip-id={`viz-${concept.id}`} className="h-full w-full">
                  {(() => {
                    const V = VIZ[concept.id];
                    return <V />;
                  })()}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="mono rp-in text-[11px] text-gold">Report § {concept.n}</p>
                <h3 id="rp-title" className="title rp-in !text-[clamp(2.2rem,4vw,3.4rem)]">
                  {concept.title}
                </h3>
                {concept.tex?.map((t) => (
                  <div key={t} className="rp-in overflow-x-auto text-[1.05rem] text-gold-bright">
                    <Tex tex={t} display />
                  </div>
                ))}
                {concept.body.map((p) => (
                  <p key={p.slice(0, 20)} className="rp-in max-w-prose text-taupe-light">
                    {p}
                  </p>
                ))}
                <button type="button" className="pill rp-in mt-2 self-start text-bone" onClick={() => choose(null)}>
                  Close reading panel
                </button>
              </div>
            </article>
          )}
        </div>

        <Construction />
        <ConventionToggle />
      </div>
      <style>{VIZ_CSS}</style>
    </Section>
  );
}
