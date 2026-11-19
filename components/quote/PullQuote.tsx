"use client";
import { pinProgress, seg, useScene } from "@/lib/motion";
import { QUOTE } from "@/content/site";

/** Fixed quote over a purple vignette with grain; lines unmask one by one as you scroll. */
export default function PullQuote() {
  const track = useScene<HTMLDivElement>((el) => {
    const lines = Array.from(el.querySelectorAll<HTMLElement>(".q-line > span"));
    const body = el.querySelector<HTMLElement>(".q-body");
    lines.forEach((l) => (l.style.transform = "translateY(105%)"));
    if (body) body.style.opacity = "0";
    pinProgress(el, (p) => {
      lines.forEach((l, i) => {
        const t = seg(p, 0.08 + i * 0.14, 0.3 + i * 0.14);
        l.style.transform = `translateY(${((1 - (1 - Math.pow(1 - t, 3))) * 105).toFixed(2)}%)`;
      });
      if (body) body.style.opacity = String(seg(p, 0.55, 0.75));
    });
    return () => {
      lines.forEach((l) => (l.style.transform = ""));
      if (body) body.style.opacity = "";
    };
  });

  return (
    <div ref={track} className="pin-track" style={{ height: "var(--q-h)" }} data-section data-theme="purple">
      <figure className="pin-stage vignette relative flex min-h-[max(100svh,700px)] flex-col items-center justify-center px-[var(--page-x)] text-center">
        <div className="grain-wrap" aria-hidden="true" data-pause>
          <div className="grain anim-loop" />
        </div>
        <span className="display relative text-[3.2rem] leading-none text-taupe" aria-hidden="true">
          “
        </span>
        <blockquote className="relative mt-2">
          <p className="giant !text-[clamp(2.8rem,7.4vw,8.6rem)] !leading-[.9] text-taupe">
            {QUOTE.lines.map((l) => (
              <span key={l} className="q-line block overflow-hidden pb-[.04em]">
                <span className="block will-change-transform">{l}</span>
              </span>
            ))}
          </p>
        </blockquote>
        <figcaption className="q-body relative mt-8 max-w-[52ch] text-[15px] text-bone">
          {QUOTE.body[0]}
          <br />
          {QUOTE.body[1]}
          <span className="mono mt-4 block text-[10.5px] text-taupe">Report § 5.4 · § 8</span>
        </figcaption>
      </figure>
      <style>{`:root{--q-h:170vh}@media (max-width:767px){:root{--q-h:110vh}}`}</style>
    </div>
  );
}
