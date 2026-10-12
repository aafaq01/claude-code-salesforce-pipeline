# Recording script (6 to 8 minutes)

For Aafaq, to record live. Do everything for real on screen. If something fails, keep it in and talk through it. Do not fake, edit in, or pre-stage any result. If a step cannot run (no sandbox auth, for example), say so on camera.

## Before you press record (not on camera)

- Terminal open in the repo, on a fresh branch (not `main`). Claude Code started.
- Pick one small change in advance, so you are not hunting for ideas. Suggested: "Trim extra spaces from the company name before the record is saved." Adjust to what the repo actually allows.
- Run `npm test` and `node tools/test-hooks.mjs` once off camera so you know they work on your machine.
- Have the GitHub repo open in a browser tab.

## 1. Intro (about 30 seconds)

Say: "This is a reference pipeline for making Salesforce changes with Claude Code, with safety gates a non-developer can trust. I will make one small change, break it on purpose, hit the production guard, run the tests and open a pull request. Nothing here is staged."

Show: the repo file list briefly, and `docs/RUNBOOK-making-a-change.md`.

## 2. Plan the change (about 1 minute)

Type `/plan-change` and describe your change in one or two plain sentences.

Say: "I describe what I want and what must not change. Claude plans before it edits."

Read the plan aloud. Point at which files it will touch. Approve it.

## 3. Check the impact (about 1 minute)

Type `/impact`.

Say: "This asks what else the change touches. I want to see if the legacy integration or the Flow is affected."

Read out what it finds. If it finds nothing, say so honestly.

## 4. Let Claude edit (about 1 minute)

Let Claude make the edit. Do not interrupt.

Say: "Claude edits in my working copy, on a branch, not on main."

## 5. Review the diff (about 1 minute)

Show the diff in your editor or with Claude's summary. Walk through each changed file.

Say: "I do not trust it blindly. I read every change. This is the human step."

## 6. Correct a mistake on purpose (about 1 minute)

Choose a real flaw you can point to, for example: ask Claude to also loosen `Require_Tax_Id` more than the plan said, or to skip updating a test. Or, if Claude made a genuine slip in step 4, use that.

Say: "That goes beyond what I asked. Please undo it and keep only the planned change." Show Claude correcting it.

If Claude made no slip and you cannot cause a real one honestly, skip the "mistake" framing and say that.

## 7. Trigger the guard hook (about 1 minute)

Ask Claude to push directly to `main`, or to deploy to the `prod` alias.

Say: "Now I will try to do what I should never do. Watch the guard hook."

Show the block message from `guard-production.mjs`. Say: "It refused. Production only goes out through the manual workflow with reviewers."

Optional: run `node tools/test-hooks.mjs` to show the hook checks themselves pass.

## 8. Run the tests (about 1 minute)

Run `npm test` for the browser tests. If Apex changed, show the `warn-apex-tests.mjs` warning when the test is missing, then let `apex-test-writer` add it.

Say: "Tests prove the rule still behaves. The warning keeps me honest about code without tests."

Report the real result, pass or fail.

## 9. Open the pull request (about 1 minute)

Run `/ship-checklist`. Then open the PR.

Show on GitHub: the checks starting (`sfdx-validate.yml`, `e2e.yml`) and the AI review comment from `claude-review.yml`, if they have run by then.

Say: "A reviewer on the repo must approve this. Production release is a separate manual step with its own approvers."

If checks are still running, say so and show where they will appear. Do not claim they passed.

## 10. Close (about 30 seconds)

Say: "That is the loop: plan, impact, edit, review, guard, test, PR. The runbook explains it for non-developers."

## Tips

- Short pauses are fine. Read what is on screen aloud.
- If something breaks, that is the best footage. Say what you think went wrong, then fix it.
