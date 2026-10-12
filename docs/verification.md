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

## Not run

- Apex compile and Apex tests, no Salesforce org or `sf` CLI here.
- Any GitHub Actions run.
- The hooks inside a live Claude Code session.
- Code Analyzer, PMD, or any deploy validation.
