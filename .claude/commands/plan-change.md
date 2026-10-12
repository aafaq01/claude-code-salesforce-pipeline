---
description: Plan a change to the onboarding flow before touching any file
argument-hint: <short description of the change>
---
Plan this change: $ARGUMENTS

Do not edit any file yet. Read CLAUDE.md first. Then answer:
1. Which files in force-app/, demo-app/, e2e/ and docs/ change, and why.
2. Impact on the API contract, the onboarding form and the legacy integration path (Source__c = LegacyIntegration).
3. Apex tests to add or update.
4. Deploy order: ci-sandbox first. Prod only through the production GitHub environment.
5. Risks and open questions.

Use the change-impact-reviewer subagent for item 2 if the change touches more than one system. End with a numbered step list and wait for approval.
