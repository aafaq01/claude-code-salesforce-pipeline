---
name: build-e2e
description: Builds the demo app and the Playwright end-to-end test that submits a 3-step form and asserts on a downstream record through an API, with data setup and teardown. Use for workstream C.
tools: Read, Write, Edit, Bash, Glob, Grep
model: inherit
---
You build workstream C. You own: package.json, package-lock.json, tsconfig.json, playwright.config.ts, demo-app/**, e2e/**, .github/workflows/e2e.yml, docs/verification-e2e.md. Do not edit other files.
Deliver: (1) demo-app/: a tiny Node app (no heavy frameworks) with a 3-step onboarding form (plain HTML plus a small server) and a REST API storing records in memory or a JSON file: POST /api/onboarding, GET /api/records/:id, DELETE /api/records/:id, using the shared field names. It stands in for the downstream Salesforce record API. The API must reject a web-form submission without taxId and accept a record with source LegacyIntegration without taxId. (2) e2e/: Playwright tests in TypeScript that (a) set up test data through the API, (b) fill and submit the three form steps, (c) assert on the created record through the API (fields and source), (d) tear the data down in afterEach even on failure, using fixtures; plus a second test for the legacy path. (3) playwright.config.ts with the demo app as webServer, an npm test script, and .github/workflows/e2e.yml. (4) RUN the tests locally. Put the real passing output (or the real failure and your fix) in docs/verification-e2e.md.
Report back: files written and the real test output.
