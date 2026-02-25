# Phase 9: Backend Production Deploy - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the Express backend to Render in production with health monitoring, zero-downtime deploys, and CORS correctly scoped for the Chrome extension and twelvify.com landing page. Update the extension's production build to reference the Render URL.

</domain>

<decisions>
## Implementation Decisions

### Environment & secrets
- Store all secrets (Anthropic API key, etc.) in Render's dashboard environment variables — no external vault
- Use standard NODE_ENV=production on Render, NODE_ENV=development locally
- Fresh Render setup — phase includes account/service creation steps
- Extension production build has the Render URL hardcoded; dev build uses localhost

### CORS policy
- Extension ID not yet known — allow chrome-extension://* during development, lock to specific ID once published
- twelvify.com is already deployed and will call the backend — include in CORS whitelist
- Strict CORS always — same whitelist approach in dev and prod, with localhost explicitly added for dev
- Backend serves extension + landing page only — no public API, no additional origins needed

### Deploy workflow
- Auto-deploy on push to main branch
- Use Render's built-in zero-downtime deploys with automatic rollback on health check failure
- render.yaml checked into repo — Infrastructure as Code, version controlled and reproducible

### Health & monitoring
- Deep health check: verify server running, Anthropic API connectivity (actual minimal API call), memory usage
- Health endpoint includes version info: git SHA and build timestamp for debugging
- Health endpoint is public — standard for load balancers and monitoring
- Rely on Render's built-in monitoring — no external uptime service
- Structured JSON logs for better searchability and parsing in Render's log viewer

### Rate limiting
- Basic rate limiting included in this phase — 30 requests/min per IP
- Conservative threshold to protect Anthropic API costs

### Claude's Discretion
- Exact render.yaml configuration details
- JSON log format and library choice
- Rate limiting middleware implementation
- Health check response structure
- Build script configuration

</decisions>

<specifics>
## Specific Ideas

- Health endpoint should make an actual (tiny) Anthropic API call to catch expired or invalid keys, not just check env var existence
- render.yaml in repo for reproducible infrastructure
- Structured JSON logs from day one — not console.log

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-backend-production-deploy*
*Context gathered: 2026-02-25*
