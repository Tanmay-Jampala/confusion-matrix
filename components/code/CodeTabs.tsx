"use client";
import { useRef, useState } from "react";
import Section from "@/components/ui/Section";

export type Snippet = { id: string; label: string; section: string; code: string; html: string; what: string; output: string };

export default function CodeTabs({ snippets, ravel }: { snippets: Snippet[]; ravel: string }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = snippets[active];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(s.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = e.key === "ArrowRight" ? (i + 1) % snippets.length : e.key === "ArrowLeft" ? (i - 1 + snippets.length) % snippets.length : -1;
    if (n < 0) return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  };

  return (
    <Section id="code" theme="smoke" grain label="The code">
      <div className="wrap section-pad">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mono text-[11px] text-gold" data-reveal>
              06 · Program implementation · Report § 6
            </p>
            <h2 className="giant mt-3 text-bone" data-reveal>
              The code
            </h2>
          </div>
          <p className="max-w-md text-taupe-light" data-reveal>
            The report&apos;s own Python and MATLAB, unchanged. Run it in Jupyter, Google Colab or any Python environment; the counting logic needs no machine-learning
            library at all.
          </p>
        </div>

        <div role="tablist" aria-label="Code examples" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-1">
          {snippets.map((sn, i) => (
            <button
              key={sn.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`code-tab-${sn.id}`}
              aria-selected={i === active}
              aria-controls="code-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className="pill shrink-0 text-bone"
            >
              {sn.label}
            </button>
          ))}
        </div>

        <div id="code-panel" role="tabpanel" aria-labelledby={`code-tab-${s.id}`} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-[16px] border border-bone/10 bg-ink-deep">
            <div className="flex items-center justify-between border-b border-bone/10 px-4 py-2.5">
              <span className="mono text-[10.5px] text-taupe">
                § {s.section} · {s.id === "matlab" ? "example.m" : "example.py"}
              </span>
              <button type="button" onClick={copy} className="pill !h-8 !px-3 text-[10.5px] text-bone" aria-live="polite">
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <div key={s.id} className="code-body animate-row-in overflow-x-auto p-4 text-[13px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: s.html }} tabIndex={0} aria-label={`${s.label} code`} data-lenis-prevent />
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <p className="mono text-[11px] text-gold">What this does</p>
              <p className="mt-2 text-taupe-light">{s.what}</p>
            </div>
            <div>
              <p className="mono text-[11px] text-gold">Expected output</p>
              <pre className="mt-2 overflow-x-auto rounded-[12px] border border-bone/10 bg-ink-deep p-4 font-mono text-[12px] leading-relaxed text-bone" data-lenis-prevent>
                {s.output}
              </pre>
            </div>
            {(s.id === "scratch" || s.id === "python") && (
              <div className="rounded-[12px] border border-lavender/60 bg-lavender/10 p-4">
                <p className="mono text-[11px] text-lavender">The ravel() order pitfall</p>
                <p className="mt-2 text-[14px] text-bone">{ravel}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .code-body pre{background:transparent!important;counter-reset:ln;margin:0}
        .code-body code{display:block;font-family:var(--font-mono);font-weight:500}
        .code-body .line{counter-increment:ln;display:inline-block;min-height:1.7em}
        .code-body .line::before{content:counter(ln);display:inline-block;width:2.2em;margin-right:1em;text-align:right;color:#8d857a;user-select:none}
      `}</style>
    </Section>
  );
}
