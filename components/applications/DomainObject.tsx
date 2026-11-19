/** Generated "3D" objects for each application domain: layered SVG extruded with CSS 3D and slowly rotated. */

const stroke = "var(--color-bone)";

function Shape({ id }: { id: string }) {
  switch (id) {
    case "manufacturing": // gear + check/cross chips
      return (
        <g>
          <path
            d="M100 22l9 2 3 15a62 62 0 0 1 14 6l13-8 13 13-8 13a62 62 0 0 1 6 14l15 3 2 9-2 9-15 3a62 62 0 0 1-6 14l8 13-13 13-13-8a62 62 0 0 1-14 6l-3 15-9 2-9-2-3-15a62 62 0 0 1-14-6l-13 8-13-13 8-13a62 62 0 0 1-6-14l-15-3-2-9 2-9 15-3a62 62 0 0 1 6-14l-8-13 13-13 13 8a62 62 0 0 1 14-6l3-15z"
            fill="var(--fill)"
            stroke={stroke}
            strokeWidth="2"
          />
          <circle cx="100" cy="100" r="30" fill="var(--color-ink)" stroke={stroke} strokeWidth="2" />
          <path d="M86 100l10 10 18-20" fill="none" stroke="var(--color-gold-bright)" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case "healthcare": // cross with pulse line
      return (
        <g>
          <path d="M75 25h50v50h50v50h-50v50H75v-50H25V75h50z" fill="var(--fill)" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <path d="M30 100h38l10-22 16 44 12-30 8 8h56" fill="none" stroke="var(--color-gold-bright)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "cybersecurity": // shield + keyhole
      return (
        <g>
          <path d="M100 20l66 24v50c0 42-28 72-66 86-38-14-66-44-66-86V44z" fill="var(--fill)" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="100" cy="88" r="16" fill="var(--color-ink)" stroke="var(--color-gold-bright)" strokeWidth="4" />
          <path d="M94 100h12l5 36H89z" fill="var(--color-gold-bright)" />
        </g>
      );
    case "agriculture": // leaf with veins + sensor dots
      return (
        <g>
          <path d="M40 160C30 90 80 30 168 30c4 84-48 136-128 130z" fill="var(--fill)" stroke={stroke} strokeWidth="2" />
          <path d="M44 156C80 120 120 78 160 38M86 116l-6-34M106 96l26 2M122 76l-4-24" fill="none" stroke="var(--color-gold-bright)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="132" cy="128" r="7" fill="var(--color-gold-bright)" />
          <circle cx="152" cy="150" r="5" fill={stroke} />
        </g>
      );
    default: // spam: envelope with flag
      return (
        <g>
          <rect x="24" y="48" width="152" height="108" rx="12" fill="var(--fill)" stroke={stroke} strokeWidth="2" />
          <path d="M28 56l72 54 72-54" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
          <path d="M140 18v54" stroke="var(--color-gold-bright)" strokeWidth="5" strokeLinecap="round" />
          <path d="M142 20h32l-9 12 9 12h-32z" fill="var(--color-gold-bright)" />
        </g>
      );
  }
}

export default function DomainObject({ id, className = "" }: { id: string; className?: string }) {
  const layers = [7, 6, 5, 4, 3, 2, 1];
  return (
    <div className={`dobj ${className}`} aria-hidden="true">
      <div className="dobj-rig anim-loop">
        {layers.map((l) => (
          <svg key={l} viewBox="0 0 200 200" className="dobj-layer" style={{ transform: `translateZ(${-l * 3}px)`, ["--fill" as string]: "#2c1352", opacity: 0.9 }}>
            <g style={{ filter: "brightness(.55)" }}>
              <Shape id={id} />
            </g>
          </svg>
        ))}
        <svg viewBox="0 0 200 200" className="dobj-layer" style={{ ["--fill" as string]: "var(--color-purple-rich)" }}>
          <Shape id={id} />
        </svg>
      </div>
      <style>{`
        .dobj{perspective:1200px}
        .dobj-rig{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:dobj-sway 9s ease-in-out infinite}
        .dobj-layer{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
        @keyframes dobj-sway{0%,100%{transform:rotateY(-28deg) rotateX(10deg) translateY(0)}50%{transform:rotateY(28deg) rotateX(-6deg) translateY(-12px)}}
      `}</style>
    </div>
  );
}
