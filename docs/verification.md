# Verification

Everything below was run on 2026-10-12. The first table is local (one Windows 11 machine, Node v24.13.0). The second section is GitHub Actions.

| Check | Result |
| --- | --- |
| `node tools/test-hooks.mjs` | 26 of 26 cases passed (includes bypass cases found in review) |
| Guard hook in a live Claude Code session | It blocked a real `git push` to `main` attempted by Claude. Seen in the session, no log file kept |
| `npm test` (Playwright, 5 tests) | 5 passed, see [verification-e2e.md](verification-e2e.md) |
| `npx tsc -p .` | No errors |
| XML under `force-app` | Parsed with Python minidom, all well formed |
| `.github/workflows/*.yml` | Parsed with Python yaml, all valid |
| JSON config files | Parsed, valid |

## GitHub Actions run (test pull request, later closed)

Org: a free Developer Edition org used as `ci-sandbox`.

| Workflow | Result |
| --- | --- |
| `sfdx-validate` / `validate` | Passed. 12 of 12 components, 9 Apex tests passing, 0 failing, status Succeeded. [run](https://github.com/aafaq01/claude-code-salesforce-pipeline/actions/runs/38229837414) |
| `e2e` | Passed on push and pull request. [run](https://github.com/aafaq01/claude-code-salesforce-pipeline/actions/runs/38232283778) |
| `claude-review` | Passed and posted a review comment, after adding `id-token: write`. [run](https://github.com/aafaq01/claude-code-salesforce-pipeline/actions/runs/38232283946) |
| `promote-production` | Skipped, by design |

The first review run failed because the workflow lacked `id-token: write`. The second run was skipped by the action because the PR changed the workflow file. The third run, after the fix reached `main`, worked.

## Not run

- The Apex coverage percentage, it was not read from the run.
- Production promotion.
- Behavior of the Flow, it has no test.
