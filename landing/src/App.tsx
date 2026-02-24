import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        {/* Playground section placeholder — implemented in Phase 6 */}
        <section id="try-it" className="py-32 bg-slate-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="font-punk text-slate-400 text-lg">Playground coming soon — Phase 6</p>
          </div>
        </section>
        <Features />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}

export default App
