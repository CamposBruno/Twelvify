import Icon from './Icon'

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-24 border-t-8 border-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-20 relative">

          {/* Brand column */}
          <div className="space-y-8 max-w-md">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2 border-2 border-white rotate-[-10deg]">
                <Icon name="pedal_bike" className="text-white w-8 h-8" />
              </div>
              <span className="text-4xl font-display uppercase tracking-tighter">Twelveify</span>
            </div>
            <p className="font-punk text-slate-400 text-lg leading-relaxed italic border-l-2 border-primary pl-4">
              Making the internet readable for everyone, one sentence at a time. The truly invisible browser assistant.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 font-punk font-bold uppercase text-sm">

            {/* Product */}
            <div className="space-y-6">
              <h5 className="text-primary text-lg font-display">Product</h5>
              <ul className="space-y-4">
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Extension</a></li>
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Enterprise</a></li>
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Pricing</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <h5 className="text-primary text-lg font-display">Resources</h5>
              <ul className="space-y-4">
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Documentation</a></li>
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">API</a></li>
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Changelog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-6">
              <h5 className="text-primary text-lg font-display">Legal</h5>
              <ul className="space-y-4">
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Privacy</a></li>
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Terms</a></li>
                <li><a className="hover:text-primary transition-colors hover:underline" href="#">Security</a></li>
              </ul>
            </div>

          </div>

          {/* ZINE watermark */}
          <div className="absolute -right-20 -top-10 text-[10rem] font-display text-white/5 select-none rotate-12">ZINE</div>

        </div>

        {/* Bottom bar */}
        <div className="pt-12 border-t-4 border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 font-punk text-xs uppercase tracking-widest text-slate-500">
          <p>© 2024 Twelveify Inc. — Deal with it.</p>
          <div className="flex gap-10">
            <a className="hover:text-primary transition-colors underline decoration-2 underline-offset-4" href="#">Twitter</a>
            <a className="hover:text-primary transition-colors underline decoration-2 underline-offset-4" href="#">GitHub</a>
            <a className="hover:text-primary transition-colors underline decoration-2 underline-offset-4" href="#">Discord</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
