"use client";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { detectClasses, fromLabels, LabelError, parseLabels, reportSequences } from "@/lib/metrics";
import Tex from "@/components/ui/Tex";

/** Report §9: a dashboard that accepts actual and predicted labels and builds the matrix. */
export default function LabelsTab() {
  const setMatrix = useStore((s) => s.setMatrix);
  const setMulti = useStore((s) => s.setMulti);
  const setLabTab = useStore((s) => s.setLabTab);
  const [actualText, setActualText] = useState("");
  const [predText, setPredText] = useState("");
  const [positive, setPositive] = useState("");

  const actual = useMemo(() => parseLabels(actualText), [actualText]);
  const predicted = useMemo(() => parseLabels(predText), [predText]);
  const classes = useMemo(() => detectClasses(actual, predicted), [actual, predicted]);

  // effective positive class: the chosen one, else "1" if present, else the first class seen
  const pos = classes.includes(positive) ? positive : classes.includes("1") ? "1" : (classes[0] ?? "");

  const result = useMemo(() => {
    if (actual.length === 0 && predicted.length === 0) return { kind: "empty" as const };
    try {
      if (classes.length > 2) return { kind: "multi" as const };
      if (classes.length < 2) {
        const r = fromLabels(actual, predicted, pos);
        return { kind: "ok" as const, r, note: "Only one class was found, so one row of the matrix is empty." };
      }
      return { kind: "ok" as const, r: fromLabels(actual, predicted, pos) };
    } catch (e) {
      return { kind: "error" as const, message: e instanceof LabelError ? e.message : "These labels could not be read." };
    }
  }, [actual, predicted, pos, classes.length]);

  // push valid binary results into the shared matrix
  useEffect(() => {
    if (result.kind === "ok") setMatrix(result.r, "labels");
  }, [result, setMatrix]);

  const loadExample = () => {
    const { actual: a, predicted: p } = reportSequences();
    setActualText(a.join(", "));
    setPredText(p.join(", "));
    setPositive("1");
  };

  const toMulticlass = () => {
    const idx = new Map(classes.map((c, i) => [c, i]));
    const mat = classes.map(() => classes.map(() => 0));
    const n = Math.min(actual.length, predicted.length);
    for (let i = 0; i < n; i++) mat[idx.get(actual[i])!][idx.get(predicted[i])!]++;
    setMulti({ classes: classes.slice(0, 5), matrix: mat.slice(0, 5).map((r) => r.slice(0, 5)) });
    setLabTab("multiclass");
  };

  const lenError = actual.length > 0 && predicted.length > 0 && actual.length !== predicted.length;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
      <div className="flex flex-col gap-5">
        <p className="text-taupe-light max-w-prose">
          Paste two aligned sequences: position <em>i</em> in both lists is the same observation. Separate values with commas, spaces or new lines. Use 0/1
          or any class names.
        </p>
        {[
          ["labels-actual", "Actual labels", actualText, setActualText, actual.length],
          ["labels-pred", "Predicted labels", predText, setPredText, predicted.length],
        ].map(([id, label, value, set, count]) => (
          <div key={id as string} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor={id as string} className="mono text-[11px] text-bone">
                {label as string}
              </label>
              <span className="mono text-[10.5px] text-taupe tabular">{count as number} values</span>
            </div>
            <textarea
              id={id as string}
              value={value as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value)}
              rows={4}
              spellCheck={false}
              aria-invalid={lenError || undefined}
              aria-describedby="labels-status"
              placeholder="1, 1, 0, 1, 0 …"
              className="w-full resize-y rounded-[12px] border border-bone/15 bg-smoke/60 p-4 font-mono text-[13px] text-bone placeholder:text-taupe/70 outline-none focus-visible:border-gold-bright"
              data-lenis-prevent
            />
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="labels-positive" className="mono text-[11px] text-bone">
              Positive class
            </label>
            <select
              id="labels-positive"
              value={pos}
              onChange={(e) => setPositive(e.target.value)}
              disabled={classes.length === 0}
              className="h-11 min-w-[160px] rounded-full border border-bone/25 bg-ink-deep px-4 font-mono text-[13px] text-bone"
            >
              {classes.length === 0 && <option value="">—</option>}
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="pill text-bone" onClick={loadExample}>
            Load report example
          </button>
          <button
            type="button"
            className="pill text-taupe"
            onClick={() => {
              setActualText("");
              setPredText("");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div id="labels-status" aria-live="polite" className="flex flex-col gap-4">
        {result.kind === "empty" && (
          <p className="rounded-[12px] border border-dashed border-bone/20 p-5 text-taupe">
            Waiting for labels. Try <strong className="text-bone">Load report example</strong>: 45 actual positives followed by 55 negatives, and the model&apos;s 100
            predictions.
          </p>
        )}
        {result.kind === "error" && (
          <p role="alert" className="rounded-[12px] border border-lavender/60 bg-lavender/10 p-5 text-bone">
            <span className="mono block text-[11px] text-lavender">Check the input</span>
            {result.message}
          </p>
        )}
        {result.kind === "multi" && (
          <div className="rounded-[12px] border border-gold/50 bg-gold/10 p-5">
            <p className="mono text-[11px] text-gold-bright">{classes.length} classes detected</p>
            <p className="mt-2 text-taupe-light">
              {classes.join(", ")}. A binary matrix needs two classes. Build a {Math.min(classes.length, 5)} × {Math.min(classes.length, 5)} matrix in the
              multiclass tab instead{classes.length > 5 ? " (the first five classes are kept)" : ""}.
            </p>
            {lenError ? (
              <p className="mt-2 text-lavender">Fix the length mismatch first: {actual.length} actual vs {predicted.length} predicted.</p>
            ) : (
              <button type="button" className="pill is-solid mt-4" onClick={toMulticlass}>
                Open in multiclass tab
              </button>
            )}
          </div>
        )}
        {result.kind === "ok" && (
          <div className="flex flex-col gap-4 rounded-[14px] border border-bone/12 p-5">
            <p className="mono text-[11px] text-gold-bright">
              Matrix built from {actual.length} observations · positive = “{pos}”
            </p>
            {"note" in result && result.note && <p className="caption text-taupe">{result.note}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mono text-[10.5px] text-taupe">This site&apos;s layout</p>
                <Tex
                  display
                  tex={String.raw`\begin{bmatrix}TP & FN\\ FP & TN\end{bmatrix}=\begin{bmatrix}${result.r.tp} & ${result.r.fn}\\ ${result.r.fp} & ${result.r.tn}\end{bmatrix}`}
                />
              </div>
              <div>
                <p className="mono text-[10.5px] text-taupe">scikit-learn, labels=[neg, pos]</p>
                <Tex
                  display
                  tex={String.raw`\begin{bmatrix}TN & FP\\ FN & TP\end{bmatrix}=\begin{bmatrix}${result.r.sklearn[0][0]} & ${result.r.sklearn[0][1]}\\ ${result.r.sklearn[1][0]} & ${result.r.sklearn[1][1]}\end{bmatrix}`}
                />
              </div>
            </div>
            <p className="caption text-taupe">
              Sent to the shared matrix: the Counts tab, the five measures and the hero now show these counts.
            </p>
            <button type="button" className="pill self-start text-bone" onClick={() => setLabTab("counts")}>
              View in Counts tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
