#!/usr/bin/env bash
#
# _protected-branch.sh - Shared helper for protected branch detection
#
# Source this file in git hooks to get the is_protected_branch function.
#

# Returns 0 if the given branch name is a protected branch, 1 otherwise.
# Protected branches: latest, next, and release branches matching b[0-9]*
is_protected_branch() {
    case "$1" in
        latest|next) return 0 ;;
        b[0-9]*) return 0 ;;
        *) return 1 ;;
    esac
}
