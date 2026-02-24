import { CHROME_STORE_URL } from '../constants'

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b-4 border-slate-900 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex h-20 items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 border-2 border-slate-900 rotate-[-4deg]">
            <span className="material-symbols-outlined text-white text-3xl">pedal_bike</span>
          </div>
          <span className="text-3xl font-display uppercase tracking-tighter text-slate-900">Twelveify</span>
        </div>

        {/* Section links — hidden on mobile, visible md+ */}
        <div className="hidden md:flex items-center gap-8 font-punk font-bold">
          <a
            href="#how-it-works"
            className="hover:bg-primary hover:text-white px-2 py-1 transition-all -rotate-1"
          >
            HOW IT WORKS
          </a>
          <a
            href="#features"
            className="hover:bg-primary hover:text-white px-2 py-1 transition-all rotate-2"
          >
            FEATURES
          </a>
          <a
            href="#try-it"
            className="hover:bg-primary hover:text-white px-2 py-1 transition-all -rotate-1"
          >
            PLAYGROUND
          </a>
        </div>

        {/* CTA button — always visible */}
        <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
          <button className="bg-slate-900 text-white font-punk border-2 border-slate-900 px-6 py-3 hover:bg-primary transition-all shadow-[4px_4px_0px_0px_rgba(245,96,96,1)]">
            ADD TO CHROME
          </button>
        </a>

      </div>
    </nav>
  )
}

export default Nav
