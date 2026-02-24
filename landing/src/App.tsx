import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Playground from './components/Playground'
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
        <Playground />
        <Features />
        <CallToAction />
      </main>
      <Footer />
    </>
  )
}

export default App
