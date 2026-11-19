import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { TITLE } from "@/content/site";

const display = Big_Shoulders({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-display-face", display: "swap" });
const body = Inter_Tight({ subsets: ["latin"], weight: ["400", "800"], variable: "--font-body-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono-face", display: "swap" });

export const metadata: Metadata = {
  title: "Confusion Matrix · Application of Matrices in Classification Model Evaluation",
  description: `${TITLE}. An interactive explainer: build a confusion matrix, compute accuracy, precision, recall, F1 and specificity, and compare models.`,
};

export const viewport: Viewport = { themeColor: "#0b0a0f", width: "device-width", initialScale: 1 };

/* Sets data-motion before first paint so reduced-motion users never see a pinned/animated frame. */
const preload = `try{var s=localStorage.getItem('cm-motion');var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.motion=s==='on'?'on':s==='off'?'off':(r?'off':'on')}catch(e){document.documentElement.dataset.motion='on'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} data-header="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
        <noscript>
          <style>{`.loader{display:none!important}[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
