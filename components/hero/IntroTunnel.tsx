"use client";
import { useEffect, useRef } from "react";
import { pinProgress, useScene } from "@/lib/motion";
import { useMotion, useStore } from "@/lib/store";
import { INTRO } from "@/content/site";

type Streak = { x: number; y: number; z: number; pz: number; hue: number; w: number; glyph: string | null };

const COLORS = ["#6c4aa2", "#9179c3", "#9e6de9", "#7c83f2", "#b9a6ff", "#4f2bab"];
const N_DESKTOP = 620;
const N_MOBILE = 300;
const DEPTH = 1600;

/**
 * Scroll-scrubbed tunnel of light streaks (Canvas 2D). Some streaks are glowing 0/1 digits.
 * Camera speed follows scroll progress; the end of the track fades into the sand hero.
 */
export default function IntroTunnel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const prog = useRef(0);
  const motion = useMotion();
  // nothing is visible under the loader: animate only once it has gone
  const loaded = useStore((st) => st.loaded);

  const track = useScene<HTMLDivElement>((el) => {
    pinProgress(el, (p) => {
      prog.current = p;
      el.style.setProperty("--p", p.toFixed(4));
    });
  });

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d", { alpha: false });
    if (!ctx) return;
    let w = 0,
      h = 0,
      dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.75);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    // deterministic layout so the static (reduced-motion) frame is stable
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const spawn = (s: Partial<Streak> = {}, initial = false): Streak => {
      // place on a cylinder around the camera axis, leaving a clear centre
      const a = rnd() * Math.PI * 2;
      const r = 120 + rnd() * 900;
      const z = initial ? rnd() * DEPTH : DEPTH;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.62, z, pz: z, hue: (rnd() * COLORS.length) | 0, w: 0.6 + rnd() * 1.8, glyph: rnd() < 0.09 ? (rnd() < 0.5 ? "0" : "1") : null, ...s };
    };
    const streaks = Array.from({ length: window.innerWidth < 768 ? N_MOBILE : N_DESKTOP }, () => spawn({}, true));

    let raf = 0;
    let visible = true;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      const p = prog.current;
      const speed = motion ? (4 + p * 70 + Math.pow(p, 3) * 90) * dt : 0;
      const fov = Math.min(w, h) * 0.9;
      const cx = w / 2;
      const cy = h / 2;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(11,10,15,${motion ? 0.42 : 1})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const s of streaks) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z < 4) Object.assign(s, spawn());
        const k = fov / s.z;
        const kp = fov / (motion ? s.pz + speed * 2.2 + 18 : s.z + 70);
        const x = cx + s.x * k;
        const y = cy + s.y * k;
        const px = cx + s.x * kp;
        const py = cy + s.y * kp;
        const near = 1 - s.z / DEPTH;
        const alpha = Math.min(1, near * 1.4) * 0.9;
        if (s.glyph) {
          const size = Math.max(6, 22 * k * 0.5);
          if (size > 140) continue;
          ctx.font = `600 ${size}px ui-monospace, monospace`;
          // cheap glow (shadowBlur is very slow in Canvas 2D): a soft disc, then the digit
          ctx.fillStyle = `rgba(242,199,102,${alpha * 0.16})`;
          ctx.beginPath();
          ctx.arc(x + size * 0.3, y - size * 0.35, size * 0.75, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(242,199,102,${alpha * 0.95})`;
          ctx.fillText(s.glyph, x, y);
        } else {
          ctx.strokeStyle = COLORS[s.hue];
          ctx.globalAlpha = alpha;
          ctx.lineWidth = s.w * (0.4 + near * 2.2);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      // central glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.45);
      g.addColorStop(0, `rgba(158,109,233,${0.12 + p * 0.25})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (motion && loaded && visible) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && motion && loaded) raf = requestAnimationFrame(draw);
    });
    io.observe(c);
    if (!motion || !loaded) {
      // one static frame (reduced motion, or still behind the loader)
      draw(performance.now());
    } else raf = requestAnimationFrame(draw);
    const onResize = () => {
      resize();
      if (!motion) draw(performance.now());
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [motion, loaded]);

  return (
    <div ref={track} className="pin-track intro-track" style={{ height: "var(--intro-h)" }} data-section data-theme="ink" id="top">
      <div className="pin-stage bg-ink">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div className="intro-copy pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="mono text-[11px] text-gold-bright">Experiential learning · Matrix Algebra and Calculus</p>
          <p className="display mt-5 max-w-[14ch] text-[clamp(3.2rem,9vw,9rem)] text-bone">{INTRO.question}</p>
        </div>
        <div className="intro-hint absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-taupe" aria-hidden="true">
          <span className="mono text-[10.5px]">Scroll to enter</span>
          <span className="anim-loop block h-7 w-px animate-scroll-hint-bob bg-taupe" />
        </div>
        <div className="intro-fade pointer-events-none absolute inset-0 leather" aria-hidden="true" />
      </div>
      <style>{`
        :root{--intro-h:220vh}
        @media (max-width:767px){:root{--intro-h:140vh}}
        .intro-track{--p:0}
        .intro-copy{opacity:calc(1 - max(0, (var(--p) - .35) * 3.2));transform:scale(calc(1 + var(--p) * .35))}
        .intro-hint{opacity:calc(1 - var(--p) * 6)}
        .intro-fade{opacity:calc(max(0, (var(--p) - .72) * 3.7))}
        [data-motion="off"] .intro-track{height:auto!important}
        [data-motion="off"] .intro-track .pin-stage{height:100svh;min-height:600px}
        [data-motion="off"] .intro-fade{opacity:0}
      `}</style>
    </div>
  );
}

