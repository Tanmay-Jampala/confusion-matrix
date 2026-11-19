"use client";
import { useRef } from "react";
import { useStore, type LabTab } from "@/lib/store";
import Section from "@/components/ui/Section";
import CountsTab from "./CountsTab";
import LabelsTab from "./LabelsTab";
import ThresholdTab from "./ThresholdTab";
import MulticlassTab from "./MulticlassTab";

const TABS: { id: LabTab; label: string; n: string }[] = [
  { id: "counts", label: "Counts", n: "01" },
  { id: "labels", label: "Paste labels", n: "02" },
  { id: "threshold", label: "Threshold", n: "03" },
  { id: "multiclass", label: "Multiclass k×k", n: "04" },
];

const SOURCE_LABEL = { report: "report example", counts: "your counts", labels: "pasted labels", threshold: "threshold slider" } as const;

export default function Lab() {
  const tab = useStore((s) => s.labTab);
  const setTab = useStore((s) => s.setLabTab);
  const source = useStore((s) => s.source);
  const reset = useStore((s) => s.resetToReport);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[n].id);
    refs.current[n]?.focus();
  };

  return (
    <Section id="lab" theme="deep" wipe grain label="The Lab">
      <div className="wrap section-pad">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mono text-[11px] text-gold" data-reveal>
              03 · Interactive
            </p>
            <h2 className="giant mt-3 text-bone" data-reveal>
              The Lab
            </h2>
          </div>
          <div className="flex max-w-md flex-col gap-4 lg:items-end lg:text-right" data-reveal>
            <p className="text-taupe-light">
              Build a matrix four ways. Whatever you set here flows through the whole page: the hero matrix, the five measures and the results.
            </p>
            <div className="flex items-center gap-3 lg:justify-end">
              <span className="mono text-[10.5px] text-taupe" aria-live="polite">
                Source · {SOURCE_LABEL[source]}
              </span>
              <button type="button" className="pill !h-10 text-bone" onClick={reset}>
                Reset to report example
              </button>
            </div>
          </div>
        </div>

        <div className="sticky top-[calc(var(--header-h)-12px)] z-20 -mx-[var(--page-x)] mt-10 bg-gradient-to-b from-ink-deep via-ink-deep/95 to-ink-deep/0 px-[var(--page-x)] pb-5 pt-3">
          <div role="tablist" aria-label="Lab tools" className="no-scrollbar flex gap-2 overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onKey(e, i)}
                className="pill shrink-0 text-bone"
              >
                <span className="opacity-60">{t.n}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="mt-6 outline-none" key={tab}>
          <div className="animate-row-in">
            {tab === "counts" && <CountsTab />}
            {tab === "labels" && <LabelsTab />}
            {tab === "threshold" && <ThresholdTab />}
            {tab === "multiclass" && <MulticlassTab />}
          </div>
        </div>
      </div>
    </Section>
  );
}
