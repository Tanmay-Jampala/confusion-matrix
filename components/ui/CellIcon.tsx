/** Icons that carry the cell meaning without relying on colour: ✓ correct, flag = false alarm, hollow ring = miss. */
export default function CellIcon({ kind, size = 14 }: { kind: "correct" | "alarm" | "miss"; size?: number }) {
  if (kind === "correct")
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "alarm")
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 14.5V2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4.5 2.5h8l-2 3 2 3h-8z" fill="currentColor" />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2.2" />
    </svg>
  );
}

export const KIND_LABEL = { correct: "Correct prediction", alarm: "False alarm", miss: "Miss" } as const;
export const KIND_COLOR = {
  correct: "var(--color-gold)",
  alarm: "var(--color-lavender)",
  miss: "var(--color-cta-yellow)",
} as const;
