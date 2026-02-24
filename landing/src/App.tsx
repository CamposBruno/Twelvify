function App() {
  return (
    <main className="min-h-screen p-12 space-y-12">

      {/* Typography: heading rotation + font-display */}
      <section>
        <h1 className="text-5xl">Design System Demo</h1>
        <h2 className="text-3xl mt-4">Zine / Punk Aesthetic</h2>
        <h3 className="text-2xl mt-4">Foundation Phase</h3>
        <p className="font-punk text-lg mt-4 border-l-4 border-primary pl-4">
          Special Elite paragraph text — font-punk applied via Tailwind.
        </p>
        <p className="font-body text-base mt-2 text-slate-600">
          Inter body text — font-body applied via Tailwind.
        </p>
      </section>

      {/* Primary color swatches */}
      <section className="flex gap-4 flex-wrap">
        <div className="bg-primary text-white px-6 py-4 font-punk font-bold">
          bg-primary #f56060
        </div>
        <div className="bg-background-light border-2 border-slate-900 px-6 py-4 font-punk">
          bg-background-light #f8f6f6
        </div>
        <div className="bg-slate-900 text-white px-6 py-4 font-punk">
          bg-slate-900 (dark base)
        </div>
      </section>

      {/* zine-box: border + dot-grid + shadow */}
      <section>
        <div className="zine-box bg-white p-8 max-w-sm">
          <p className="font-punk font-bold">.zine-box applied</p>
          <p className="text-sm mt-2">Border-2 slate-900 + 8px black shadow + dot-grid background</p>
        </div>
      </section>

      {/* paper-tear clip-path */}
      <section>
        <div className="paper-tear bg-primary text-white p-8 max-w-sm">
          <p className="font-display text-2xl uppercase">.paper-tear</p>
          <p className="font-punk text-sm mt-2">Polygon clip-path for torn edge effect</p>
        </div>
      </section>

      {/* Button with hover press effect */}
      <section>
        <button className="bg-primary text-white border-4 border-slate-900 px-10 py-6 text-2xl font-display shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          Install Twelveify
        </button>
      </section>

      {/* Material Symbols icon */}
      <section className="flex items-center gap-4">
        <div className="bg-primary p-2 border-2 border-slate-900 rotate-[-4deg]">
          <span className="material-symbols-outlined text-white text-3xl">pedal_bike</span>
        </div>
        <span className="font-display text-3xl uppercase tracking-tighter">Twelveify</span>
      </section>

      {/* Zero border-radius verification */}
      <section className="flex gap-4 flex-wrap">
        <div className="bg-slate-200 border-2 border-slate-900 rounded-lg px-6 py-4 font-punk text-sm">
          rounded-lg → should be 0px (sharp corner)
        </div>
        <div className="bg-slate-200 border-2 border-slate-900 rounded-xl px-6 py-4 font-punk text-sm">
          rounded-xl → should be 0px (sharp corner)
        </div>
        <div className="bg-primary text-white border-2 border-slate-900 rounded-full px-6 py-4 font-punk text-sm">
          rounded-full → should be 9999px (pill shape)
        </div>
      </section>

    </main>
  )
}

export default App
