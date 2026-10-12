# E2E verification

Run on 2026-10-12.

- OS: Windows 11 Pro 10.0.26200
- Node: v24.13.0
- @playwright/test: 1.64.0 (chromium installed with `npx playwright install chromium`)

## Commands

```
npm install
npx playwright install chromium
npx tsc -p .
npm test
```

`tsc` finished with no errors.

## Result

```
Running 5 tests using 2 workers

  ok 1 e2e\legacy.spec.ts:4:5 › LegacyIntegration without taxId returns 201 and stores a record (190ms)
  ok 3 e2e\legacy.spec.ts:26:5 › WebForm without taxId is still rejected with 400 (34ms)
  ok 2 e2e\onboarding.spec.ts:5:5 › web form creates a record with source WebForm (1.6s)
  ok 4 e2e\onboarding.spec.ts:30:5 › web form shows an error when taxId is missing (612ms)
  ok 5 e2e\onboarding.spec.ts:40:5 › seeded record can be read back (setup and teardown via API) (52ms)

  5 passed (7.3s)
```

## What the tests cover

- Web form, 3 steps: fill, submit, then read the record back through `GET /api/records/:id` and assert the fields and `source: WebForm`.
- Web form without taxId: the page shows the 400 error.
- Legacy regression: `LegacyIntegration` without `taxId` returns 201 and the record is stored.
- Web path guard: `WebForm` without `taxId` still returns 400.
- Setup and teardown: the `seed` and `track` fixtures create and delete records through the API. Teardown runs after each test, also when it fails.

## Notes

- The first run timed out waiting for the web server. Docker Desktop (`com.docker.backend`) already listens on port 3100 on this machine, so the health check hit the wrong process. The default port is now 3417. Set `PORT` to change it.
- CI settings are in `.github/workflows/e2e.yml` (checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2 as reported by the GitHub releases API on 2026-10-12). The workflow itself has not been run on GitHub.
