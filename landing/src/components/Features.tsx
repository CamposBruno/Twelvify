import Icon from './Icon'

function Features() {
  return (
    <section id="features" className="py-32 bg-white border-t-8 border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

          {/* LEFT COLUMN — feature list */}
          <div className="space-y-12">
            <h2 className="text-5xl lg:text-6xl leading-tight">
              Designed to feel like it's{' '}
              <span className="text-primary underline decoration-slate-900 decoration-8 underline-offset-8">
                not even there
              </span>
              .
            </h2>

            <p className="font-punk text-xl text-slate-600 max-w-lg border-r-4 border-slate-200 pr-6">
              Twelvify isn't just a tool; it's an upgrade for your entire web browsing experience. We focused on the details that make software disappear.
            </p>

            <div className="space-y-8 pt-6">

              {/* Feature 1 — In-page Replacement */}
              <div className="flex gap-6 items-start group">
                <div className="bg-slate-900 text-white p-3 rotate-12 group-hover:rotate-0 transition-transform">
                  <Icon name="swap_horiz" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-display mb-2">In-page Replacement</h4>
                  <p className="font-punk text-slate-500">Magic, basically. It swaps the text right where it sits. No new tabs, no distractions, no headache.</p>
                </div>
              </div>

              {/* Feature 2 — Privacy by Design */}
              <div className="flex gap-6 items-start group">
                <div className="bg-primary text-white p-3 -rotate-6 group-hover:rotate-0 transition-transform">
                  <Icon name="shield_with_heart" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-display mb-2">Privacy by Design</h4>
                  <p className="font-punk text-slate-500">We're not creepy. We don't want your data, your history, or your soul. We just want to fix your reading list.</p>
                </div>
              </div>

              {/* Feature 3 — Native Feel */}
              <div className="flex gap-6 items-start group">
                <div className="bg-slate-900 text-white p-3 rotate-3 group-hover:rotate-0 transition-transform">
                  <Icon name="palette" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-display mb-2">Native Feel</h4>
                  <p className="font-punk text-slate-500">Stays in its lane. It matches the site's style so perfectly you'll forget we're even there.</p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN — illustration placeholder */}
          <div className="relative group mt-16 lg:mt-0">
            <div className="absolute -top-12 -left-12 text-9xl font-display opacity-10 pointer-events-none select-none -rotate-12">
              SHH!
            </div>
            <div className="zine-box p-2 bg-white rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-64 bg-slate-100 border-2 border-slate-900 flex items-center justify-center">
                <Icon name="image" className="w-24 h-24 text-slate-300" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-6 bg-yellow-300 border-2 border-slate-900 p-4 font-display text-2xl rotate-6 shadow-xl">
              CLEAN AS HELL
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Features
