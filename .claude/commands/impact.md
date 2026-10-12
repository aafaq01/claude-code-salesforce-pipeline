---
description: List cross-system impact of the current diff
argument-hint: [base branch, default main]
---
Base branch: $ARGUMENTS (use main if empty).

Run `git diff <base>...HEAD`. If that is empty, run `git diff HEAD`.

Use the change-impact-reviewer subagent on that diff. Report impacts on Salesforce metadata, the demo API contract, the form, and the legacy integration path. Mark each impact as breaking, risky or safe. Do not edit files.
