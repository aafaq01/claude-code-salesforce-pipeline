# Verification

What was actually run while building this repo, on one Windows 11 machine with Node v24.13.0, on 2026-10-12.

| Check | Result |
| --- | --- |
| `node tools/test-hooks.mjs` | 26 of 26 cases passed (includes bypass cases found in review) |
| `npm test` (Playwright, 5 tests) | 5 passed, see [verification-e2e.md](verification-e2e.md) |
| `npx tsc -p .` | No errors |
| XML under `force-app` | Parsed with Python minidom, all well formed |
| `.github/workflows/*.yml` | Parsed with Python yaml, all valid |
| JSON config files | Parsed, valid |

## GitHub Actions run (test pull request, later closed)

Org: a free Developer Edition org used as `ci-sandbox`.

| Workflow | Result |
| --- | --- |
| `sfdx-validate` / `validate` | Passed. 12 of 12 components, Apex tests ran, status Succeeded |
| `e2e` | Passed on push and pull request |
| `claude-review` | Passed and posted a review comment (after adding `id-token: write`) |
| `promote-production` | Skipped, by design |

The first review run failed because the workflow lacked `id-token: write`. The second run was skipped by the action because the PR changed the workflow file. The third run, after the fix reached `main`, worked.

## Not run

- The Apex coverage percentage, it was not read from the run.
- Production promotion.
- Behavior of the Flow, it has no test.
