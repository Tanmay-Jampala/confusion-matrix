"use client";
import { scrollToId } from "@/lib/scroll";
import { COURSE, ILLUSTRATIVE_NOTE, REFERENCES, TEAM, TITLE } from "@/content/site";
import Section from "@/components/ui/Section";
import HeroMatrix3D from "@/components/hero/HeroMatrix3D";

const NAV = [
  ["Matrix", "mathematics"],
  ["Metrics", "measures"],
  ["Lab", "lab"],
  ["Compare", "compare"],
  ["Applications", "applications"],
  ["Code", "code"],
  ["Results", "results"],
] as const;

export default function Footer() {
  return (
    <Section id="team" theme="deep" wipe grain label="Team, references and credits">
      <footer className="wrap section-pad flex flex-col gap-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-8">
            <h2 className="giant !text-[clamp(3.4rem,9vw,10rem)] text-bone" data-reveal>
              Metrics were made
              <br />
              <span className="text-gold-bright">to be questioned</span>
            </h2>
            <a
              href="#lab"
              className="pill is-solid self-start"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("lab");
              }}
            >
              Back to the Lab ↗
            </a>
          </div>
          <div className="flex justify-center" data-pause>
            <HeroMatrix3D follow={false} spin tile="clamp(70px,9vw,120px)" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <h3 className="mono text-[11px] text-gold">Team</h3>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {TEAM.map((t) => (
                <li key={t.name} className="border-t border-bone/12 pt-3">
                  <p className="text-[16px] font-extrabold text-bone">{t.name}</p>
                  <p className="mt-1 text-[13.5px] text-taupe">{t.role}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-10">
            <nav aria-label="Footer">
              <h3 className="mono text-[11px] text-gold">Sections</h3>
              <ul className="mt-4 grid grid-cols-2 gap-y-2 text-[15px]">
                {NAV.map(([l, id]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="link-draw text-bone"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToId(id);
                      }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="/report.pdf" download className="link-draw text-gold-bright">
                    Report PDF ↓
                  </a>
                </li>
              </ul>
            </nav>
            <div>
              <h3 className="mono text-[11px] text-gold">Course</h3>
              <p className="mt-3 text-[14px] text-taupe-light">
                {COURSE.code} · {COURSE.name}
                <br />
                {COURSE.program} ({COURSE.section}) · {COURSE.school}
                <br />
                Submitted to {COURSE.supervisor}, {COURSE.department}
                <br />
                {COURSE.university} · {COURSE.date}
              </p>
            </div>
          </div>
        </div>

        <div id="references">
          <h3 className="mono text-[11px] text-gold">References</h3>
          <ol className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 text-[14px] text-taupe-light md:grid-cols-2">
            {REFERENCES.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="mono pt-0.5 text-[10.5px] text-taupe">[{i + 1}]</span>
                <span>
                  {r.text}{" "}
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="link-draw break-all text-bone">
                      {r.url.replace("https://", "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
          <p className="caption mt-6 max-w-[80ch] text-taupe">Note: {ILLUSTRATIVE_NOTE}</p>
        </div>

        <div className="flex flex-col gap-2 border-t border-bone/10 pt-6 text-[11px] text-taupe sm:flex-row sm:justify-between">
          <p>{TITLE}</p>
          <p>Every number on this site is computed from the counts · Visuals generated in code</p>
        </div>
      </footer>
    </Section>
  );
}
