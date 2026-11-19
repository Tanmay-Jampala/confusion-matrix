"use client";
import { useMotion, useStore } from "@/lib/store";

/** Bottom-right circular toggle with equaliser bars; bars stop when motion is off. */
export default function MotionToggle() {
  const motion = useMotion();
  const set = useStore((s) => s.setMotionOverride);
  return (
    <button
      type="button"
      onClick={() => set(!motion)}
      aria-pressed={motion}
      aria-label={motion ? "Motion on. Turn animations off" : "Motion off. Turn animations on"}
      title={motion ? "Turn motion off" : "Turn motion on"}
      className="eq-btn fixed bottom-5 right-5 z-[60] grid h-11 w-11 place-items-center rounded-full border border-bone/20 bg-ink-deep/90 text-gold-bright backdrop-blur-sm transition-transform hover:scale-105"
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="eq-bar block w-[3px] origin-bottom rounded-full bg-current"
            style={{
              height: "100%",
              animation: motion ? `sound-eq ${0.7 + i * 0.13}s ${i * -0.21}s ease-in-out infinite` : "none",
              transform: motion ? undefined : `scaleY(${[0.35, 0.6, 0.45, 0.3][i]})`,
            }}
          />
        ))}
      </span>
      <style>{`[data-motion="off"] .eq-bar{animation:none!important}`}</style>
    </button>
  );
}
