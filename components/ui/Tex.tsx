import katex from "katex";

/** KaTeX → HTML. Works in server components (static, build-time) and client components (live values). */
export default function Tex({ tex, display = false, className = "", label }: { tex: string; display?: boolean; className?: string; label?: string }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "htmlAndMathml", strict: "ignore" });
  const Tag = display ? "div" : "span";
  return <Tag className={className} role={label ? "img" : undefined} aria-label={label} dangerouslySetInnerHTML={{ __html: html }} />;
}
