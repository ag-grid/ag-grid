#!/bin/bash
# external/ag-shared/scripts/setup-worktree/claude-worktree-create.sh
# Claude Code WorktreeCreate hook — creates a git worktree and runs setup.
#
# Receives JSON on stdin from Claude Code:
#   { "name": "branch-name", "cwd": "/path/to/repo", ... }
# Must print the absolute worktree path on stdout. All other output to stderr.

set -euo pipefail

INPUT=$(cat)
NAME=$(echo "$INPUT" | jq -r '.name')
CWD=$(echo "$INPUT" | jq -r '.cwd')

log() { echo "[claude-wt] $*" >&2; }

# Detect repo name from git remote origin URL.
detect_repo_name() {
    local remote_url
    remote_url=$(git -C "$CWD" remote get-url origin 2>/dev/null || echo "")
    if [[ -z "$remote_url" ]]; then
        basename "$CWD"
        return
    fi
    echo "$remote_url" | sed -E 's|.*[:/]([^/]+)\.git$|\1|; s|.*[:/]([^/]+)$|\1|'
}

REPO_NAME=$(detect_repo_name)
DIR_NAME=$(echo "$NAME" | tr '/' '-')
WORKTREE_ROOT="$HOME/.worktrees"
WT_PATH="${WORKTREE_ROOT}/${REPO_NAME}/${DIR_NAME}"

# Clean up stale agent worktrees from previous runs.
# Claude Code does not trigger the WorktreeRemove hook for Agent subagent
# worktrees, so we clean them up opportunistically here.
cleanup_stale_agent_worktrees() {
    local repo_wt_dir="${WORKTREE_ROOT}/${REPO_NAME}"
    [[ -d "$repo_wt_dir" ]] || return 0

    local remove_script
    remove_script="$(dirname "$0")/claude-worktree-remove.sh"

    for candidate in "$repo_wt_dir"/agent-*; do
        [[ -d "$candidate" ]] || continue
        # Never clean up the worktree we're about to create.
        [[ "$candidate" == "$WT_PATH" ]] && continue

        log "Cleaning up stale agent worktree: $candidate"
        echo "{\"worktree_path\": \"$candidate\"}" | bash "$remove_script" 2>&1 | while IFS= read -r line; do log "$line"; done || true
    done
}

cleanup_stale_agent_worktrees

log "Creating worktree '${NAME}' for ${REPO_NAME}..."

log "Fetching from origin..."
git -C "$CWD" fetch origin --quiet >&2 || log "WARNING: git fetch failed, continuing with local refs"

mkdir -p "${WORKTREE_ROOT}/${REPO_NAME}"

# Create worktree — handle existing branch (local/remote) or create new.
if git -C "$CWD" show-ref --verify --quiet "refs/heads/${NAME}" 2>/dev/null; then
    log "Branch '${NAME}' exists locally, checking out..."
    git -C "$CWD" worktree add "$WT_PATH" "$NAME" >&2
elif git -C "$CWD" show-ref --verify --quiet "refs/remotes/origin/${NAME}" 2>/dev/null; then
    log "Branch '${NAME}' exists on remote, checking out..."
    git -C "$CWD" worktree add "$WT_PATH" "$NAME" >&2
else
    log "Creating new branch '${NAME}' from origin/latest..."
    git -C "$CWD" worktree add "$WT_PATH" -b "$NAME" origin/latest >&2
fi

# Set up the worktree. Strategy:
#   1. Run preinstall-worktree.sh directly — it fixes external symlinks,
#      COW-clones node_modules, .nx cache, and plugins/*/dist, and writes
#      node_modules/.ag-worktree-fast-path-ok when the COW'd state is
#      equivalent to a full `yarn install`.
#   2. If the marker is present → skip `yarn install` and just run the
#      postinstall chain with AG_WORKTREE_FAST_PATH=1. Expensive steps
#      (patches, plugin-build, nx daemon reset) self-skip via that env
#      var; cheap idempotent steps (git hooks, setup-prompts) still run.
#      Future postinstall steps run by default unless explicitly gated.
#   3. If the marker is missing → fall back to full `yarn install`, with
#      AG_PREINSTALL_ACTIVE=1 so the yarn preinstall hook does not
#      duplicate work we just did.
export ROOT_WORKTREE_PATH="$CWD"
export AG_SKIP_NATIVE_DEP_VERSION_CHECK=1
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ -f "$WT_PATH/package.json" ]]; then
    log "Running preinstall (COW clone + symlink fix)..."
    (cd "$WT_PATH" && bash "$SCRIPT_DIR/preinstall-worktree.sh" 2>&1 | while IFS= read -r line; do log "$line"; done) || true

    if [[ -f "$WT_PATH/node_modules/.ag-worktree-fast-path-ok" ]]; then
        log "Fast path: skipping yarn install, running gated postinstall chain..."
        (cd "$WT_PATH" && AG_WORKTREE_FAST_PATH=1 yarn run postinstall 2>&1 | tail -20) >&2 || \
            log "WARNING: fast-path postinstall failed"
    else
        log "Slow path: running yarn install --offline --frozen-lockfile..."
        (cd "$WT_PATH" && AG_PREINSTALL_ACTIVE=1 yarn install --offline --frozen-lockfile 2>&1 | tail -20) >&2 || \
            (cd "$WT_PATH" && AG_PREINSTALL_ACTIVE=1 yarn install --prefer-offline 2>&1 | tail -20) >&2
    fi
fi

log "Worktree ready at: ${WT_PATH}"
echo "$WT_PATH"
