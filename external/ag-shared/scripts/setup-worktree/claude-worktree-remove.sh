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
SESSION_CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

log() { echo "[claude-wt-rm] $*" >&2; }

# Git runs hooks and helpers that could outlive this script; they must not inherit the lock descriptor. Only the
# commands that delete keep it (deleting_git and rm, which start neither), so the lock is held until deletion stops,
# even if this script is killed first.
git() { command git "$@" 9>&-; }
deleting_git() {
    if [[ -n "$COMMON_DIR" ]]; then set -- --git-dir="$COMMON_DIR" "$@"; fi
    command git -c core.fsmonitor=false "$@"
}

# Succeeds when another git checkout lies inside the path (a top-level .git file is the path's own stale link), or
# the path cannot be searched, so rm never deletes a checkout it was not asked for.
holds_other_worktree() {
    local found
    found=$(find "$1" -mindepth 2 -name .git -print -quit 2>/dev/null) || return 0
    [[ -n "$found" || -d "$1/.git" ]]
}
# Prints the registered worktree whose record names the path, searching the repositories of the session's directory
# and of the entries beside the path, so the lookup does not depend on where this hook runs.
recorded_worktree() {
    local dir repo entry found found_git_dir
    while IFS= read -r -d '' repo; do
        while IFS= read -r -d '' entry; do
            [[ "$entry" == "worktree "* ]] || continue
            found=${entry#worktree }
            found_git_dir=$(git -C "$found" rev-parse --absolute-git-dir 2>/dev/null) || continue
            if [[ "$(cat "$found_git_dir/claude-moved-from" 2>/dev/null)" == "$1" ]]; then
                echo "$found"
                return
            fi
        done < <(git --git-dir="$repo" worktree list --porcelain -z 2>/dev/null)
    done < <(
        for dir in "$SESSION_CWD" "$WT_DIR"/* "$WT_DIR"/.[!.]* "$WT_DIR"/..?*; do
            [[ -n "$dir" && -d "$dir" ]] && git -C "$dir" rev-parse --path-format=absolute --git-common-dir 2>/dev/null | tr '\n' '\0'
        done | sort -zu
    )
}
force_remove() {
    if holds_other_worktree "$WT_PATH"; then
        log "${WT_PATH} contains another git checkout; not removing it"
        exit 1
    fi
    log "$1"
    rm -rf "$WT_PATH"
    deleting_git worktree prune >&2 2>/dev/null || true
}

# The create hook's cleanup may have this worktree moved aside to .removing-<name> while it holds this lock. Take the
# lock before judging the path, so the worktree is either back in place, gone, or left aside by an interrupted run.
WT_DIR=$(dirname "$WT_PATH")
if [[ -n "$WT_PATH" && -z "${CLAUDE_WT_CLEANUP_LOCKED:-}" && -d "$WT_DIR" ]]; then
    LOCK="$WT_DIR/.cleanup.lock"
    if ! exec 9>>"$LOCK"; then
        log "Cannot open $LOCK; not removing ${WT_PATH}"
        exit 1
    fi
    if command -v flock >/dev/null; then
        flock -w 120 9 || { log "Timed out waiting for $LOCK; not removing ${WT_PATH}"; exit 1; }
    elif command -v perl >/dev/null; then
        perl -MFcntl=:flock -e 'alarm 120; open(my $fh, ">&=", 9) or exit 1; flock($fh, LOCK_EX) or exit 1' ||
            { log "Timed out waiting for $LOCK; not removing ${WT_PATH}"; exit 1; }
    else
        log "Cannot lock $LOCK; not removing ${WT_PATH}"
        exit 1
    fi
    # A worktree left aside by an interrupted cleanup is still the one asked for, if the create hook's record in
    # its git dir names this path. Git's record is repaired first, in case the move stopped before updating it.
    HIDDEN="$WT_DIR/.removing-$(basename "$WT_PATH")"
    if [[ ! -e "$WT_PATH" && -e "$HIDDEN/.git" ]] && HIDDEN_GIT_DIR=$(git -C "$HIDDEN" rev-parse --absolute-git-dir 2>/dev/null) &&
        [[ "$(cat "$HIDDEN_GIT_DIR/claude-moved-from" 2>/dev/null)" == "$(cd -P "$WT_DIR" && pwd)/$(basename "$WT_PATH")" ]]; then
        log "Removing ${WT_PATH} from where an interrupted cleanup left it: ${HIDDEN}"
        git -C "$HIDDEN" worktree repair >/dev/null 2>&1 || true
        WT_PATH=$HIDDEN
    else
        # Or wherever a restore that landed elsewhere left it. If something else now occupies the path, which one
        # was meant is ambiguous.
        FOUND=$(recorded_worktree "$(cd -P "$WT_DIR" && pwd)/$(basename "$WT_PATH")")
        if [[ -n "$FOUND" && "$(cd -P "$WT_PATH" 2>/dev/null && pwd)" != "$FOUND" ]]; then
            if [[ -e "$WT_PATH" || -L "$WT_PATH" ]]; then
                log "${WT_PATH} is occupied while the worktree recorded for it is at ${FOUND}; not removing either"
                exit 1
            fi
            log "Removing ${WT_PATH} from where a restore left it: ${FOUND}"
            WT_PATH=$FOUND
        fi
    fi
fi

if [[ -z "$WT_PATH" || ! -d "$WT_PATH" ]]; then
    log "Worktree path not found or empty: ${WT_PATH:-<none>}"
    exit 0
fi

# Safety: commit uncommitted changes before removal. A checkout whose status cannot be read is not removed.
if [[ -e "$WT_PATH/.git" ]]; then
    if ! changes=$(git -C "$WT_PATH" status --porcelain 2>/dev/null); then
        log "Cannot read git status of ${WT_PATH}; not removing it"
        exit 1
    fi
    if [[ -n "$changes" ]]; then
        log "Committing uncommitted changes in ${WT_PATH}..."
        git -C "$WT_PATH" add -A >&2
        git -C "$WT_PATH" commit -m "wip - commit before worktree removal" >&2
    fi
fi

# Git commands address the worktree's own repository, whatever directory this hook runs in.
WT_GIT_DIR='' COMMON_DIR=''
if WT_GIT_DIR=$(git -C "$WT_PATH" rev-parse --absolute-git-dir 2>/dev/null); then
    COMMON_DIR=$(git -C "$WT_PATH" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || COMMON_DIR=''
fi

log "Removing worktree: ${WT_PATH}"
# Git's refusal stands for a registered checkout (a locked one, say), leaving it intact for the caller to restore.
if [[ -n "$WT_GIT_DIR" ]]; then
    if ! deleting_git worktree remove --force "$WT_PATH" >&2; then
        log "git refused to remove ${WT_PATH}; leaving it in place"
        exit 1
    fi
elif ! deleting_git worktree remove --force "$WT_PATH" >&2 2>/dev/null; then
    force_remove "git worktree remove failed, falling back to rm + prune..."
fi

# Belt-and-suspenders: verify removal.
if [[ -d "$WT_PATH" ]]; then
    force_remove "Directory still exists after removal, force-removing..."
fi

# Git drops a worktree's admin dir with its registration.
if [[ -n "$WT_GIT_DIR" && -d "$WT_GIT_DIR" ]]; then
    log "git still registers the removed worktree (${WT_GIT_DIR}); run git worktree prune"
    exit 1
fi

log "Done."
