"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Lazy hydration. The server renders the children normally, so the static HTML is complete
 * (content, layout and pinned-track heights are all there without JavaScript).
 * On the client the first render keeps that HTML untouched (empty dangerouslySetInnerHTML +
 * suppressHydrationWarning, so React does not hydrate the subtree) and the real React tree
 * mounts only when the block comes within ~1.5 viewports, or receives focus or a pointer.
 * This takes the below-the-fold sections off the startup path.
 */
export default function Deferred({ children, margin = "150% 0px" }: { children: ReactNode; margin?: string }) {
  const isServer = typeof window === "undefined";
  const [live, setLive] = useState(isServer);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (live) return;
    const el = ref.current;
    if (!el) return;
    const wake = () => setLive(true);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && wake(), { rootMargin: margin });
    io.observe(el);
    // keyboard users tabbing in, or a click before it woke up
    el.addEventListener("focusin", wake, { once: true });
    el.addEventListener("pointerdown", wake, { once: true });
    return () => {
      io.disconnect();
      el.removeEventListener("focusin", wake);
      el.removeEventListener("pointerdown", wake);
    };
  }, [live, margin]);

  if (!live) return <div ref={ref} data-deferred suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />;
  return (
    <div ref={ref} data-deferred>
      {children}
    </div>
  );
}
