import { CHROME_STORE_URL } from '../constants';
import { trackEvent } from '../analytics';

export default function Hero() {
  return (
    <header className="relative pt-24 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* LEFT COLUMN — text content */}
        <div className="space-y-10 relative z-10">
          {/* Badge */}
          <div className="inline-block px-4 py-2 bg-yellow-300 text-slate-900 border-2 border-slate-900 font-punk font-bold rotate-[-2deg] mb-4">
            NOW IN THE WEB STORE (DUH)
          </div>

          {/* Headline */}
          <h1 className="text-6xl lg:text-8xl font-display leading-[0.9] text-slate-900 -rotate-2">
            Stop pretending you{' '}
            <span className="bg-primary text-white px-4 inline-block transform rotate-3">
              understand
            </span>{' '}
            jargon.
          </h1>

          {/* Description */}
          <p className="text-xl font-punk text-slate-700 max-w-lg leading-relaxed border-l-4 border-primary pl-6 py-2 rotate-1">
            The browser extension that translates high-brow nonsense into plain English. Because
            nobody actually knows what "concomitant" means.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6">
            <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('cta_click', { location: 'hero' })}>
              <button className="bg-primary text-white border-4 border-slate-900 px-10 py-6 text-2xl font-display shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Install Twelveify
              </button>
            </a>
            <a href="#try-it">
              <button className="bg-white border-4 border-slate-900 px-10 py-6 text-2xl font-display shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rotate-1">
                View Demo
              </button>
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 font-punk text-sm">
            <div className="flex -space-x-4">
              <div className="size-12 border-2 border-slate-900 rounded-full bg-slate-400 rotate-3" />
              <div className="size-12 border-2 border-slate-900 rounded-full bg-slate-500 -rotate-6" />
              <div className="size-12 border-2 border-slate-900 rounded-full bg-slate-600 rotate-2" />
            </div>
            <span className="bg-slate-900 text-white px-2 py-1">JOINED BY 10K+ DAILY READERS</span>
          </div>
        </div>

        {/* RIGHT COLUMN — CSS browser mockup (desktop only) */}
        <div className="hidden lg:block relative">
          <div className="zine-box bg-white p-2 transform rotate-3 scale-105">
            {/* Browser chrome bar */}
            <div className="border-b-4 border-slate-900 px-4 py-3 flex items-center justify-between bg-slate-100">
              <div className="flex gap-2">
                <div className="size-4 border-2 border-slate-900 bg-red-500" />
                <div className="size-4 border-2 border-slate-900 bg-yellow-400" />
                <div className="size-4 border-2 border-slate-900 bg-green-500" />
              </div>
              <div className="font-punk text-xs font-bold text-slate-500">
                WIKIPEDIA.RUIN/QUANTUM
              </div>
            </div>

            {/* Content area */}
            <div className="p-8 space-y-6">
              <div className="h-6 w-1/2 bg-slate-200" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-100" />
                <div className="h-4 w-full bg-slate-100" />
                <div className="relative bg-primary text-white p-4 font-punk rotate-[-1deg] border-2 border-slate-900">
                  The wave function is a mathematical description of the quantum state of an
                  isolated quantum system.
                  <div className="absolute -bottom-8 -right-4 bg-yellow-300 text-slate-900 p-2 border-2 border-slate-900 flex items-center gap-2 rotate-6">
                    <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                    <span className="text-xs font-black">SIMPLIFY THIS MESS</span>
                  </div>
                </div>
                <div className="h-4 w-3/4 bg-slate-100" />
              </div>
            </div>
          </div>

          {/* Decorative blur strip */}
          <div className="absolute -top-4 left-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm border-x border-slate-900/10 rotate-12 -z-10" />
        </div>
      </div>
    </header>
  );
}
