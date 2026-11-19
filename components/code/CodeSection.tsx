import { readFileSync } from "node:fs";
import path from "node:path";
import { codeToHtml, type ThemeRegistrationRaw } from "shiki";
import { CODE_NOTES } from "@/content/site";
import CodeTabs, { type Snippet } from "./CodeTabs";

/** Shiki theme recoloured to the site palette. */
const theme: ThemeRegistrationRaw = {
  name: "confusion-ink",
  type: "dark",
  colors: { "editor.background": "#171220", "editor.foreground": "#f4efe6" },
  settings: [],
  tokenColors: [
    { settings: { foreground: "#f4efe6" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#a9a1b5", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "keyword.control", "keyword.operator.logical"], settings: { foreground: "#9e6de9" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#f2c766" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#eeac1a" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic"], settings: { foreground: "#d4a24a" } },
    { scope: ["variable.parameter", "meta.function-call.arguments variable.parameter"], settings: { foreground: "#d3c8ba" } },
    { scope: ["entity.name.namespace", "support.type", "entity.name.type", "entity.name.class"], settings: { foreground: "#9179c3" } },
    { scope: ["keyword.operator", "punctuation"], settings: { foreground: "#b0a89d" } },
  ],
};

const read = (f: string) => readFileSync(path.join(process.cwd(), "content", "code", f), "utf8").replace(/\s+$/, "");

export default async function CodeSection() {
  const defs = [
    { id: "python", label: "Python (scikit-learn)", file: "python.py", lang: "python", section: "6.2" },
    { id: "scratch", label: "Metrics from scratch", file: "scratch.py", lang: "python", section: "6.3" },
    { id: "heatmap", label: "Heatmap (Matplotlib)", file: "heatmap.py", lang: "python", section: "6.4" },
    { id: "matlab", label: "MATLAB", file: "matlab.m", lang: "matlab", section: "6.5" },
  ] as const;

  const snippets: Snippet[] = await Promise.all(
    defs.map(async (d) => {
      const code = read(d.file);
      const html = await codeToHtml(code, { lang: d.lang, theme });
      return { id: d.id, label: d.label, section: d.section, code, html, what: CODE_NOTES[d.id].what, output: CODE_NOTES[d.id].output };
    }),
  );

  return <CodeTabs snippets={snippets} ravel={CODE_NOTES.ravel} />;
}
