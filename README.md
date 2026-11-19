# Confusion Matrix: an interactive explainer

A scroll-driven, single-page site for the experiential-learning project **"Application of Matrices in Classification Model Evaluation"**
(25BSMA01 · Matrix Algebra and Calculus · B.Tech CSE AIML-G · Jain (Deemed-to-be) University).

Next.js (App Router, static export) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · KaTeX · Shiki · Zustand · Vitest.
Every visual is generated in code (SVG, CSS 3D, Canvas 2D): there are no image or video files except the report PDF.

## Run it

Needs Node 20 or newer (22 recommended).

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # metric engine tests (Vitest)
npm run build      # static export into out/
npm start          # serves out/ (npx serve) to check the production build
```

## Deploy to Netlify

`netlify.toml` already sets `command = "npm run build"` and `publish = "out"`.

- **Git deploy:** connect the repository in Netlify. If this folder is not the repository root, set **Base directory** to `confusion-matrix-site`.
- **Manual deploy:** run `npm run build`, then drag the `out/` folder onto app.netlify.com/drop, or run `npx netlify deploy --prod --dir=out`.

## Where things live

| What | File |
|---|---|
| **All maths** (pure, no React): `computeBinary`, `fromLabels`, `atThreshold`, `rocCurve`, `prCurve`, `computeMulticlass`, `statusFor` | `lib/metrics.ts` |
| Seeded scores for the Threshold tab (exactly 36/9/11/44 at t = 0.50) | `lib/seededScores.ts` |
| Step-by-step derivations shown in the drawer | `lib/derivation.ts` |
| Formatting (`76.60%`, `undefined`, never NaN) | `lib/format.ts` |
| Shared state (matrix, threshold, tab, motion, drawer) | `lib/store.ts` |
| Motion helpers (pins, wipes, reduced-motion gating) | `lib/motion.ts`, `components/chrome/MotionProvider.tsx` |
| Generated textures (grain, pebbled leather) | `lib/textures.ts` |
| **All copy** taken from the report | `content/site.ts` |
| Report code shown in the Code section (§6.2–6.5, unchanged) | `content/code/*` |
| Design tokens, keyframes, themes | `app/globals.css` |
| Tests | `tests/metrics.test.ts` |

### Sections (in page order, `app/page.tsx`)

| Section | Component | Report source |
|---|---|---|
| Loader, header, menu, motion toggle | `components/chrome/*` | n/a |
| Intro tunnel | `components/hero/IntroTunnel.tsx` | intro question |
| Hero (3D matrix, dataset card, handwriting) | `components/hero/*` | §1, §4 |
| The Five Measures (pinned) + derivation drawer | `components/measures/*` | §5.9–5.11, §7.2 |
| The Mathematics (tiles, construction, layout toggle) | `components/maths/*` | §5.1–5.6 |
| The Lab: Counts · Paste labels · Threshold · Multiclass | `components/lab/*` | §5.4–5.11, §6.4, §9 |
| Same accuracy, different mistakes | `components/compare/Compare.tsx` | §5.12, §7.3 |
| Pull quote | `components/quote/PullQuote.tsx` | §5.4, §8 |
| Applications | `components/applications/*` | §5.8, §7.4 |
| The Code (Shiki, build time) | `components/code/*` | §6 |
| Results, conclusion, future scope | `components/results/Results.tsx` | §7.1, §7.2, §8, §9 |
| Footer: team, course, references | `components/footer/Footer.tsx` | cover, §10 |

## Notes

- **Correction to the report:** the report prints Model B's F1-score as 80.81%. From its counts, F1 = 2·40 / (2·40 + 15 + 5) = 80/100 = **80.00%**, and 2PR/(P+R) gives the same value. The site shows the computed value and says so in the Compare section, and the test asserts 0.80.
- **Matrix layout:** the site shows the positive row first, `[[TP, FN], [FP, TN]]` (report §5.4). scikit-learn and MATLAB, with labels `[0, 1]`, print `[[TN, FP], [FN, TP]]`. The Mathematics section has a toggle that shows both.
- **Zero denominators** return `null` in the engine and show as "undefined" with an explanatory tooltip.
- **Reduced motion:** follows `prefers-reduced-motion`, and the bottom-right button overrides it (the choice is saved in `localStorage`). With motion off there is no Lenis, no pinning and no wipes, and sections stack.
- **Report PDF is not in the repository** (it contains student USNs and a photo). Add the edited copy as `public/report.pdf` (and `docs/report.pdf` if you like) before deploying, or the download link returns 404. Both paths are git-ignored, so commit it with `git add -f public/report.pdf` once it is safe to publish.
- **Performance:** sections below the hero are prerendered but hydrate only as you approach them (`components/ui/Deferred.tsx`); the leather texture is generated in a Web Worker (`public/leather-worker.js`); ScrollTrigger refreshes are batched.
- **Measured (production build, Lighthouse 13):** desktop Performance 96 · mobile Performance 90–91 · Accessibility 100 · Best practices 100.
