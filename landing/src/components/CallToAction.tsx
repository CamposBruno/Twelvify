import { CHROME_STORE_URL } from '../constants'
import { trackEvent } from '../analytics'

function CallToAction() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-primary border-8 border-slate-900 p-12 lg:p-24 text-center relative paper-tear">

          <div className="relative z-10 space-y-12">
            <h2 className="text-5xl lg:text-7xl text-white max-w-3xl mx-auto leading-[0.9] -rotate-1">
              Ready to stop feeling like a toddler?
            </h2>

            <div className="font-punk bg-white text-slate-900 px-6 py-2 inline-block font-black text-lg rotate-2 uppercase tracking-widest border-2 border-slate-900">
              Free to use — Forever
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cta_click', { location: 'cta_section' })}>
                <button className="bg-slate-900 text-white px-12 py-6 text-3xl font-display border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  ADD TO CHROME
                </button>
              </a>
              <a href="#how-it-works">
                <button className="bg-transparent border-4 border-white text-white px-12 py-6 text-3xl font-display hover:bg-white hover:text-primary transition-all rotate-[-1deg]">
                  LEARN MORE
                </button>
              </a>
            </div>
          </div>

          {/* Decorative text */}
          <div className="absolute top-10 right-10 opacity-20 text-9xl font-display text-white select-none -rotate-45">!</div>
          <div className="absolute bottom-10 left-10 opacity-20 text-8xl font-display text-white select-none rotate-12">?</div>

        </div>
      </div>
    </section>
  )
}

export default CallToAction
