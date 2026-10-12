# Branch protection for main

These are the settings that make the pipeline safe. Without them, the checks are advice, not a gate.

## Settings on `main`

| Setting | Value |
| --- | --- |
| Require a pull request before merging | On |
| Required approving reviews | 1 |
| Dismiss stale approvals when new commits are pushed | On |
| Require approval of the most recent push | On |
| Require status checks to pass | On, branch must be up to date |
| Required status check | `validate` (from `sfdx-validate.yml`) |
| Require conversation resolution | On |
| Require linear history | On |
| Include administrators | On |
| Allow force pushes | Off |
| Allow deletions | Off |
| Direct pushes | Not allowed (everything goes through a pull request) |

## Environment `production`

In the repo settings, open Environments, create `production`, then:

1. Turn on Required reviewers and add at least one person who is not the author of the change.
2. Limit deployment branches to `main`.
3. Store the production `SFDX_AUTH_URL` as an environment secret here, not as a repo secret.

## Apply with the script

`scripts/apply-branch-protection.sh` applies the table above with the `gh` CLI. You need to be a repo admin. It is not run automatically.

```
bash scripts/apply-branch-protection.sh aafaq01/claude-code-salesforce-pipeline main
```

The script does not set the `production` environment reviewers. Do that in the GitHub UI.
