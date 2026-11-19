"use client";
import { useEffect, useRef } from "react";
import { useMotion, useStore } from "@/lib/store";
import type { Binary } from "@/lib/metrics";

type K = keyof Binary;
const TILES: { k: K; label: string; tone: "gold" | "purple" | "taupe" }[] = [
  { k: "tp", label: "True positive", tone: "gold" },
  { k: "fn", label: "False negative · miss", tone: "taupe" },
  { k: "fp", label: "False positive · false alarm", tone: "purple" },
  { k: "tn", label: "True negative", tone: "gold" },
];

/**
 * CSS-3D confusion matrix: four thick glass tiles. Follows the cursor with a lerped tilt.
 * `size` scales everything via --tile.
 */
export default function HeroMatrix3D({ follow = true, spin = false, className = "", tile }: { follow?: boolean; spin?: boolean; className?: string; tile?: string }) {
  const m = useStore((s) => s.matrix);
  const motion = useMotion();
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rig.current;
    if (!el || !follow || !motion) return;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--rx", `${(-cy * 8).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(cx * 11).toFixed(2)}deg`);
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [follow, motion]);

  return (
    <div className={`hm-scene ${className}`} aria-hidden="true" style={tile ? ({ ["--tile" as string]: tile } as React.CSSProperties) : undefined}>
      <div ref={rig} className={`hm-rig ${spin ? "hm-spin anim-loop" : ""}`}>
        {TILES.map(({ k, label, tone }) => (
          <div key={k} className={`hm-tile hm-${tone}`}>
            {[5, 4, 3, 2, 1].map((d) => (
              <span key={d} className="hm-slab" style={{ transform: `translateZ(calc(var(--depth) * -${d} / 5))` }} />
            ))}
            <div className="hm-face">
              <span className="hm-k mono">{k.toUpperCase()}</span>
              <span className="hm-n display tabular">{m[k]}</span>
              <span className="hm-l mono">{label}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .hm-scene{--tile:clamp(120px,15vw,230px);--gap:calc(var(--tile)*.07);--depth:calc(var(--tile)*.16);perspective:1600px;width:calc(var(--tile)*2 + var(--gap));height:calc(var(--tile)*2 + var(--gap))}
        .hm-rig{--rx:0deg;--ry:0deg;position:relative;width:100%;height:100%;display:grid;grid-template-columns:1fr 1fr;gap:var(--gap);transform-style:preserve-3d;transform:rotateX(calc(16deg + var(--rx))) rotateY(calc(-20deg + var(--ry))) rotateZ(3deg);transition:transform .1s linear}
        .hm-spin{animation:spin-slow 24s linear infinite}
        .hm-tile{position:relative;transform-style:preserve-3d;border-radius:calc(var(--tile)*.09)}
        .hm-slab{position:absolute;inset:0;border-radius:inherit;background:var(--slab)}
        .hm-face{position:absolute;inset:0;border-radius:inherit;display:flex;flex-direction:column;justify-content:space-between;padding:calc(var(--tile)*.09);background:var(--face);box-shadow:inset 0 1px 0 rgb(255 255 255 / .45),inset 0 0 0 1px rgb(255 255 255 / .16),var(--glow);overflow:hidden}
        .hm-face::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgb(255 255 255 / .34) 0%,rgb(255 255 255 / .06) 38%,transparent 55%);pointer-events:none}
        .hm-k{font-size:calc(var(--tile)*.065);opacity:.85}
        .hm-n{font-size:calc(var(--tile)*.5);line-height:.8;letter-spacing:-.03em}
        .hm-l{font-size:calc(var(--tile)*.045);letter-spacing:.1em;opacity:.8}
        .hm-gold{--face:linear-gradient(150deg,#f6d585 0%,var(--color-gold-bright) 30%,var(--color-gold) 75%,#a87a2c 100%);--slab:#7d5a1e;--glow:0 0 calc(var(--tile)*.35) rgb(242 199 102 / .45);color:var(--color-ink-deep)}
        .hm-purple{--face:linear-gradient(150deg,#7d64a6 0%,var(--color-purple-fog) 50%,var(--color-purple-shade) 100%);--slab:#1c1428;--glow:0 18px 40px -20px rgb(0 0 0 / .6);color:var(--color-bone)}
        .hm-taupe{--face:linear-gradient(150deg,#958b7f 0%,var(--color-taupe-deep) 55%,#4f483f 100%);--slab:#2f2a24;--glow:0 18px 40px -20px rgb(0 0 0 / .6);color:var(--color-bone)}
      `}</style>
    </div>
  );
}
