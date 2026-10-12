---
description: Pre-PR checklist for the current branch
---
Check the current branch and report PASS or FAIL for each item with one line of evidence:
1. Not on main. Branch is pushed to a feature branch only.
2. Every changed class under force-app has a changed matching *Test class.
3. Apex tests pass on ci-sandbox: `sf apex run test --target-org ci-sandbox --test-level RunLocalTests --wait 10`. If you cannot run them, say so. Do not claim a pass.
4. `node tools/test-hooks.mjs` passes.
5. No change to .github/workflows without a human.
6. No secrets in the diff.
7. Impact on API, form and legacy path was reviewed (run /impact).
8. docs/ updated if behavior changed.

End with: ready for PR, or the list of blockers. Never deploy to prod.
