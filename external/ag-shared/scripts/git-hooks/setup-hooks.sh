#!/usr/bin/env bash
#
# setup-hooks.sh - Configure git hooksPath to use ag-shared hooks
#
# Sets core.hooksPath to point at this directory so shared git hooks
# (pre-commit, pre-push, etc.) are used for the repository.
# Preserves any previously configured hooksPath so hooks can be chained.
#
# Usage:
#   ./setup-hooks.sh   # Run directly or via postinstall:setup-git-hooks
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Detect CI environment
is_ci() {
    [[ -n "${CI:-}" || -n "${GITHUB_ACTIONS:-}" || -n "${JENKINS_URL:-}" || -n "${BUILDKITE:-}" || -n "${CIRCLECI:-}" || -n "${TRAVIS:-}" ]]
}

# Get the main repo root (handles worktrees)
# Uses git rev-parse --git-common-dir which works for both regular repos and worktrees,
# and handles relative gitdir paths correctly.
get_main_repo_root() {
    local common_dir
    common_dir=$(cd "$REPO_ROOT" && git rev-parse --git-common-dir 2>/dev/null) || {
        echo "$REPO_ROOT"
        return
    }
    # Resolve to absolute path (handles relative paths from --git-common-dir)
    # then strip the .git component to get the repo root
    local abs_common_dir
    abs_common_dir=$(cd "$REPO_ROOT" && cd "$common_dir" && pwd)
    dirname "$abs_common_dir"
}

# Skip in CI — hook configuration is a local developer setup concern
if is_ci; then
    exit 0
fi

# Hooks directory must exist before we point git at it
if [[ ! -d "$SCRIPT_DIR" ]]; then
    exit 0
fi

MAIN_REPO_ROOT=$(get_main_repo_root)

# Use a path relative to the checkout this script lives in, so the config is
# valid for all worktrees (each worktree has the same directory structure, and
# git resolves a relative hooksPath against the checkout a command runs in). Stripping
# MAIN_REPO_ROOT instead only worked in the main checkout: run from a worktree
# outside it, it stored an absolute path into that worktree, and deleting the
# worktree silently switched the hooks off everywhere.
HOOKS_RELATIVE="${SCRIPT_DIR#"$REPO_ROOT"/}"

# True for this hooks directory in any checkout, as relative or absolute path.
is_ag_shared_hooks_dir() {
    [[ "$1" == "$HOOKS_RELATIVE" || "$1" == */"$HOOKS_RELATIVE" ]]
}

current_hooks=$(git -C "$MAIN_REPO_ROOT" config core.hooksPath 2>/dev/null || true)

# The absolute-path bug above also saved one worktree's copy of these hooks as
# the hooks to chain to. Chaining to ourselves is never wanted, so drop it.
previous_hooks=$(git -C "$MAIN_REPO_ROOT" config core.ag-shared.previousHooksPath 2>/dev/null || true)
if [[ -n "$previous_hooks" ]] && is_ag_shared_hooks_dir "$previous_hooks"; then
    git -C "$MAIN_REPO_ROOT" config --unset core.ag-shared.previousHooksPath
fi

# Already configured to our hooks directory — nothing to do
if [[ "$current_hooks" == "$HOOKS_RELATIVE" ]]; then
    exit 0
fi

# Preserve any existing hooksPath so _run-hook-chain.sh can dispatch to it
if [[ -n "$current_hooks" ]] && ! is_ag_shared_hooks_dir "$current_hooks"; then
    git -C "$MAIN_REPO_ROOT" config core.ag-shared.previousHooksPath "$current_hooks"
fi

git -C "$MAIN_REPO_ROOT" config core.hooksPath "$HOOKS_RELATIVE"
