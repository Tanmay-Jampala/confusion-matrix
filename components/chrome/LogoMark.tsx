/** 2×2 grid glyph: four rounded squares, the diagonal (correct) pair in gold. */
export default function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect x="1" y="1" width="12" height="12" rx="3.2" fill="var(--color-gold)" />
      <rect x="15" y="1" width="12" height="12" rx="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.9" />
      <rect x="1" y="15" width="12" height="12" rx="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.9" />
      <rect x="15" y="15" width="12" height="12" rx="3.2" fill="var(--color-gold)" />
    </svg>
  );
}
