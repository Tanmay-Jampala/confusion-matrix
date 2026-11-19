"use client";
import type { ReactNode } from "react";
import { attachWipe, useScene } from "@/lib/motion";

type Theme = "ink" | "deep" | "smoke" | "sand" | "purple";

/** Full-viewport themed section. `wipe` = diagonal clip-path wipe over the previous section. */
export default function Section({
  id,
  theme,
  wipe = false,
  grain = false,
  leather = false,
  className = "",
  label,
  children,
}: {
  id: string;
  theme: Theme;
  wipe?: boolean;
  grain?: boolean;
  leather?: boolean;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const ref = useScene<HTMLElement>((el) => {
    if (wipe) attachWipe(el);
  });
  return (
    <section
      ref={ref}
      id={id}
      data-section
      data-theme={theme}
      aria-label={label}
      className={`section ${wipe ? "wipe" : ""} ${leather ? "leather" : ""} ${className}`}
    >
      {grain && (
        <div className="grain-wrap" aria-hidden="true" data-pause>
          <div className="grain anim-loop" />
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}
