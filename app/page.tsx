export default function HomePage() {
  return (
    <div className="aesthete-page bg-background text-on-background">
      <nav className="fixed top-0 z-50 w-full bg-[#fbf9f6]/80 shadow-[0_40px_60px_rgba(49,51,48,0.05)] backdrop-blur-xl transition-all duration-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-12 py-6">
          <div className="font-serif text-xl tracking-[0.2em] text-[#313330]">AESTHETE AI</div>
          <div className="hidden items-center gap-10 md:flex">
            <a className="border-b border-[#58624e]/20 text-[12px] font-medium uppercase tracking-[0.1em] text-[#58624e]" href="#">
              Solutions
            </a>
            <a className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]" href="#">
              Infrastructure
            </a>
            <a className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]" href="#">
              Intelligence
            </a>
            <a className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]" href="#">
              Network
            </a>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-[12px] uppercase tracking-[0.1em] text-[#313330]/60 transition-all duration-500 hover:text-[#58624e]">
              Login
            </button>
            <button className="bg-primary px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-on-primary transition-transform active:scale-95">
              Request Access
            </button>
          </div>
        </div>
      </nav>

      <main className="bg-background pt-24 text-on-background selection:bg-[#dce6cd] selection:text-[#4b5542]">
        <section className="mx-auto flex min-h-screen max-w-7xl items-center overflow-hidden px-12">
          <div className="grid grid-cols-12 items-center gap-16">
            <div className="col-span-6 space-y-10">
              <div className="space-y-6">
                <h1 className="letter-spacing-display text-6xl font-normal leading-[1.1] text-on-background">
                  Most agencies do not need <span className="italic text-[#58624e]/80">more leads</span>. They need to know which ones will close.
                </h1>
                <p className="max-w-xl text-lg font-light leading-relaxed text-on-surface-variant">
                  An AI sales system that identifies serious buyers, recommends the next move, and helps your team focus where deals are most likely to happen.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button className="w-fit bg-primary px-10 py-5 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-lg transition-transform active:scale-[0.98]">
                  Book a private demo
                </button>
                <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-outline">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Typically reduces response time by 70%
                </p>
              </div>
            </div>

            <div className="relative col-span-6">
              <div className="absolute -right-20 -top-20 -z-10 h-[120%] w-[120%] rounded-full bg-surface-container opacity-50 blur-3xl"></div>
              <div className="relative space-y-4">
                <div className="relative z-10 border-l-2 border-primary/20 bg-surface-container-lowest p-8 shadow-[0_40px_80px_-20px_rgba(49,51,48,0.1)]">
                  <div className="mb-8 flex items-start justify-between">
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">Lead Analysis</span>
                      <h3 className="serif text-xl italic">Valeria Di Rossy</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-light text-primary">82%</span>
                      <span className="block text-[10px] uppercase tracking-widest text-outline">Likelihood to Close</span>
                    </div>
                  </div>
                  <div className="space-y-4 border-t border-surface-container pt-6">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-lg text-primary">lightbulb</span>
                      <p className="text-sm leading-relaxed text-on-surface">This lead is highly likely to book a visit within 3 days.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-lg text-primary">rocket_launch</span>
                      <div className="w-full bg-surface-container-low p-4">
                        <span className="mb-2 block text-[10px] uppercase tracking-widest text-outline">Recommended Move</span>
                        <p className="text-sm font-medium">Show 2 properties in Palermo and suggest a call tomorrow.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-20 -mt-8 ml-auto w-[85%] bg-surface-container p-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <img
                      alt=""
                      className="h-16 w-16 object-cover grayscale brightness-110"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUZ7WQrGPfrLOgpeN-T8hDVZ-ex8nCFeSsy3bZ4SO6vE8X9r8-_KsOOBLqX_MFhqzMqgTiQj_kWtXdTVlhM6yliPpqROfKd7y2eGjvbjjxNz95Uml17ov5xE27RAzfb7fKUIcwBNKWowCrvKG5lH1R1hCP8Bc8fkXhkuapbL1QX6bgOte8JeQk5-8FyK9Q-IOc5JDMk8vPKJ5ouy7uXfof9YFB1RiIg3tIGtpXLY_2qIiGdXWQNkKY189IZfAkYotbRRgMKO9xVoWA"
                    />
                    <div>
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-outline">Top Match</span>
                      <p className="text-xs font-semibold">Palazzo Della Flora, Unit 12B</p>
                      <p className="mt-1 text-[11px] italic text-on-surface-variant">
                        Fits buyer&apos;s budget and architectural preference for brutalist design.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-12 bottom-20 z-30 flex items-center gap-3 border-l border-error bg-error-container/10 px-4 py-3 backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-error-container">
                    High risk if ignored in next 4h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container py-32">
          <div className="mx-auto max-w-7xl px-12">
            <div className="mb-24 max-w-3xl">
              <h2 className="letter-spacing-display text-5xl font-normal leading-tight text-on-background">
                You are already paying for leads. <br />You are just <span className="italic text-error-dim">losing</span> the best ones.
              </h2>
            </div>
            <div className="grid grid-cols-12 items-center gap-20">
              <div className="relative col-span-7 h-[400px]">
                <div className="absolute left-0 top-0 rotate-2 border border-outline-variant/10 bg-surface-container-lowest p-4 text-xs opacity-40 blur-[1px]">
                  Lead #4928 - Inquiry
                </div>
                <div className="absolute left-40 top-20 -rotate-3 border border-outline-variant/10 bg-surface-container-lowest p-4 text-xs opacity-60 shadow-sm">
                  Lead #5011 - Facebook
                </div>
                <div className="absolute bottom-10 left-10 rotate-6 border border-outline-variant/10 bg-surface-container-lowest p-4 text-xs opacity-30 blur-[2px]">
                  Lead #3882 - Website
                </div>
                <div className="absolute left-1/3 top-1/2 rotate-1 border border-outline-variant/10 bg-surface-container-lowest p-4 text-xs opacity-50">
                  Lead #4001 - Portal
                </div>
                <div className="absolute bottom-1/4 right-1/4 -rotate-6 border border-outline-variant/10 bg-surface-container-lowest p-4 text-xs opacity-70 shadow-md">
                  Lead #4122 - Referral
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-[120px] font-extralight text-outline">grain</span>
                </div>
              </div>

              <div className="relative col-span-5 bg-surface-container-lowest p-10 shadow-2xl">
                <div className="absolute -left-6 -top-6 bg-primary p-4 text-[10px] font-bold uppercase tracking-widest text-on-primary">
                  The Opportunity
                </div>
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-surface-container pb-6">
                    <h4 className="serif text-2xl italic">Dr. Elena Sterling</h4>
                    <span className="text-lg font-bold text-primary">94%</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-outline">
                      <span>Signal Strength</span>
                      <span className="text-on-surface">Very High</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container">
                      <div className="h-full w-[94%] bg-primary"></div>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-6">
                    <p className="text-sm italic leading-relaxed text-on-surface-variant">
                      &quot;Detected 4 separate visits to &apos;Penthouse Terrace&apos; floorplan in the last 12 minutes. High urgency profile.&quot;
                    </p>
                  </div>
                  <button className="w-full border border-primary py-4 text-[11px] font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary">
                    Contact Immediately
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-40">
          <div className="mx-auto grid max-w-7xl grid-cols-12 items-center gap-16 px-12">
            <div className="col-span-5">
              <img
                alt=""
                className="h-[600px] w-full object-cover grayscale brightness-105 shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfh9p4s4u3O2k_qb2f0NHT79FpQ2BtUOtmWJ7swUvCSRNv7-slhXqw1jcYWpvn7-o51UPqeMNcGKkKroZaoo1eCUXB9Lf4mbfyrumfTT_Io6ZVuvkokqz2V8QUmnhsx2MtufVMohVOEfdwFZv256MOScYrLOnzCf391S4tEK56h6A9IBPoqcIpq2txDR7wS2Y56IVVXOCKMeMiVDXx6qw0dr-XATnDzUofzPIa5vf8XU9bEMdh_G5wmR9dadKwCOHjpGSSXxITIc8t"
              />
            </div>
            <div className="col-span-7 space-y-12 pl-12">
              <h2 className="letter-spacing-display text-6xl font-normal leading-tight">
                Know who is actually likely <span className="italic text-primary">to close.</span>
              </h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">01 / Seriousness</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Our AI analyzes digital footprints to distinguish casual browsers from intent-driven investors.
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">02 / Urgency</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Real-time behavior triggers identify windows of opportunity before they close.
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">03 / Capacity</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Automated budget verification and asset assessment without intrusive questions.
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">04 / Precision</span>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Geographical and architectural matching based on historical taste profiles.
                  </p>
                </div>
              </div>
              <div className="pt-8">
                <p className="serif max-w-lg text-2xl font-light italic leading-relaxed text-on-background opacity-60">
                  We don&apos;t just count clicks. We measure commitment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-surface-container-low py-40">
          <div className="mx-auto max-w-7xl px-12">
            <div className="mx-auto mb-24 max-w-3xl space-y-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">The Playbook</span>
              <h2 className="letter-spacing-display text-5xl font-normal leading-tight">
                Know what to do next — before the buyer disappears.
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex h-[380px] flex-1 flex-col justify-between border-r border-surface-container-low bg-surface-container-lowest p-10 shadow-sm">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
                  <h4 className="serif text-xl">Identify Action</h4>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  AI analyzes the gap in the lead&apos;s journey and suggests the exact next touchpoint.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Step One</div>
              </div>

              <div className="relative z-10 flex h-[420px] flex-1 scale-105 flex-col justify-between bg-surface-container-lowest p-10 shadow-xl">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">house</span>
                  <h4 className="serif text-xl">Perfect Property</h4>
                </div>
                <div className="border border-surface-container-high bg-surface p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-outline">Ideal Matching Asset</p>
                  <p className="text-xs font-semibold">The Obsidian Heights — Loft 4</p>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Matching the specific attributes the buyer engaged with most during their search.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Step Two</div>
              </div>

              <div className="flex h-[380px] flex-1 flex-col justify-between border-l border-surface-container-low bg-surface-container-lowest p-10 shadow-sm">
                <div className="space-y-4">
                  <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
                  <h4 className="serif text-xl">Ideal Timing</h4>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Send at 10:15 AM</span>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Historical response data indicates this buyer is most active during mid-mornings.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Step Three</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-32">
          <div className="mx-auto max-w-7xl px-12">
            <div className="mb-32 flex flex-col items-center justify-between gap-16 border-b border-surface-container pb-20 md:flex-row">
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 block font-serif text-5xl text-primary">35%</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-outline">more qualified visits</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 block font-serif text-5xl text-primary">2x</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-outline">more follow-ups completed</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="mb-2 block font-serif text-5xl text-primary">70%</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-outline">faster response time</span>
              </div>
            </div>

            <div className="mx-auto max-w-4xl space-y-10 text-center">
              <span className="material-symbols-outlined text-5xl text-[#58624e]/30">format_quote</span>
              <blockquote className="serif text-4xl italic leading-snug text-on-background">
                &quot;For the first time, we know which leads are actually worth our team&apos;s attention. Our conversion rate hasn&apos;t just increased; it&apos;s evolved.&quot;
              </blockquote>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em]">Julian Vane</span>
                <span className="text-[10px] uppercase tracking-widest text-outline">Founder, Vane Global Realty</span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-container-high py-48">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
            <span className="material-symbols-outlined text-[800px]">fingerprint</span>
          </div>
          <div className="relative z-10 mx-auto max-w-4xl space-y-12 px-12 text-center">
            <div className="space-y-6">
              <h2 className="letter-spacing-display text-5xl font-normal leading-tight">
                See which opportunities your agency is losing — and what to do about it.
              </h2>
              <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-on-surface-variant">
                A private walkthrough for agencies that want more from the leads they already generate.
              </p>
            </div>
            <div className="space-y-8">
              <button className="bg-primary px-16 py-6 text-sm font-bold uppercase tracking-[0.25em] text-on-primary shadow-2xl transition-transform active:scale-95">
                Book a private demo
              </button>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-12 bg-[#7a7b77]/20"></span>
                <p className="text-[10px] italic uppercase tracking-[0.2em] text-outline">
                  Currently onboarding a limited number of agencies
                </p>
                <span className="h-px w-12 bg-[#7a7b77]/20"></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface-container py-20 text-[#58624e]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-12 md:flex-row">
          <div className="font-serif text-lg tracking-widest text-[#313330]">AESTHETE AI</div>
          <div className="flex gap-10">
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Infrastructure
            </a>
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Privacy
            </a>
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Terms
            </a>
            <a className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40 transition-colors hover:text-[#58624e]" href="#">
              Contact
            </a>
          </div>
          <div className="font-sans text-[12px] uppercase tracking-widest text-[#313330]/40">
            © 2024 Aesthete AI. The Digital Atelier for Real Estate.
          </div>
        </div>
      </footer>
    </div>
  );
}
