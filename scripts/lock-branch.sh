#!/usr/bin/env bash
set -euo pipefail

REPO="ag-grid/ag-grid"
BRANCH="latest"

usage() {
    echo "Usage: $0 <lock|unlock>"
    exit 1
}

if [[ $# -ne 1 ]]; then
    usage
fi

ACTION="$1"

case "$ACTION" in
    lock)
        echo "Locking branch '$BRANCH' on $REPO..."
        gh api --method PATCH "repos/$REPO/branches/$BRANCH/protection/lock-branch" \
            -f lock_branch=true
        echo "Branch '$BRANCH' is now locked."
        ;;
    unlock)
        echo "Unlocking branch '$BRANCH' on $REPO..."
        gh api --method PATCH "repos/$REPO/branches/$BRANCH/protection/lock-branch" \
            -f lock_branch=false
        echo "Branch '$BRANCH' is now unlocked."
        ;;
    *)
        usage
        ;;
esac
