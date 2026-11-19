"use client";
import { useCallback, useRef, useState } from "react";
import { pinProgress, useScene } from "@/lib/motion";
import { useMotion } from "@/lib/store";
import { APPLICATIONS, TOOLS } from "@/content/site";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import CellIcon from "@/components/ui/CellIcon";
import DomainObject from "./DomainObject";

const N = APPLICATIONS.length;

function ErrorLines({ fp, fn }: { fp: string; fn: string }) {
  return (
    <dl className="flex flex-col gap-2 text-[14px]">
      <div className="flex gap-2.5">
        <dt className="mono flex shrink-0 items-center gap-1.5 pt-0.5 text-[10.5px] text-lavender">
          <CellIcon kind="alarm" size={11} /> FP
        </dt>
        <dd className="text-taupe-light">{fp}</dd>
      </div>
      <div className="flex gap-2.5">
        <dt className="mono flex shrink-0 items-center gap-1.5 pt-0.5 text-[10.5px] text-cta-yellow">
          <CellIcon kind="miss" size={11} /> FN
        </dt>
        <dd className="text-taupe-light">{fn}</dd>
      </div>
    </dl>
  );
}

function Marquee() {
  const row = [...TOOLS, ...TOOLS];
  return (
    <div className="relative overflow-hidden border-t border-bone/10 py-4">
      <p className="sr-only">Tools: {TOOLS.join(", ")}</p>
      <div className="anim-loop flex w-max animate-marquee-left gap-10" aria-hidden="true" data-pause>
        {[...row, ...row].map((t, i) => (
          <span key={i} className="display flex items-center gap-10 text-[1.6rem] text-taupe/70">
            {t}
            <span className="text-gold">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Applications() {
  const motion = useMotion();
  const [i, setI] = useState(0);
  const [all, setAll] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closeAll = useCallback(() => setAll(false), []);
  useFocusTrap(panel, all, closeAll);

  const track = useScene<HTMLDivElement>((el) => {
    const word = el.querySelector<HTMLElement>(".apps-word");
    pinProgress(el, (p) => {
      const s = Math.min(N - 1, Math.floor(p * N * 0.9999));
      setI((prev) => (prev === s ? prev : s));
      if (word) word.style.transform = `translate3d(${(4 - p * 10).toFixed(2)}vw,0,0)`;
    });
  });

  const app = APPLICATIONS[i];

  return (
    <section id="applications" data-section data-theme="ink" aria-labelledby="apps-title" className="section">
      <div className="grain-wrap" aria-hidden="true" data-pause>
        <div className="grain anim-loop" />
      </div>
      {motion ? (
        <div ref={track} className="pin-track" style={{ height: "var(--apps-h)" }}>
          <div className="pin-stage flex flex-col">
            <div className="relative flex-1">
              <h2 id="apps-title" className="apps-word giant leather-text absolute inset-x-0 top-[calc(var(--header-h)+4vh)] whitespace-nowrap text-center !text-[15.5vw] will-change-transform">
                Applications
              </h2>
              <div className="absolute left-1/2 top-[44%] h-[min(46vh,40vw)] w-[min(46vh,40vw)] -translate-x-1/2 -translate-y-1/2 max-md:top-[29%] max-md:h-[22vh] max-md:w-[22vh]">
                {APPLICATIONS.map((a, k) => (
                  <div key={a.id} className="absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ opacity: k === i ? 1 : 0, transform: `scale(${k === i ? 1 : 0.8}) rotate(${(k - i) * 8}deg)` }}>
                    <DomainObject id={a.id} className="h-full w-full" />
                  </div>
                ))}
              </div>
              <div className="wrap absolute inset-x-0 bottom-6 flex items-end justify-between gap-6">
                <div className="flex max-w-[460px] gap-5">
                  <ol className="flex flex-col gap-2 pt-1.5" aria-label="Applications">
                    {APPLICATIONS.map((a, k) => (
                      <li key={a.id}>
                        <span className={`block w-1.5 rounded-full transition-all duration-500 ${k === i ? "h-6 bg-gold-bright" : "h-1.5 bg-bone/30"}`} />
                      </li>
                    ))}
                  </ol>
                  <div key={app.id} className="animate-row-in flex flex-col gap-2" aria-live="polite">
                    <p className="mono text-[10.5px] text-gold">
                      {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {app.positive}
                    </p>
                    <h3 className="text-[20px] font-extrabold leading-tight text-bone">{app.title}</h3>
                    <p className="text-[14px] text-taupe-light">{app.body}</p>
                    <ErrorLines fp={app.fp} fn={app.fn} />
                    {app.caveat && <p className="rounded-[10px] border border-gold/50 bg-gold/10 px-3 py-2 text-[13px] text-bone">{app.caveat}</p>}
                  </div>
                </div>
                <button type="button" className="pill is-solid mb-1 shrink-0 max-sm:hidden" onClick={() => setAll(true)}>
                  View all
                </button>
              </div>
            </div>
            <Marquee />
          </div>
        </div>
      ) : (
        <div className="wrap section-pad flex flex-col gap-10">
          <h2 id="apps-title" className="giant leather-text">
            Applications
          </h2>
          <AllGrid />
          <Marquee />
        </div>
      )}
      {motion && (
        <div className="wrap pb-10 sm:hidden">
          <button type="button" className="pill is-solid" onClick={() => setAll(true)}>
            View all applications
          </button>
        </div>
      )}

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="All applications"
        className={`fixed inset-0 z-[72] overflow-y-auto bg-ink-deep/97 backdrop-blur-md transition-[opacity,visibility] duration-500 ${all ? "visible opacity-100" : "invisible opacity-0"}`}
        data-lenis-prevent
      >
        <div className="wrap py-[calc(var(--header-h)+1rem)]">
          <div className="mb-10 flex items-center justify-between gap-4">
            <p className="title text-bone">All applications</p>
            <button type="button" className="pill !h-11 !w-11 !justify-center !p-0 text-bone" onClick={closeAll} aria-label="Close all applications">
              ✕
            </button>
          </div>
          {all && <AllGrid />}
        </div>
      </div>
      <style>{`:root{--apps-h:calc(100vh * ${N})}@media (max-width:767px){:root{--apps-h:calc(70vh * ${N})}}`}</style>
    </section>
  );
}

function AllGrid() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {APPLICATIONS.map((a, k) => (
        <li key={a.id} className="flex flex-col gap-3 rounded-[16px] border border-bone/12 bg-smoke/60 p-5">
          <div className="h-28 w-28">
            <DomainObject id={a.id} className="h-full w-full" />
          </div>
          <p className="mono text-[10.5px] text-gold">
            {String(k + 1).padStart(2, "0")} · {a.positive}
          </p>
          <h3 className="text-[20px] font-extrabold text-bone">{a.title}</h3>
          <p className="text-[14px] text-taupe-light">{a.body}</p>
          <ErrorLines fp={a.fp} fn={a.fn} />
          {a.caveat && <p className="rounded-[10px] border border-gold/50 bg-gold/10 px-3 py-2 text-[13px] text-bone">{a.caveat}</p>}
        </li>
      ))}
    </ul>
  );
}
