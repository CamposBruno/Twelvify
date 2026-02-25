import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { trackPageView } from './analytics'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Hook for SPA-style navigation tracking (no-op now; Plausible handles initial page view)
setTimeout(() => trackPageView(), 0)
