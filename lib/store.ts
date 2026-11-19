"use client";
import { create } from "zustand";
import { REPORT_EXAMPLE, type Binary, sanitizeCount } from "./metrics";
import { DEFAULT_THRESHOLD } from "./seededScores";
import { MULTICLASS_DEFAULT } from "@/content/site";

export type DrawerKey = "accuracy" | "errorRate" | "precision" | "recall" | "f1" | "specificity";
export type Multi = { classes: string[]; matrix: number[][] };

export type LabTab = "counts" | "labels" | "threshold" | "multiclass";
export type Convention = "report" | "sklearn";
export type Source = "report" | "counts" | "labels" | "threshold";

type State = {
  matrix: Binary;
  source: Source;
  threshold: number;
  labTab: LabTab;
  convention: Convention;
  /** user override for motion; null = follow prefers-reduced-motion */
  motionOverride: boolean | null;
  systemReduced: boolean;
  menuOpen: boolean;
  loaded: boolean;
  drawer: DrawerKey | null;
  setDrawer: (k: DrawerKey | null) => void;
  multi: Multi;
  setMulti: (m: Multi) => void;
  setLoaded: () => void;
  setCell: (k: keyof Binary, v: number) => void;
  setMatrix: (m: Binary, source: Source) => void;
  setThreshold: (t: number, m: Binary) => void;
  setLabTab: (t: LabTab) => void;
  setConvention: (c: Convention) => void;
  setMotionOverride: (v: boolean | null) => void;
  setSystemReduced: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  resetToReport: () => void;
};

export const useStore = create<State>((set) => ({
  matrix: { ...REPORT_EXAMPLE },
  source: "report",
  threshold: DEFAULT_THRESHOLD,
  labTab: "counts",
  convention: "report",
  motionOverride: null,
  systemReduced: false,
  menuOpen: false,
  loaded: false,
  drawer: null,
  setDrawer: (drawer) => set({ drawer }),
  multi: { classes: [...MULTICLASS_DEFAULT.classes], matrix: MULTICLASS_DEFAULT.matrix.map((r) => [...r]) },
  setMulti: (multi) => set({ multi }),
  setLoaded: () => set({ loaded: true }),
  setCell: (k, v) => set((s) => ({ matrix: { ...s.matrix, [k]: sanitizeCount(v) }, source: "counts" })),
  setMatrix: (m, source) =>
    set({ matrix: { tp: sanitizeCount(m.tp), fn: sanitizeCount(m.fn), fp: sanitizeCount(m.fp), tn: sanitizeCount(m.tn) }, source }),
  setThreshold: (t, m) => set({ threshold: t, matrix: m, source: "threshold" }),
  setLabTab: (labTab) => set({ labTab }),
  setConvention: (convention) => set({ convention }),
  setMotionOverride: (motionOverride) => set({ motionOverride }),
  setSystemReduced: (systemReduced) => set({ systemReduced }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  resetToReport: () => set({ matrix: { ...REPORT_EXAMPLE }, source: "report", threshold: DEFAULT_THRESHOLD }),
}));

/** true when animations should run */
export const useMotion = () =>
  useStore((s) => (s.motionOverride === null ? !s.systemReduced : s.motionOverride));
