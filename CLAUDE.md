# CLAUDE.md

Project rules for Claude Code. This repo is a personal reference implementation of a safe cross-system pipeline. It holds no client or employer code.

## The story

A customer fills a 3-step onboarding form (company, owner, product). The submission creates a `Customer_Onboarding__c` record. A legacy integration creates the same record without the form. A validation rule once required `Tax_Id__c` for every record and broke the legacy path. The fix is `Require_Tax_Id`, which skips `Source__c = LegacyIntegration`. Read `docs/INCIDENT-validation-rule-regression.md` before touching that rule.

## Architecture map

| Path | What it is |
| --- | --- |
| `force-app/main/default/` | Salesforce metadata: object, fields, `Require_Tax_Id`, Flow `Onboarding_Assign_Owner`, Apex `OnboardingService`, `LegacyIntegrationHandler` and their tests |
| `demo-app/` | Node server and 3-step form. Stands in for the downstream record API |
| `e2e/` | Playwright tests with setup and teardown through the API |
| `.claude/hooks/` | `guard-production.mjs` (blocks prod deploys and pushes to main), `warn-apex-tests.mjs` |
| `.claude/commands/` | `/plan-change`, `/impact`, `/ship-checklist` |
| `.claude/agents/` | Product subagents `change-impact-reviewer`, `apex-test-writer`, and the `build-*` agents that built this repo |
| `.github/workflows/` | `sfdx-validate.yml`, `e2e.yml`, `claude-review.yml` |
| `docs/` | Runbook, incident write-up, branch protection, verification notes |

API contract: `POST /api/onboarding`, `GET /api/records/:id`, `DELETE /api/records/:id`. JSON fields: `companyName`, `ownerEmail`, `product`, `taxId`, `source`.

Orgs: `ci-sandbox` is safe to deploy to. `prod` is never touched by Claude. GitHub environment `production` needs human reviewers.

## Commands

- Hook tests: `node tools/test-hooks.mjs`
- End-to-end tests: `npm test` (starts the demo app itself)
- Type check: `npx tsc -p .`
- Apex tests, sandbox only: `sf apex run test --target-org ci-sandbox --test-level RunLocalTests --wait 10`
- Deploy check, sandbox only: `sf project deploy validate --source-dir force-app --test-level RunLocalTests --target-org ci-sandbox`

## Never do this

- Never deploy to `prod`, and never push to `main` or force push. Work on a feature branch and open a pull request.
- Never edit `.github/workflows/**` without a human asking for it.
- Never change Apex without adding or updating its test class in the same change.
- Never put secrets in the repo. Use `${SFDX_AUTH_URL}` and GitHub secrets.
- Never claim a deployment, a CI run or a passing test that you did not run.

## Before you change anything

1. Run `/plan-change` and list every path the change touches: Salesforce, the API, the form, the legacy integration.
2. Any change to a field or validation rule must be checked against the legacy path (`Source__c = LegacyIntegration`, no `Tax_Id__c`).
3. Run `/impact` on the diff, then `/ship-checklist` before the pull request.

## Style

Short, plain sentences. No em dashes or en dashes in docs or code comments. Docs for non-developers must avoid unexplained jargon.
