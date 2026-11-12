# Merchant dashboard

The web app merchants use to run their business on paygate. Next.js 16 (App
Router), React 19, TypeScript, CSS Modules. No UI library: a small set of
shared components and design tokens.

It is a separate repository from the paygate API (Go). The two only talk
over HTTP: this app's server calls the API at `PAYGATE_API_URL`.

## Run it

Needs Node.js 20.9+ (see `.nvmrc`) and the paygate API running
(`go run ./cmd/paygate` in the API repository).

```bash
cp .env.example .env.local     # PAYGATE_API_URL=http://localhost:8080
npm install
npm run dev                    # http://localhost:3000
```

Production: `npm run build && npm start`. Set `DASHBOARD_URL=https://your-dashboard`
in the API's `.env` so emails (password reset) link here.

## Folder structure

Feature-based: each business area owns its screens, components and API calls.
Shared building blocks live outside the features.

```
src/
  app/                     routing only: thin pages that render a feature screen
    (auth)/                login, signup, verify, forgot, reset-password (split layout)
    (dashboard)/           pages behind sign-in (sidebar + top bar)
    api/auth/*             sign-in routes (set httpOnly cookies)
    api/proxy/[...path]    the only way to the Go API (allow-list, CSRF, token refresh)
    layout.tsx             theme from cookie, providers
  features/                one folder per business area
    analytics/   dashboard: KPIs, revenue chart, payment methods, verification
    auth/  balances/  payments/  links/  payouts/
    disputes/  reports/  developers/  kyc/  security/
      api.ts               typed calls to the API for this feature
      components/          the feature's screens and parts
      index.ts             what other code may import
  components/
    ui/                    shared components (Button, Input, Card, DataTable, Alert, …)
    layout/                AppShell, sidebar navigation, top bar, theme toggle
  hooks/                   useResource (load data), useAction (run a button/form action)
  providers/               test/live environment
  lib/
    api/client.ts          browser API client, errors, idempotency keys
    server/                server-only: session cookies, CSRF check, calls to the Go API
    format.ts              money, dates, amount parsing
  styles/                  tokens.css (colours, type, spacing), base.css, utilities.css
  proxy.ts                 sign-in redirect and per-request Content-Security-Policy
```

Rules: pages in `app/` stay thin; features import shared code and other
features only through their `index.ts`; colours only come from tokens.

## Interactions

* **Ctrl K / ⌘K**: search pages, actions, a payment ID or a reference.
* **Bell**: things that need attention (disputes to answer, verification, two-factor, failed webhooks).
* **Switcher next to the logo** or the "Test mode" pill: test or live data.
* Dashboard numbers are computed in the browser from the payments list
  (up to 3,000 payments per view); reports give the full figures.

## Light and dark mode

`styles/tokens.css` defines every colour once with `light-dark(light, dark)`.
The toggle in the top bar (Light / Dark / System) saves a `pg_theme` cookie;
the server renders `<html data-theme="…">` from it, so the first paint has
the right colours (no flash, no inline script). To restyle the app, change
the tokens; components follow.

## Design

[docs/design-prompt.md](docs/design-prompt.md) is a ready-to-use prompt for a
design tool or designer. Its deliverables use the same token names as the code.

## Pages

| Page | What the merchant does |
|---|---|
| Sign in, sign up, verify, reset password | email code; authenticator step when MFA is on |
| Dashboard | revenue, payments, success rate, average (vs the previous period; click one to chart it), interactive revenue chart (7/30/90 days, ETB/USD, hover or arrow keys, table view), payment-method mix, verification progress, recent transactions |
| Payments | filter, search, sort, select rows and export them as CSV, row menu; detail with history timeline and refunds |
| Payment links | create, copy, deactivate |
| Payouts | request a transfer to a bank account; history |
| Disputes | evidence (text and files), submit or accept |
| Reports | payments and balance statement as CSV |
| Developers | API keys (create, roll, revoke), webhooks, delivery retries |
| Business verification | KYC profile, documents, Fayda, submit for review |
| Security | authenticator app (QR), recovery codes, change password |

## How it is secured

* **No tokens in the browser.** Sign-in goes through `/api/auth/*`; tokens are
  kept in `httpOnly`, `SameSite=Lax` cookies (`Secure` in production).
* **One door to the API.** `/api/proxy/...` adds the token, refreshes it once
  when it expires, and forwards only an allow-list of merchant paths. Staff
  routes (`/admin`) are not reachable from here.
* **CSRF.** Changes need the `X-Requested-With: paygate-web` header and a
  same-host `Origin`.
* **Content-Security-Policy with a per-request nonce** (`src/proxy.ts`): only
  this app's scripts run, no inline scripts, no framing, no foreign
  connections. Plus HSTS, `nosniff`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy`, COOP/CORP (`next.config.ts`).
* **Money actions are idempotent.** Payouts and refunds send an
  `Idempotency-Key`; a double click or a retry after a network error runs once.
* **Secrets shown once** (API keys, webhook secrets), never stored here.
* **No open redirects**: the `next` page after sign-in must be a local path.
* Server-only modules are marked with `server-only`, so they can never be
  bundled into browser code.
