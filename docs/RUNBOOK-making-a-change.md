# Making a change safely: a guide for product and operations people

You do not need to be a developer to use this. You need to know what you want changed, and why. Claude Code and the pipeline handle the rest, and people check the important parts along the way.

This repo is a personal reference implementation. It holds no client or employer code.

## 1. What the pipeline is

Think of the pipeline as a set of safety gates between your idea and the live system.

- You describe a change in plain words.
- Claude Code, an AI coding assistant, proposes a plan and then makes the edit.
- Automatic checks run tests and an AI review.
- A person approves.
- Only then does the change reach the real system.

The real system here is a Salesforce org. The sample feature is customer onboarding: the object `Customer_Onboarding__c`, a rule called `Require_Tax_Id`, a Flow called `Onboarding_Assign_Owner`, and some Apex code (`OnboardingService`, `LegacyIntegrationHandler`).

Two Salesforce environments matter:

- `ci-sandbox`: a practice copy. Safe to break. Checks run here.
- `prod`: the real one. Customers and colleagues depend on it.

## 2. Describe a change to Claude Code

Write it like you would to a careful colleague. Say three things:

1. What should be different.
2. Why you want it.
3. What must not change.

Example: "Onboarding records for companies outside the US should not need a Tax ID. US records must still need one. Do not touch the legacy integration."

Do not worry about technical words. If Claude needs more, it will ask.

## 3. The slash commands

A slash command is a shortcut you type that starts a prepared routine. Type it at the start of a line.

- `/plan-change`: Claude writes a plan before touching anything. You read it and say yes, no, or "change this part". Start here every time.
- `/impact`: Claude lists what else the change could affect, such as other rules, Flows or code that use the same thing. Read this to catch surprises.
- `/ship-checklist`: Claude walks through the final checks before the pull request: tests, review, and what still needs a human.

Two helper reviewers also exist, called subagents (small specialist assistants). `change-impact-reviewer` looks for side effects. `apex-test-writer` writes the tests for code changes. Claude uses them for you.

## 4. What happens automatically

You do not need to start these.

- **Guard hooks.** A hook is a small script that runs at a set moment. Two matter to you:
  - `guard-production.mjs` blocks Claude from deploying to `prod` and from pushing straight to `main`. If you see it stop something, it is working.
  - `warn-apex-tests.mjs` warns if Apex code changed without its test. A test is a small program that proves the code still does what we expect.
- **Validation (`sfdx-validate.yml`).** A dry run of the change against `ci-sandbox`, with all Apex tests. "Validate" means "check that it would work", without making it live.
- **AI review (`claude-review.yml`).** Claude posts a review comment on each pull request.
- **Browser tests (`e2e.yml`).** Automated clicks through the app, like a very fast, very patient tester.

## 5. What needs a human, and who

Automation never approves its own work.

- **The pull request.** A pull request (PR) is a request to merge a change into the main code. A reviewer on the repo must approve it. Direct pushes to `main` are not allowed (see `docs/branch-protection.md`).
- **The production release.** Releasing to `prod` happens only by hand, through a manual workflow run in the GitHub environment called `production`. The reviewers listed on that environment must approve before it proceeds.

If you are unsure who the reviewers are, ask the repo owner.

## 6. Reading a failing check

On the PR page, each check shows a green tick or a red cross. A red cross is information, not blame.

1. Click "Details" next to the red check.
2. Look for the first line marked as an error. The first one usually explains the rest.
3. Copy that line into Claude Code and ask: "What does this mean, and what is the smallest fix?"
4. Let Claude fix it, then the checks run again.

Common messages in plain words:

- "Test failed" or "Assertion": the code no longer does what a test expects. Either the code or the test needs updating, and a human decides which.
- "Validation rule" error: the data was rejected by a rule such as `Require_Tax_Id`.
- "Coverage" error: some code has no test. Ask Claude to use `apex-test-writer`.

For how to confirm things really work, see `docs/verification.md`.

## 7. What never to touch

- Never deploy to `prod` yourself, and never ask Claude to get around the guard hook.
- Never put passwords, tokens or keys in a chat or a file. Secrets (`ANTHROPIC_API_KEY`, `SFDX_AUTH_URL`) live in GitHub settings only.
- Never edit `.claude/hooks/` or `.github/workflows/` without the repo owner. These are the safety gates.
- Never merge a PR with a red check "just this once".
- Never delete or loosen a validation rule such as `Require_Tax_Id` without a plan and a test. See `docs/INCIDENT-validation-rule-regression.md` for why.

## 8. How to roll back

Rolling back means returning to how things were before.

- **Before merge:** close the PR. Nothing has changed.
- **After merge, before production:** ask Claude to prepare a new PR that reverses the change (a "revert"). It follows the same checks.
- **After a production release:** tell the repo owner straight away. The fix is a new, reviewed release of the previous version, through the same manual `production` workflow and approval. Do not try to fix it by hand in Salesforce.

Rolling back is normal and nothing to be embarrassed about.

## 9. Who to ask

- Not sure what to change: ask the repo owner.
- A check is red and the message is unclear: paste it to Claude Code, then ask the repo owner if still stuck.
- Anything touching `prod`: the production environment reviewers.

## Glossary

- **Apex:** Salesforce's programming language.
- **Branch:** your own copy of the code to work on, so `main` stays safe.
- **CI (continuous integration):** automatic checks that run whenever code changes.
- **Flow:** a Salesforce automation built visually, without code.
- **Hook:** a small script that runs at a set moment and can stop an action.
- **Main:** the branch holding the approved, trusted version.
- **Object:** a type of record in Salesforce, like a table. Example: `Customer_Onboarding__c`.
- **Org:** one Salesforce environment, such as `prod` or `ci-sandbox`.
- **Pull request (PR):** a request to merge a change, with a place to review and discuss.
- **Sandbox:** a practice copy of Salesforce where mistakes are safe.
- **Slash command:** a shortcut like `/plan-change` that starts a prepared routine.
- **Subagent:** a small specialist assistant that Claude calls for one job.
- **Test:** a small program that checks something works.
- **Validation rule:** a rule that rejects bad data when saving, like `Require_Tax_Id`.

## One-page checklist

Before you start
- [ ] I can say what should change, why, and what must not change.

While making the change
- [ ] I ran `/plan-change` and read the plan before saying yes.
- [ ] I ran `/impact` and understood what else could be affected.
- [ ] Any code change has its test (no `warn-apex-tests` warning left).

Before the PR
- [ ] I ran `/ship-checklist`.
- [ ] The PR description says what, why, and what was not changed.

On the PR
- [ ] Validation to `ci-sandbox` is green. Open the log and check it did not say "Org validation skipped".
- [ ] Browser tests are green.
- [ ] I read the AI review comment (if there is none, the secret may be missing or the PR is from a fork) and dealt with each point.
- [ ] A reviewer on the repo approved the PR.

Production
- [ ] The release was started by hand in the `production` environment.
- [ ] The production environment reviewers approved it.
- [ ] I know the rollback step and who to call.

If anything is red or unclear: stop, ask, and do not work around it.
