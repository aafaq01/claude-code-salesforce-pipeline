#!/usr/bin/env bash
# Applies the settings in docs/branch-protection.md to the main branch.
# Needs the gh CLI, logged in as a repo admin. Not run automatically.
set -euo pipefail

repo="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
branch="${2:-main}"

echo "Applying branch protection to $repo ($branch)"

gh api --method PUT "repos/$repo/branches/$branch/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["validate"] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

echo "Done. Set required reviewers on the 'production' environment in the GitHub UI."
