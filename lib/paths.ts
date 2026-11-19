/** Prefix a root-relative public asset with the deployment base path (e.g. /confusion-matrix on GitHub Pages). */
export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
