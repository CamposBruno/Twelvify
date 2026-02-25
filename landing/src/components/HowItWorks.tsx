import Icon from './Icon'

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-32 relative bg-white border-y-8 border-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-24 relative">
          <h2 className="text-5xl lg:text-6xl text-slate-900 mb-6">
            The "Don't Look Dumb" Workflow
          </h2>
          <p className="font-punk text-lg text-slate-500 max-w-xl bg-yellow-100 px-4 py-2 inline-block rotate-1">
            No apps to open, no tabs to switch. Twelveify lives within your workflow.
          </p>
        </div>

        {/* Three-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Card 1 — Highlight */}
          <div className="zine-box p-8 rotate-[-2deg] bg-white hover:rotate-0 transition-transform relative">
            <div className="text-4xl font-display text-primary mb-4 underline decoration-slate-900 decoration-4">
              01.
            </div>
            <h3 className="text-2xl mb-4">Highlight</h3>
            <p className="font-punk leading-relaxed text-slate-600">
              Highlight the word salad. You know the one. That sentence that makes your brain itch.
            </p>
            <Icon name="draw" className="absolute -top-6 -right-6 w-16 h-16 text-slate-200 -z-10 rotate-12" />
          </div>

          {/* Card 2 — Click Wand */}
          <div className="zine-box p-8 rotate-[3deg] bg-white hover:rotate-0 transition-transform translate-y-4 relative">
            <div className="text-4xl font-display text-primary mb-4 underline decoration-slate-900 decoration-4">
              02.
            </div>
            <h3 className="text-2xl mb-4">Click Wand</h3>
            <p className="font-punk leading-relaxed text-slate-600">
              Tap the magic wand. Our AI starts sweating so you don't have to.
            </p>
            <Icon name="auto_fix_high" className="absolute -bottom-6 -left-6 w-16 h-16 text-slate-200 -z-10 -rotate-12" />
          </div>

          {/* Card 3 — Read Simplified */}
          <div className="zine-box p-8 rotate-[-1deg] bg-white hover:rotate-0 transition-transform relative">
            <div className="text-4xl font-display text-primary mb-4 underline decoration-slate-900 decoration-4">
              03.
            </div>
            <h3 className="text-2xl mb-4">Read Simplified</h3>
            <p className="font-punk leading-relaxed text-slate-600">
              Read like a normal person. The jargon disappears, replaced by words you actually use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
