import Loader from "@/components/chrome/Loader";
import Header from "@/components/chrome/Header";
import Menu from "@/components/chrome/Menu";
import MotionToggle from "@/components/chrome/MotionToggle";
import MotionProvider from "@/components/chrome/MotionProvider";
import DerivationDrawer from "@/components/measures/DerivationDrawer";
import IntroTunnel from "@/components/hero/IntroTunnel";
import Hero from "@/components/hero/Hero";
import FiveMeasures from "@/components/measures/FiveMeasures";
import Mathematics from "@/components/maths/Mathematics";
import Lab from "@/components/lab/Lab";
import Compare from "@/components/compare/Compare";
import PullQuote from "@/components/quote/PullQuote";
import Applications from "@/components/applications/Applications";
import CodeSection from "@/components/code/CodeSection";
import Results from "@/components/results/Results";
import Footer from "@/components/footer/Footer";
import Deferred from "@/components/ui/Deferred";

/* Section order and the content source of each one are documented in README.md.
   Everything below the hero hydrates lazily (components/ui/Deferred.tsx); its HTML is still prerendered. */
export default function Page() {
  return (
    <>
      <a href="#main" className="sr-only-focusable mono fixed left-4 top-4 z-[200] rounded-full bg-bone px-5 py-3 text-ink-deep">
        Skip to content
      </a>
      <MotionProvider />
      <Loader />
      <Header />
      <Menu />
      <MotionToggle />
      <DerivationDrawer />
      <main id="main" tabIndex={-1} className="outline-none">
        <IntroTunnel />
        <Hero />
        <Deferred>
          <FiveMeasures />
        </Deferred>
        <Deferred>
          <Mathematics />
        </Deferred>
        <Deferred>
          <Lab />
        </Deferred>
        <Deferred>
          <Compare />
        </Deferred>
        <Deferred>
          <PullQuote />
        </Deferred>
        <Deferred>
          <Applications />
        </Deferred>
        <Deferred>
          <CodeSection />
        </Deferred>
        <Deferred>
          <Results />
        </Deferred>
        <Deferred>
          <Footer />
        </Deferred>
      </main>
    </>
  );
}
