# PLAN — "Confusion Matrix" cinematic explainer

Source of truth: `docs/report.pdf` (21 pages, read in full; copied from `Downloads/Experiential Learning_Report MATHS final.pdf`).
Parity source: https://confusionmatrixbyvaris.netlify.app (checked: all 9 checklist items in brief §4 are there).

---

## 0. Open decisions (need your answer before phase (g))

1. **The report PDF contains every student's USN on its cover page, and a group photo on page 21.** The brief says "do not publish USNs" *and* "copy `docs/report.pdf` into `public/` for download". These conflict.
   **Recommendation:** publish a redacted copy, `public/report.pdf`, made at build time with `pdf-lib`: a filled box over the USN column on page 1, and page 21 (group photo) removed. Leave the original in `docs/` (not deployed).
   Alternatives: publish no PDF, or publish it unchanged.
2. **Project location.** The current folder is an unrelated project (eigenvalues / learning rate). The new site lives entirely in `confusion-matrix-site/`, with its own `package.json`. Netlify base directory = `confusion-matrix-site`.

## 1. Findings from the report that shape the build

- **Two matrix layouts appear in the report.** §5.3 states `C = [[TN, FP], [FN, TP]]` as "one common convention"; §5.4, §5.6 and the brief use `[[TP, FN], [FP, TN]]` (positive row first). §6.2, §6.5 and §7.1 use the TN-first scikit-learn/MATLAB layout `[[44, 11], [9, 36]]`. The site's default is **positive-first** (matches the current site's caption "Positive class is shown in the first row"). The convention toggle in §3.4 and the Results table (TN-first, as printed in §7.1) make the switch explicit.
- **§7.1 column totals:** predicted negative = 53, predicted positive = 47. Shown computed.
- **Zero-denominator convention (§5.11, §6.3):** "mathematically undefined; software may return 0 with a warning". The engine returns `null`; the UI shows "undefined" with that sentence as the tooltip.
- **§7.2 caveat** ("not enough to establish that a real system is safe… no uncertainty interval") goes under the Results table.
- **Typos fixed in copy:** Evalution→Evaluation, confution matrix documention→confusion matrix documentation, mathematices→mathematics. **Links fixed:** `scikitlearn.org`→`scikit-learn.org` (refs 1–2), `crashcourse`→`crash-course` (§4 source link; ref 3 is already correct). "Géron" restored (the PDF has a broken é).
- **Team (names + contributions only):** order and wording as in the brief §3.11; it matches the report's table.

---

## 2. Stack and folder layout

Next.js 15 App Router + TypeScript, `output: 'export'`, `images.unoptimized`. Tailwind v4 (`@theme` in `globals.css`). GSAP + ScrollTrigger, Lenis (driven from `gsap.ticker`). KaTeX (static formulas rendered to HTML at build time in server components; live derivations rendered client-side). Shiki at build time in a server component. Zustand for shared state. Vitest for `lib/`.

**three.js: not planned.** The hero matrix is CSS 3D (`preserve-3d` tiles with glass gradients, an inner rim and a gold glow). The intro tunnel is Canvas 2D (about 600 projected streaks plus about 80 glyph sprites). Both reach the look at a fraction of the weight, which protects the Lighthouse ≥ 85 target. three.js is added (lazy) only if the phase (d) review shows the CSS hero falls short.

```
confusion-matrix-site/
  app/
    layout.tsx            fonts, <html> theme, skip link, SVG filter defs, providers
    page.tsx              section order
    globals.css           @theme tokens, keyframes, utilities, reduced-motion layer
  components/
    chrome/               Loader, Header, Menu, MotionToggle, Grain, SkipLink, Wipe
    textures/             leather.ts (canvas → blob URL), MonogramPattern.tsx, Noise.tsx
    hero/                 IntroTunnel.tsx (canvas), Hero.tsx, HeroMatrix3D.tsx, DatasetCard.tsx, Handwriting.tsx
    measures/             FiveMeasures.tsx, PercentRuler.tsx, MomentCard.tsx, DerivationDrawer.tsx
    maths/                Mathematics.tsx, ConceptTile.tsx (+5 mini-visuals), ReadingPanel.tsx, ConstructionSequence.tsx, ConventionToggle.tsx
    lab/                  Lab.tsx, CountsTab.tsx, MatrixEditor.tsx, Heatmap.tsx, StatusLabel.tsx, LabelsTab.tsx, ThresholdTab.tsx, Distribution.tsx, PRCurve.tsx, ROCCurve.tsx, MulticlassTab.tsx
    compare/              Compare.tsx, MirroredBars.tsx, PriorityToggle.tsx
    quote/                PullQuote.tsx
    applications/         Applications.tsx, DomainObject.tsx (5 SVG objects), ViewAllPanel.tsx, Marquee.tsx
    code/                 CodeSection.tsx (server: Shiki), CodeTabs.tsx (client), CopyButton.tsx
    results/              Results.tsx, ResultsTables.tsx, FutureScope.tsx
    footer/               Footer.tsx, Team.tsx, References.tsx
    ui/                   Pill.tsx, Tabs.tsx, Drawer.tsx (focus trap + Esc), Tex.tsx, Tooltip.tsx, Stepper.tsx
  content/                report-derived copy as typed TS objects (one file per section) + code snippets (.py/.m)
  lib/
    metrics.ts            pure maths, no React (see §5)
    seededScores.ts       PRNG + score generator for the Threshold tab
    format.ts             pct(x) → "76.60%" | "undefined", int formatting
    store.ts              Zustand: matrix, source, motion flag, lab tab
    motion.ts             GSAP/Lenis setup, reduced-motion gate, easings
  tests/metrics.test.ts
  docs/report.pdf         original (not deployed)
  public/report.pdf       redacted copy (see decision 1)
  netlify.toml            [build] command = "npm run build", publish = "out"
```

## 3. Design tokens (Tailwind v4 `@theme`)

**Colours:** all 21 values from brief §2.1 as `--color-ink`, `--color-ink-deep`, … `--color-cta-yellow`. Semantic aliases:
`--color-correct: gold` · `--color-correct-strong: gold-bright` · `--color-false-alarm: lavender` (FP) · `--color-miss: taupe-deep` (FN, with a cta-yellow/40 edge). Each always has a label and an icon: ✓ check (correct), ⚑ flag (false alarm), ∅ hollow circle (miss).
**Section themes:** `[data-theme="ink|sand|purple|smoke"]` sets `--theme-bg/-fg/-accent/-surface`. The header reads the theme of the section under it (ScrollTrigger `onToggle` sets `data-header-theme`), with `mix-blend-mode: difference` on the wordmark only.
**AA contrast checks to verify in phase (g):** taupe #b0a89d on ink #0b0a0f ≈ 8.6:1 ✓; purple-display on ink is decorative only (giant words, `aria-hidden`); body text on sand uses ink-deep.

**Type:**
| Token | Font | Use |
|---|---|---|
| `--font-display` | Big Shoulders Display 700–900 (fallback Anton) | uppercase, `leading-[.86]`, `tracking-[-0.02em]` |
| `--font-body` | Inter Tight 400/800 | 15px / 1.55 / 0.15px |
| `--font-mono` | JetBrains Mono 500 | uppercase, 11–13px, 0.14em |

All three are self-hosted via `next/font/google` (downloaded at build, served from `/_next`).
Scale: `--fs-title: clamp(2.75rem, 4.7vw, 4.4rem)` · `--fs-giant: clamp(5rem, 14vw, 15rem)` · `--fs-numeral: clamp(4rem, 11vw, 11rem)` · `--fs-caption: .78rem` · `--fs-mono: .75rem`.
**Units:** `--content-max: 1728px`, `--page-x: clamp(16px, 3vw, 48px)`, `--rail-x: calc(var(--page-x) + 3rem)`, `--vu: min(1vw, 1.8 * max(1vh, 7px))` (capped at 17.28px past 1728w), `--section-min: max(100svh, 700px)`.
**Easings:** `--ease-expo: cubic-bezier(.16,1,.3,1)`, `--ease-wipe: cubic-bezier(.65,.05,.36,1)`, `--ease-ui: cubic-bezier(.4,0,.2,1)`.
**Keyframes:** `marquee-left`, `marquee-right`, `card-float` (translateY ±8px, rotate ±1.2deg, 7s), `scroll-hint-bob`, `row-in`, `cell-drop` (from -40px, overshoot via `cubic-bezier(.34,1.56,.64,1)`), `strip-in`, `sound-eq` (4 bars, staggered scaleY).

**Textures (all generated):**
- Grain: one 128px canvas noise tile → blob URL, stepped across 4 offsets at 8fps by a CSS `steps()` animation; `opacity .07`; paused under reduced motion.
- Leather: 512px tile drawn once with SVG `feTurbulence(baseFrequency .9, octaves 3) + feDiffuseLighting` into a canvas → blob URL in `--tex-leather` (sand variant) and `--tex-leather-purple`. Used on sand sections, and as `background-clip:text` inside giant words.
- Monogram pattern: SVG `<pattern>` of interlocking `[ ]` brackets and 2×2 grid cells, sand-on-sand, with an `feSpecularLighting` emboss.
- Quote vignette: `radial-gradient(purple-deep → ink)` + grain.

## 4. Section list + scroll / animation map

Heights are desktop / mobile. "Pin" = ScrollTrigger pin with a scrubbed timeline. Under reduced motion (OS setting or the manual toggle) every pin, wipe and parallax is disabled. Sections become plain stacks with 300ms opacity fades, Lenis is destroyed, and the canvas draws one static frame.

| # | Section | Theme | Pin length | Entry | Scrubbed / triggered motion |
|---|---|---|---|---|---|
| — | Loader | ink-deep | — | — | Counter tied to `document.fonts.ready` + leather/grain tile generation + hero hydrated (weighted); minimum 900ms; mark scales up, panel clip-wipes up |
| 3.1 | Intro tunnel | ink | 200vh / 120vh | — | Canvas camera z advances with progress; streak speed ramps; 0/1 glyphs; last 25% fades to sand as the hero rises through it |
| 3.2 | Hero | sand + leather + monogram | 120vh / 60vh | crossfade from tunnel | Matrix rises in (expo, 1.2s on load) with cursor tilt ±8° (lerped rAF); handwriting `C = [[TP, FN],[FP, TN]]` draws by `stroke-dashoffset` over the pin; dataset card `card-float`; scroll hint bobs |
| 3.3 | Five Measures | ink + grain | 150vh × 5 = 750vh / 70vh × 5 = 350vh | **diagonal wipe** (light→dark) | Giant title parallax; ruler marker slides to each value; moment swap (numeral counts up, title/stat `row-in`); progress snaps to steps |
| 3.4 | The Mathematics | sand + leather | tiles: none; construction: 220vh / 140vh | **diagonal wipe** (dark→light) | Tiles `strip-in` stagger; tile → panel shared-layout expand (FLIP via GSAP Flip); construction: 100 dots `cell-drop` by scroll, tally + 4 checks go green at the end; convention toggle animates cells with Flip |
| 3.5 | The Lab | ink-deep + grain | none (sticky header row only; an interactive workspace must not be pinned) | **diagonal wipe** (light→dark) | Tab pill fills; cell updates pulse; heatmap tween; curves animate the operating point |
| 3.6 | Same accuracy… | smoke | strip: 300vh / none (mobile uses native horizontal swipe) | soft fade (dark→dark) | Headline lines `row-in`; card strip translates X with scroll; cards `card-float`; mirrored bars grow |
| 3.7 | Pull quote | purple vignette | 150vh / 100vh | fade through | Quote fixed in viewport; lines unmask one by one; body fades in |
| 3.8 | Applications | ink + grain | 100vh × 5 = 500vh / 70vh × 5 | fade from purple | Giant leather word slow X parallax; centre object cross-rotates per domain; dot pager + text swap; marquee runs (paused off-screen) |
| 3.9 | The Code | smoke | none | — | Tab switch crossfade; copy button tick |
| 3.10 | Results / Conclusion / Future | sand + leather | none | **diagonal wipe** (dark→light) | Table rows `row-in`; numerals count up once |
| 3.11 | Footer | ink-deep + grain | none | **diagonal wipe** (light→dark) | Headline unmask; small matrix spins (CSS, paused off-screen) |

The wipe is a shared `<Wipe>` wrapper: the next section's `clip-path: polygon()` animates from `0 100%, 100% 115%, 100% 100%, 0 100%` to full, scrubbed over the last 60vh of the previous section with `--ease-wipe`. This is applied at every light↔dark change, so there are no hard cuts.
Every canvas and CSS loop is paused by an IntersectionObserver when off-screen.

## 5. Metric engine — `lib/metrics.ts` (pure, no DOM)

```ts
type Binary = { tp: number; fn: number; fp: number; tn: number };
type Ratio = number | null;                      // null = undefined (zero denominator)
computeBinary(c: Binary) → { total, correct, incorrect, accuracy, errorRate, precision, recall,
                             f1, specificity, actualPos, actualNeg, predPos, predNeg,
                             parts: { accuracy: [num, den], … } }   // parts feed the stat lines and derivations
fromLabels(actual: string[], predicted: string[], positive: string) → Binary & { sklearn: [[tn,fp],[fn,tp]] }
  // throws typed errors: LENGTH_MISMATCH, EMPTY, POSITIVE_NOT_FOUND
atThreshold(scores: number[], labels: (0|1)[], t: number) → Binary   // predict positive iff score ≥ t
rocCurve / prCurve(scores, labels) → points (all unique thresholds), + auc (trapezoid)
computeMulticlass(m: number[][]) → { perClass: [{tp,fp,fn,tn,precision,recall,f1,support}],
                                     macro, micro, weighted, accuracy }
```
- F1 is computed as `2TP/(2TP+FP+FN)`; the test asserts it equals `2PR/(P+R)` where both are defined. If P or R is null, F1 is null.
- **Seeded scores (`lib/seededScores.ts`):** mulberry32(seed 2026) draws 45 positive and 55 negative scores from two clipped skewed distributions. The draws are then rank-adjusted deterministically: the 36 highest positive scores are placed in [0.50, 0.98] and the other 9 in [0.05, 0.495]; the 11 highest negative scores are placed in [0.50, 0.90] and the other 44 in [0.02, 0.495]. Values are rounded to 3 decimals. This guarantees exactly 36/9/11/44 at t = 0.50 (test), and the curves stay realistic.
- **Status label rules** (in `lib/status.ts`, pure, tested): ordered checks:
  total = 0 → "No observations yet" · any metric undefined → "Some metrics undefined" · imbalance (minority share < 30%) and accuracy ≥ .8 and recall < .6 → "High accuracy may hide poor recall" · recall − precision > .15 → "Catches most positives, many false alarms" · precision − recall > .15 → "Cautious: reliable alarms, misses positives" · all of acc/P/R ≥ .9 → "Strong performance" · all ≥ .7 → "Balanced performance" · else "Weak performance".
- `format.ts`: `pct(null) → "undefined"`, `pct(0.766) → "76.60%"`, and `Number.isFinite` is checked everywhere, so NaN and Infinity cannot reach the DOM.

**Tests (`tests/metrics.test.ts`):** every item in brief §6, plus: `fromLabels` with string classes; validation errors; status-rule cases; ROC endpoints (0,0) and (1,1); multiclass with k = 2 matches `computeBinary`.

**Multiclass default (illustrative, labelled as such):** Bearing / Motor / Sensor
```
            pred B  pred M  pred S
actual B      30      4       2     (36)
actual M       5     25       3     (33)
actual S       1      4      26     (31)   total 100, accuracy 81%
```

## 6. Shared state (`lib/store.ts`)

`{ matrix: Binary, source: 'report'|'counts'|'labels'|'threshold', threshold, labTab, motion: 'auto'|'on'|'off', convention: 'report'|'sklearn' }` plus `resetToReport()`.
Consumers: the hero matrix, Five Measures (values, ruler, drawer), Lab tabs 1–3 (tab 3 writes the matrix as the slider moves), and the Results "live" column. Model A/B in Compare and the Results tables stay **fixed to the report example** (they document the report). A "Reset to report example" pill sits in the Lab header and in the drawer.

## 7. Content and copy map

| Section | Report source |
|---|---|
| Hero caption (left) | §4 "two aligned sequences…" |
| Hero caption (right), intro question, learning goal | §1, plus the current site's question and goal |
| Five Measures + drawers | §5.9–5.11 formulas; interpretations from §5.10/5.11/7.2 |
| Mathematics tiles | §5.1, §5.2, §5.3, §5.4 (+ §5.7/5.8), §5.5 |
| Construction | §5.6 |
| Lab callouts | current site + §5.9 (accuracy misleading), §5.11 (zero-division) |
| Threshold caption | §5.10 trade-off sentence |
| Multiclass | §5.4 (k×k, C_ij), §5.5 (OvR, macro/micro/weighted) |
| Compare | §5.12, §7.3 |
| Quote | §5.4 sentence; body paraphrases §8 |
| Applications | §7.4 + §5.8 (spam filtering FP/FN derived from §5.4's "spam may be positive") |
| Code | §6.2–6.5 verbatim (indentation normalised) + §6.3 ravel note |
| Results | §7.1, §7.2 + caveat, §8, §9 |
| Footer | team, course line, §10 refs + illustrative note |

All copy lives in `content/*.ts`, so it can be edited without touching components.

## 8. Phases (as in brief §7)

(a) tokens, fonts, textures, header, menu, loader, motion toggle → (b) `lib/` + Vitest green → (c) Lab, 4 tabs → (d) intro tunnel + hero → (e) Five Measures → (f) Mathematics, Compare, Quote, Applications, Code, Results → (g) footer, responsive (1440/1024/768/375), reduced motion, a11y (keyboard walk, focus traps, contrast check), redacted PDF → (h) `npm run build` static export, Lighthouse run, `netlify.toml`, README.
After each visual phase: dev server in the browser pane at 1440×900 and 375×812, compared with brief §2–§3; gaps fixed before moving on. I'll summarise changes after each phase.

## 9. Risks / notes

- **Long pin total (~2,300vh desktop).** The page is long by design (the reference is too). The menu provides jump links, and Lenis `scrollTo` respects pins.
- **`background-clip:text` with a blob-URL texture:** works in all evergreen browsers; falls back to a flat `--purple-display` fill.
- **Static export and KaTeX/Shiki:** both run in server components at build time, so they add no runtime JS. Only the drawer and the Lab load the KaTeX runtime (dynamic import).
- **The reference site was not opened.** The design follows the brief's spec in §2–§3; no assets or code from it are used.
