import type { Ratio } from "./metrics";

/** Percent with 2 decimals, or "undefined" for a zero denominator. Never NaN/Infinity. */
export function pct(x: Ratio | undefined, digits = 2): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "undefined";
  return `${(x * 100).toFixed(digits)}%`;
}

/** Decimal with 4 places (e.g. 0.7660), or "undefined". */
export function dec(x: Ratio | undefined, digits = 4): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "undefined";
  return x.toFixed(digits);
}

export function int(n: number): string {
  return Number.isFinite(n) ? String(Math.round(n)) : "0";
}

export const UNDEFINED_NOTE =
  "The denominator is zero, so this ratio is mathematically undefined. Software libraries often apply a convention instead, such as returning 0 with a warning (scikit-learn's zero_division). A report should state which convention it uses.";
