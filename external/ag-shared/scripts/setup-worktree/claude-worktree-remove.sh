#!/bin/bash
# external/ag-shared/scripts/setup-worktree/claude-worktree-remove.sh
# Claude Code WorktreeRemove hook — safely removes a git worktree.
#
# Receives JSON on stdin from Claude Code:
#   { "worktree_path": "/path/to/worktree", ... }
# All output to stderr (no stdout contract for WorktreeRemove).

set -euo pipefail

INPUT=$(cat)
WT_PATH=$(echo "$INPUT" | jq -r '.worktree_path')

log() { echo "[claude-wt-rm] $*" >&2; }

if [[ -z "$WT_PATH" || ! -d "$WT_PATH" ]]; then
    log "Worktree path not found or empty: ${WT_PATH:-<none>}"
    exit 0
fi

# Safety: commit uncommitted changes before removal.
if git -C "$WT_PATH" status --porcelain 2>/dev/null | grep -q .; then
    log "Committing uncommitted changes in ${WT_PATH}..."
    git -C "$WT_PATH" add -A >&2
    git -C "$WT_PATH" commit -m "wip - commit before worktree removal" >&2
fi

log "Removing worktree: ${WT_PATH}"
if ! git worktree remove --force "$WT_PATH" >&2 2>/dev/null; then
    log "git worktree remove failed, falling back to rm + prune..."
    rm -rf "$WT_PATH"
    git worktree prune >&2 2>/dev/null || true
fi

# Belt-and-suspenders: verify removal.
if [[ -d "$WT_PATH" ]]; then
    log "Directory still exists after removal, force-removing..."
    rm -rf "$WT_PATH"
    git worktree prune >&2 2>/dev/null || true
fi

log "Done."
