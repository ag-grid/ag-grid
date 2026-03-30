#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]] || [[ "$1" != "grid" && "$1" != "studio" && "$1" != "charts" ]] || [[ "$2" != "lock" && "$2" != "unlock" ]]; then
    echo "Usage: $0 <grid|studio|charts> <lock|unlock>"
    exit 1
fi

PRODUCT=$1
REPO="ag-grid/$PRODUCT"
BRANCH="main"

LOCK_ENABLED=$([[ "$2" == "lock" ]] && echo true || echo false)

# Read existing protection, defaulting to empty if unprotected
current=$(gh api "repos/$REPO/branches/$BRANCH/protection" 2>/dev/null || echo '{}')

# Build payload preserving existing settings, only changing lock_branch
payload=$(echo "$current" | jq --argjson lock "$LOCK_ENABLED" '{
    required_status_checks: (.required_status_checks // null | if . then {strict, contexts} else null end),
    enforce_admins: (.enforce_admins.enabled // false),
    required_pull_request_reviews: (.required_pull_request_reviews // null | if . then {dismiss_stale_reviews, require_code_owner_reviews, required_approving_review_count} else null end),
    restrictions: (.restrictions // null | if . then {users: [.users[].login], teams: [.teams[].slug], apps: [.apps[].slug]} else null end),
    lock_branch: $lock
}')

echo "${2^}ing branch '$BRANCH' on $REPO..."
gh api --method PUT "repos/$REPO/branches/$BRANCH/protection" --input - <<< "$payload"
echo "Branch '$BRANCH' is now ${2}ed."
