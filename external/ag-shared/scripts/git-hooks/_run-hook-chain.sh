#!/usr/bin/env bash
#
# _run-hook-chain.sh - Dispatcher that chains to pre-existing hooks
#
# Source this file in git hooks to get the run_hook_chain function.
#
# Usage: run_hook_chain <hook-name> [args...]
#
# Looks for a same-named hook in:
#   1. The path stored in core.ag-shared.previousHooksPath (if set)
#   2. .git/hooks/ (fallback default)
#
# Propagates the exit code of the chained hook.
#

run_hook_chain() {
    local hook_name="$1"
    shift
    local hook_args=("$@")

    # Find the git directory (handles worktrees)
    local git_dir
    git_dir=$(git rev-parse --git-dir 2>/dev/null) || return 0

    # Canonical path of this hooks directory — used to prevent self-recursion
    local this_hooks_dir
    this_hooks_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)

    # Check for a previously configured hooksPath
    local prev_hooks_path
    prev_hooks_path=$(git config core.ag-shared.previousHooksPath 2>/dev/null || true)

    local candidates=()

    if [[ -n "$prev_hooks_path" ]]; then
        candidates+=("$prev_hooks_path/$hook_name")
    fi

    # Also check the default .git/hooks location
    local git_common_dir
    git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null || echo "$git_dir")
    candidates+=("$git_common_dir/hooks/$hook_name")

    for candidate in "${candidates[@]}"; do
        if [[ -x "$candidate" ]]; then
            # Guard against self-recursion: skip if candidate lives in our own
            # hooks directory (handles symlinks and relative-path aliases).
            local candidate_dir
            candidate_dir=$(cd "$(dirname "$candidate")" 2>/dev/null && pwd -P) || continue
            if [[ "$candidate_dir" == "$this_hooks_dir" ]]; then
                continue
            fi
            "$candidate" "${hook_args[@]}"
            return $?
        fi
    done

    # No chained hook found — that's fine
    return 0
}
