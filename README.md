# PassProve — configurable verification widget

A React/TypeScript widget prototype for presenting age-verification choices inside an e-commerce interface. The repository combines configurable UI components, demonstration pages and Supabase Edge Function source.

**Status:** Portfolio prototype; packaging is currently incomplete. Provider integration and production readiness are not established.

## Scope

- Configurable branding, labels, button style and visibility of verification methods in `PassProveWidget.tsx`.
- UI flows for face scanning, document/OCR, QR codes and repeated verification, alongside BankID/mojeID choices.
- Supabase function source for verification sessions, method handling, pricing and result storage.

## Technology

Next.js, React, TypeScript, Tailwind CSS, Supabase, Rollup.

## Architecture and source map

- `PassProveWidget.tsx` — public React component and its props
- `components/` — verification UI and shared components
- `supabase/functions/` — backend function source
- `rollup.config.cjs` — library bundle configuration
- `src/types/index.d.ts` — type declaration entry

## Local development

Requires Node.js and npm. The declared package workflow is:

```sh
npm install
npm run build
# Watch library source:
npm run dev
```

Build is blocked by the missing entry point described below; these commands are documented, not reported as passing. `npm run serve` serves a `dev` directory that also needs a validated demo setup.

## Configuration and limitations

The Rollup configuration expects `src/index.ts`, which is absent from this checkout. It also consumes generated type declarations under `dist/esm/types/`; packaging needs repair and validation before a release. `npm run dev` starts the Rollup watcher, not a Next.js web server. The repository declares `private: true`; publication of a package named `passprove-widget` has not been verified.

The BankID function contains random/demo logic; available UI choices are not evidence of certified identity verification. A client callback must not be trusted as authoritative proof of age. Use synthetic data until backend authorization, provider callbacks and data handling have been reviewed.

## Portfolio relevance

Demonstrates configurable component design, typed interfaces and the boundary between embedded UI and backend services. It is a useful integration case study with explicit remaining engineering work.

## Documentation next steps

Capture screenshots using synthetic data, document a reproducible test run, and record which integrations have been verified. Keep credentials and deployment-specific configuration outside version control.
