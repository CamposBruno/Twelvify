function Privacy() {
  return (
    <main className="bg-background-light min-h-screen py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12">

        <header>
          <a href="/" className="font-punk text-primary underline">← Back to Twelvify</a>
          <h1 className="font-display text-6xl text-slate-900 mt-8">Privacy Policy</h1>
          <p className="font-punk text-slate-600">Last updated: February 2026</p>
        </header>

        {/* Section 1 — Overview */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">Overview</h2>
          <p className="font-punk text-slate-700 leading-relaxed">
            Twelvify is a browser extension that simplifies complex text using AI. When you highlight
            text on a webpage and click the Twelvify icon, we temporarily send that text to a
            third-party AI service for processing. The result — a simplified version of your text —
            is returned to you. We do not store, log, or retain your selected text at any point.
          </p>
        </section>

        {/* Section 2 — Data We Collect */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">Data We Collect</h2>
          <ul className="font-punk text-slate-700 space-y-4 leading-relaxed">
            <li>
              <span className="font-bold">Your selected text:</span> Temporarily transmitted to our
              server and forwarded to a third-party AI service for processing. Not stored after the
              request completes.
            </li>
            <li>
              <span className="font-bold">Anonymous usage statistics:</span> We count the number of
              simplification requests (no user identity, no text content). Statistics are anonymous
              and aggregated.
            </li>
            <li>
              <span className="font-bold">Server logs:</span> Standard HTTP request logs (IP
              address, timestamp, request method) retained for security monitoring and debugging.
              These are standard server logs, not content logs.
            </li>
          </ul>
        </section>

        {/* Section 3 — How We Use Your Data */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">How We Use Your Data</h2>
          <ul className="font-punk text-slate-700 space-y-3 leading-relaxed list-disc list-inside">
            <li>To generate simplified text via a third-party AI service</li>
            <li>To monitor server health and diagnose issues</li>
            <li>To understand usage patterns in aggregate (no individual tracking)</li>
          </ul>
        </section>

        {/* Section 4 — What We Don't Do */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">What We Don't Do</h2>
          <ul className="font-punk text-slate-700 space-y-3 leading-relaxed">
            <li><span className="font-bold">We do NOT log or store your selected text</span></li>
            <li><span className="font-bold">We do NOT track your identity, browsing history, or behavior across sites</span></li>
            <li><span className="font-bold">We do NOT sell your data to advertisers or third parties</span></li>
            <li><span className="font-bold">We do NOT use your text to train AI models</span></li>
            <li><span className="font-bold">We do NOT create user profiles or persistent records</span></li>
          </ul>
        </section>

        {/* Section 5 — Data Security */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">Data Security</h2>
          <p className="font-punk text-slate-700 leading-relaxed">
            All data transmitted between Twelvify and our servers is encrypted using HTTPS. Your
            selected text is processed transiently — it is not written to any database or persistent
            storage. Server logs are retained for a maximum of 30 days for security purposes.
          </p>
        </section>

        {/* Section 6 — Your Rights */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">Your Rights</h2>
          <p className="font-punk text-slate-700 leading-relaxed">
            Twelvify does not maintain user accounts or persistent user data. There is no profile to
            delete. If you have questions about data handling or want to request information, contact
            us at the address below.
          </p>
        </section>

        {/* Section 7 — Contact */}
        <section className="border-4 border-slate-900 p-8 space-y-4">
          <h2 className="font-display text-3xl text-primary">Contact</h2>
          <p className="font-punk text-slate-700 leading-relaxed">
            Questions about this privacy policy? Email:{' '}
            <a href="mailto:privacy@twelvify.com" className="text-primary underline">
              privacy@twelvify.com
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t-4 border-slate-900 flex justify-between items-center font-punk text-xs uppercase tracking-widest text-slate-500">
          <p>© 2026 Twelvify</p>
          <a href="/" className="hover:text-primary transition-colors underline">Home</a>
        </footer>

      </div>
    </main>
  )
}

export default Privacy
