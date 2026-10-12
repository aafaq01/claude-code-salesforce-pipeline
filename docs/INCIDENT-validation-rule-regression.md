# Post-mortem: validation rule regression on onboarding records

Status: blameless review. It describes how the system allowed the problem, not who caused it. No numbers, dates or names are given because none are recorded here.

This is a reference scenario in a personal repo. It is not drawn from client or employer work.

## Summary

The first version of the `Require_Tax_Id` validation rule on `Customer_Onboarding__c` required a Tax Id on every record. It had no condition on the `Source__c` field. Records arriving through the legacy integration (`LegacyIntegrationHandler`) do not carry a Tax Id, so they were rejected and the legacy path broke. The rule was later corrected so a Tax Id is required unless `Source__c` is `LegacyIntegration`.

## What happened

The team added the rule to make sure web form records always have a Tax Id. The rule was simple and correct for that case. It did not account for a second way records arrive. Nothing in the process asked what else creates these records.

## Impact

Records from the legacy integration failed to save while the first version of the rule was active. The size and duration of the impact are not recorded here and are not guessed at.

## Timeline in plain terms

1. First, the team added the rule with no Source condition.
2. Then it was released after being checked by reading it, not by a test that saved a legacy record.
3. Later, the legacy path started failing on save.
4. Then the team traced the failures to the rule.
5. Finally, the team added the Source condition and the guard rails below.

## Root cause

Three gaps lined up:

- No test saved a record the way the legacy integration does, so the rule could not fail anything.
- Nothing prompted anyone to ask what else creates these records (`LegacyIntegrationHandler`, the Flow `Onboarding_Assign_Owner`, `OnboardingService`).
- The release path did not force every Apex test to run in a realistic org before production.

## The fix in the rule

Tax Id is now required unless `Source__c` is `LegacyIntegration`. A blank Source counts as not legacy, so a Tax Id is still required. This is a deliberate choice: when in doubt, the rule asks for the Tax Id.

## What changed

- **Regression test.** `OnboardingServiceTest` and `LegacyIntegrationHandlerTest` pin the expected behaviour, including what `Require_Tax_Id` must accept and reject. If the rule drifts, a test fails.
- **Impact check.** `/impact` and the `change-impact-reviewer` subagent list what else a change touches before it is made.
- **Test warning.** `warn-apex-tests.mjs` warns when an Apex class changes without its test.
- **Validation.** `sfdx-validate.yml` deploys a dry run to `ci-sandbox` with all Apex tests on every PR, when the `SFDX_AUTH_URL` secret is set. Without the secret (for example on a fork) it only checks the XML and says so in the log, so a green check then means less. Set the secret before relying on it.
- **Review.** `claude-review.yml` adds an AI review comment, and a human reviewer on the repo must approve the PR.
- **Controlled release.** Production promotion is a manual workflow in the `production` environment with required reviewers. `guard-production.mjs` blocks deploys to `prod` and pushes to `main` from the tooling.

## How the pipeline now prevents this

The same edit today would first go through `/plan-change` and `/impact`, which name the legacy integration as affected. Changing the rule without updating its tests would trigger a warning. If the behaviour still shifted, the all-tests validation would fail on the PR. A reviewer would see the red check, and production would not be reached without a second approval.

## Lessons

- A rule that matters needs a test that says so.
- "What else uses this?" is a question to ask before the edit, not after.
- Several small gates are better than one careful person.
