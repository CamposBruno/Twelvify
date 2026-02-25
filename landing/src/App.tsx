import { lazy, Suspense } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'

// Lazy-load Playground: it's below the fold and uses SSE logic not needed for initial render
const Playground = lazy(() => import('./components/Playground'))

function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Suspense fallback={<div className="py-32 bg-slate-100" />}>
          <Playground />
        </Suspense>
        <Features />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}

export default App
