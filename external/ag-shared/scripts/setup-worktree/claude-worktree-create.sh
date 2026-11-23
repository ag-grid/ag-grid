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

# Git can start hooks and helpers (an fsmonitor daemon, say) that outlive this hook; they must not inherit the
# cleanup lock descriptor.
git() { command git "$@" 9>&-; }

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

# Agents run in parallel, so only worktrees idle for this long count as stale.
STALE_AGENT_WORKTREE_MINUTES=$((24 * 60))
# Per-worktree file in its git dir naming the Claude Code process that created it.
OWNER_FILE_NAME=claude-owner

# Prints the pid of the Claude Code process running this hook, if found.
claude_owner() {
    local pid=$PPID args claude_re='(^|/)claude( |$)'
    while [[ -n "$pid" && "$pid" -gt 1 ]]; do
        args=$(ps -o args= -p "$pid" 2>/dev/null) || return 1
        if [[ "$args" =~ $claude_re || "$args" == *claude-code/cli.js* ]]; then
            echo "$pid"
            return 0
        fi
        pid=$(ps -o ppid= -p "$pid" | tr -d ' ')
    done
    return 1
}

# Prints alive, exited or unknown for the Claude Code process recorded in the owner file.
# Any process holding the pid counts as alive, so pid reuse keeps the worktree rather than risking it.
owner_state() {
    local owner_file=$1 pid=''
    [[ -f "$owner_file" ]] && { read -r pid <"$owner_file" || [[ -n "$pid" ]]; } && [[ "$pid" =~ ^[0-9]+$ ]] || {
        echo unknown
        return
    }
    if ps -o pid= -p "$pid" >/dev/null 2>&1; then
        echo alive
    # Only a working ps that no longer lists the process proves it exited.
    elif ps -o pid= -p $$ >/dev/null 2>&1; then
        echo exited
    else
        echo unknown
    fi
}

# Prints the working directory, open files and mapped files of each of the user's processes; fails unless every
# live one was fully read.
process_paths() {
    local proc uid mine
    if [[ -d /proc/self ]]; then
        mine=$(id -u)
        for proc in /proc/[0-9]*; do
            # Ownership comes from the process credentials: /proc/<pid> can be root-owned for a non-dumpable process.
            # A process that exited mid-listing is fine; a live one whose user or cwd cannot be read is not.
            # Zombies have no cwd to read and cannot be using a worktree.
            uid=$(awk -v u="$mine" '/^State:/ { z = ($2 == "Z") } /^Uid:/ { print z ? "zombie" : ($2 == u || $3 == u) ? "mine" : "other"; exit }' "$proc/status" 2>/dev/null) || uid=''
            if [[ -z "$uid" ]]; then
                [[ -e "$proc" ]] && return 1
                continue
            fi
            [[ "$uid" == mine ]] || continue
            # One find per process prints the cwd and every descriptor target; it fails on any it cannot resolve.
            find "$proc/cwd" "$proc/fd" -maxdepth 1 -type l -printf '%l\n' 2>/dev/null || [[ ! -e "$proc" ]] || return 1
            # Mappings outlive their descriptors; the path starts at the first " /" since earlier fields hold no slash.
            awk '{ i = index($0, " /"); if (i) print substr($0, i + 1) }' "$proc/maps" 2>/dev/null || [[ ! -e "$proc" ]] || return 1
        done
        return 0
    fi
    command -v lsof >/dev/null || return 1
    local listing
    # lsof lists mapped files too. Every process (p) and every file (f) record must resolve to a name (n).
    # lsof prints a backslash as \\, undone below; in_use avoids paths with control characters, which it escapes too.
    local sampled
    sampled=$(user_pids) || return 1
    listing=$(lsof -n -P -w -u "$(id -u)" -Fpfn 2>/dev/null) || return 1
    # Every process sampled just before must have a record; stable_process_paths rules out ones that exited.
    awk -v sampled="$sampled" 'BEGIN { n = split(sampled, want, "\n") } /^p/ { seen[substr($0, 2)] = 1 }
        END { for (i = 1; i <= n; i++) if (want[i] != "" && !(want[i] in seen)) exit 1 }' <<<"$listing" || return 1
    awk '
        /^p/ { if (file || (proc && !named)) bad = 1; proc = 1; named = 0; file = 0; next }
        /^f/ { if (file) bad = 1; file = 1; next }
        /^n/ { print substr($0, 2); file = 0; named = 1 }
        END { exit bad || file || (proc && !named) }' <<<"$listing" | sed 's/\\\\/\\/g'
}

# Prints the user's process ids, leaving out this hook and its descendants, whose short-lived helpers come and go.
user_pids() {
    ps -A -o pid=,ppid=,uid= | awk -v me=$$ -v u="$(id -u)" '
        { parent[$1] = $2; owner[$1] = $3 }
        END {
            for (pid in parent) {
                if (owner[pid] != u) continue
                ours = 0
                for (p = pid; p > 1 && (p in parent); p = parent[p]) if (p == me) { ours = 1; break }
                if (!ours) print pid
            }
        }' | sort -n
}

# As process_paths, but only from a listing during which no process of the user started or exited, since a process
# started mid-listing can hold an inherited handle the listing missed. Retries a few times, then fails.
stable_process_paths() {
    local attempt before after paths
    for attempt in 1 2 3; do
        before=$(user_pids) || return 1
        paths=$(process_paths) || return 1
        after=$(user_pids) || return 1
        if [[ "$before" == "$after" ]]; then
            printf '%s\n' "$paths"
            return 0
        fi
    done
    return 1
}

# True when a running process of the user has its working directory or an open file inside the path, or the processes
# cannot all be read. Uses the PROCESS_PATHS snapshot when given a second argument, else a fresh listing.
in_use() {
    local real_path paths
    real_path=$(cd -P "$1" && pwd) || return 0
    # lsof escapes control characters, so such a path cannot be matched reliably.
    [[ "$real_path" != *[![:print:]]* ]] || return 0
    if [[ -n "${2:-}" ]]; then
        [[ -n "${PROCESS_PATHS_READ:-}" ]] || return 0
        paths=$PROCESS_PATHS
    else
        paths=$(stable_process_paths) || return 0
    fi
    # The path goes through the environment, which awk takes literally (-v would interpret backslashes).
    # Only a clean no-match (exit 3) counts as unused; an awk failure counts as in use.
    local status=0
    P="$real_path" awk 'BEGIN { p = ENVIRON["P"] } $0 == p || index($0, p "/") == 1 { found = 1 } END { exit found ? 0 : 3 }' <<<"$paths" || status=$?
    ((status != 3))
}

FIND_ALSO=()
MOVE_FORCE=()

# Exits 0 when find matches a path modified or changed within the stale window, 2 when its scan failed other than on a vanished path, else 1.
find_recent() {
    local err_file found='' status=0
    err_file=$(mktemp)
    # FIND_ALSO adds alternatives that also count as a match.
    found=$(LC_ALL=C find "$@" \( -mmin "-${STALE_AGENT_WORKTREE_MINUTES}" -o -cmin "-${STALE_AGENT_WORKTREE_MINUTES}" ${FIND_ALSO[@]+"${FIND_ALSO[@]}"} \) -print -quit 2>"$err_file") || status=$?
    if [[ -n "$found" ]]; then
        status=0
    elif [[ $status -ne 0 ]] && { [[ ! -s "$err_file" ]] || grep -qv 'No such file or directory$' "$err_file"; }; then
        status=2
    else
        status=1
    fi
    rm -f "$err_file"
    return $status
}

# Prints why the worktree must be kept, or nothing when its owner has exited and its git metadata is old.
keep_reason() {
    local candidate=$1 git_dir=''
    if [[ ! -e "$candidate/.git" ]] || ! git_dir=$(git -C "$candidate" rev-parse --absolute-git-dir 2>/dev/null); then
        echo "unknown owner, remove it by hand if unused"
        return
    fi
    case $(owner_state "$git_dir/$OWNER_FILE_NAME") in
    alive) echo "owner running" && return ;;
    unknown) echo "unknown owner, remove it by hand if unused" && return ;;
    esac
    # Absent metadata files are skipped by find_recent; inaccessible ones fail the probe.
    # The root and .git are checked here because the move aside changes their timestamps.
    if find_recent "$candidate" "$candidate/.git" "$git_dir/index" "$git_dir/HEAD" "$git_dir/logs/HEAD" -maxdepth 0 || (($? == 2)); then
        echo "recently active"
        return
    fi
    # Quick exit before moving it: files git reports as changed. Without optional locks, status leaves the index
    # alone. A failed probe proves nothing either way; the full scan after the move decides.
    local status_file entry i
    local changed=()
    status_file=$(mktemp)
    if GIT_OPTIONAL_LOCKS=0 git -C "$candidate" status --porcelain -z --no-renames --untracked-files=all >"$status_file" 2>/dev/null; then
        while IFS= read -r -d '' entry; do
            changed+=("$candidate/${entry:3}")
        done <"$status_file"
    fi
    rm -f "$status_file"
    for ((i = 0; i < ${#changed[@]}; i += 200)); do
        if find_recent "${changed[@]:i:200}" -maxdepth 0; then
            echo "recently active"
            return
        fi
    done
}

# Prints a path's modification time to the precision the platform's stat offers.
mtime_of() {
    stat -c %y "$1" 2>/dev/null || stat -f %Fm "$1" 2>/dev/null
}

# As keep_reason, for a worktree already moved aside: checks processes inside it and walks every file once.
# Renaming leaves the root's mtime alone, so a change since root_mtime means its entries changed around the move.
moved_keep_reason() {
    local moved=$1 root_mtime=$2 git_dir entry i
    local entries=()
    if [[ -z "$root_mtime" || "$(mtime_of "$moved")" != "$root_mtime" ]]; then
        echo "recently active"
        return
    fi
    # The move does not touch these, so they are rechecked for writes made since keep_reason looked.
    # The .git file, which the move rewrites, holds only git's own pointer to the git dir.
    if ! git_dir=$(git -C "$moved" rev-parse --absolute-git-dir 2>/dev/null) ||
        find_recent "$git_dir/index" "$git_dir/HEAD" "$git_dir/logs/HEAD" -maxdepth 0 || (($? == 2)); then
        echo "recently active"
        return
    fi
    if in_use "$moved"; then
        echo "in use by a running process, or processes could not all be read"
        return
    fi
    # The move itself touches only the worktree directory and its .git file, so the walk starts from every other
    # top-level entry (listed by glob, not a find -path pattern the directory name could disturb). A failed
    # scan counts as active.
    if [[ ! -r "$moved" || ! -x "$moved" || ! -w "$moved" || ! -O "$moved" ]]; then
        echo "recently active, or cannot be fully read or deleted"
        return
    fi
    # The walk below skips the root and its .git file, so their own deletion restrictions are checked here.
    if [[ "$(uname)" == Darwin ]]; then
        local protected
        if ! protected=$(find "$moved" "$moved/.git" -maxdepth 0 \( -acl -o -flags +uchg,schg,uappnd,sappnd \) -print 2>/dev/null) ||
            [[ -n "$protected" ]]; then
            echo "recently active, or cannot be fully read or deleted"
            return
        fi
    fi
    for entry in "$moved"/* "$moved"/.[!.]* "$moved"/..?*; do
        [[ -e "$entry" || -L "$entry" ]] && [[ "$entry" != "$moved/.git" ]] && entries+=("$entry")
    done
    # Batched to stay within the platform's argument-size limit.
    # The same walk finds directories this user cannot empty, so removal never stops partway through.
    local status
    for ((i = 0; i < ${#entries[@]}; i += 200)); do
        status=0
        FIND_ALSO=(-o -type d \( ! -user "$(id -u)" -o ! -perm -u+wx \))
        # macOS ACLs and file flags can forbid deletion whatever the mode bits say.
        [[ "$(uname)" == Darwin ]] && FIND_ALSO+=(-o -acl -o -flags +uchg,schg,uappnd,sappnd)
        find_recent "${entries[@]:i:200}" || status=$?
        FIND_ALSO=()
        if ((status != 1)); then
            echo "recently active, or cannot be fully read or deleted"
            return
        fi
    done
}

# Moves a worktree with git, failing unless git now has it at the destination.
same_path() {
    [[ "$(cd -P "$1" 2>/dev/null && pwd)" == "$(cd -P "$2" 2>/dev/null && pwd)" ]]
}

# Moves a worktree with git to a vacant path (git would nest it inside an existing directory). Sets MOVED_TO to
# where git has the worktree registered afterwards and MOVED_GIT_DIR to its git dir, and fails unless that is the
# destination.
move_worktree() {
    local from=$1 to=$2 git_dir
    MOVED_TO=$from MOVED_GIT_DIR=''
    [[ ! -e "$to" && ! -L "$to" ]] || return 1
    git_dir=$(git -C "$from" rev-parse --absolute-git-dir 2>/dev/null) || return 1
    MOVED_GIT_DIR=$git_dir
    # MOVE_FORCE (-f -f) lets a restore move a worktree that was locked while it was aside.
    git -C "$CWD" worktree move ${MOVE_FORCE[@]+"${MOVE_FORCE[@]}"} "$from" "$to" >/dev/null 2>&1 || true
    # The git dir's gitdir file names the worktree's .git file at its registered location, relative to the git
    # dir when worktree.useRelativePaths is set.
    local link
    link=$(cat "$git_dir/gitdir" 2>/dev/null) || link=''
    [[ -z "$link" || "$link" == /* ]] || link="$git_dir/$link"
    MOVED_TO=$(dirname "$link")
    same_path "$MOVED_TO" "$to"
}

# Moves a worktree back. git worktree repair first re-registers it where it is on disk, in case an interrupted
# move left git's record at the old path.
restore_worktree() {
    git -C "$CWD" worktree repair "$1" >/dev/null 2>&1 || true
    local restored=0
    MOVE_FORCE=(-f -f)
    move_worktree "$1" "$2" && restored=1
    MOVE_FORCE=()
    ((restored)) && rm -f "$MOVED_GIT_DIR/claude-moved-from" && return
    log "WARNING: could not move the worktree at $MOVED_TO back to $2; move it back by hand with git worktree move"
}

# Clean up stale agent worktrees from previous runs.
# Claude Code does not trigger the WorktreeRemove hook for Agent subagent
# worktrees, so we clean them up opportunistically here.
cleanup_stale_agent_worktrees() {
    local repo_wt_dir="${WORKTREE_ROOT}/${REPO_NAME}"
    [[ -d "$repo_wt_dir" ]] || return 0

    # One cleanup at a time per repo, so each removal owns its worktree from check to delete. The kernel releases
    # the flock when the last process holding the descriptor exits, however it exits, so no stale lock is left to
    # reclaim.
    local lock="$repo_wt_dir/.cleanup.lock" locked=1
    exec 9>>"$lock" || return 0
    if command -v flock >/dev/null; then
        flock -n 9 || locked=0
    elif command -v perl >/dev/null; then
        perl -MFcntl=:flock -e 'open(my $fh, ">&=", 9) or exit 1; flock($fh, LOCK_EX | LOCK_NB) or exit 1' || locked=0
    else
        locked=0
    fi
    if ((locked)); then
        cleanup_locked "$repo_wt_dir" || true
    else
        log "Skipping stale agent worktree cleanup: could not take $lock (another hook is cleaning up, or no flock)"
    fi
    # Closing the descriptor releases the lock and keeps it out of processes started later.
    exec 9>&-
}

cleanup_locked() {
    local repo_wt_dir=$1 remove_script candidate moved original reason root_mtime git_dir entry registered recorded repo_real MOVED_TO=
    remove_script="$(dirname "$0")/claude-worktree-remove.sh"

    # One process listing for the pre-move checks, taken when the first candidate needs it; each moved worktree
    # gets a fresh one. in_use reads them through bash's dynamic scoping.
    local listed='' PROCESS_PATHS='' PROCESS_PATHS_READ=''

    # Restore worktrees left aside by an interrupted run: only those whose record in their git dir says this hook
    # moved them from the matching path.
    for moved in "$repo_wt_dir"/.removing-agent-*; do
        [[ -d "$moved" ]] || continue
        original="$repo_wt_dir/${moved##*/.removing-}"
        [[ ! -e "$original" ]] || continue
        git_dir=$(git -C "$moved" rev-parse --absolute-git-dir 2>/dev/null) || continue
        [[ "$(cat "$git_dir/claude-moved-from" 2>/dev/null)" == "$(cd -P "$repo_wt_dir" && pwd)/${original##*/}" ]] || continue
        restore_worktree "$moved" "$original"
    done

    # A restore that landed somewhere unexpected leaves the worktree registered there with its record; move those
    # back too.
    repo_real=$(cd -P "$repo_wt_dir" && pwd)
    while IFS= read -r -d '' entry; do
        [[ "$entry" == "worktree "* ]] || continue
        registered=${entry#worktree }
        git_dir=$(git -C "$registered" rev-parse --absolute-git-dir 2>/dev/null) || continue
        recorded=$(cat "$git_dir/claude-moved-from" 2>/dev/null) || continue
        [[ "$(dirname "$recorded")" == "$repo_real" && ! -e "$recorded" ]] || continue
        same_path "$registered" "$recorded" || restore_worktree "$registered" "$recorded"
    done < <(git -C "$CWD" worktree list --porcelain -z 2>/dev/null)

    for candidate in "$repo_wt_dir"/agent-*; do
        [[ -d "$candidate" ]] || continue
        # Never clean up the worktree we're about to create.
        [[ "$candidate" == "$WT_PATH" ]] && continue
        # Taken before the age checks, so the post-move comparison covers everything from here to the move.
        root_mtime=$(mtime_of "$candidate") || root_mtime=''
        reason=$(keep_reason "$candidate")
        if [[ -n "$reason" ]]; then
            log "Keeping agent worktree ($reason): $candidate"
            continue
        fi
        if [[ -z "$listed" ]]; then
            listed=1
            PROCESS_PATHS=$(stable_process_paths) && PROCESS_PATHS_READ=1
        fi
        # Checked before the move, so a known user never sees the path vanish; rechecked fresh after it.
        if in_use "$candidate" snapshot; then
            log "Keeping agent worktree (in use by a running process, or processes could not all be read): $candidate"
            continue
        fi

        # Move the worktree off its path before the file walk, so no new session can start in it and the
        # walk sees every write made before removal.
        moved="$repo_wt_dir/.removing-${candidate##*/}"
        # Lets the remover recognise this checkout if a run is interrupted while it is aside.
        if ! git_dir=$(git -C "$candidate" rev-parse --absolute-git-dir 2>/dev/null) ||
            ! echo "$(cd -P "$repo_wt_dir" && pwd)/${candidate##*/}" 2>/dev/null >"$git_dir/claude-moved-from"; then
            log "Keeping agent worktree (could not record its path before moving it aside): $candidate"
            continue
        fi
        if ! move_worktree "$candidate" "$moved"; then
            # Put it back from where git registers it; failing that, from the destination, but only if that
            # directory is this checkout (git renamed it but did not finish).
            if [[ -n "$MOVED_TO" && "$MOVED_TO" != . && -e "$MOVED_TO/.git" ]] && ! same_path "$MOVED_TO" "$candidate"; then
                restore_worktree "$MOVED_TO" "$candidate"
            elif [[ ! -e "$candidate" && -n "$MOVED_GIT_DIR" ]] &&
                [[ "$(git -C "$moved" rev-parse --absolute-git-dir 2>/dev/null)" == "$MOVED_GIT_DIR" ]]; then
                restore_worktree "$moved" "$candidate"
            fi
            # Left where it was, the record would send a later deliberate move of this checkout back here.
            same_path "$MOVED_TO" "$candidate" && rm -f "$git_dir/claude-moved-from"
            log "Keeping agent worktree (could not move it aside for removal): $candidate"
            continue
        fi
        reason=$(moved_keep_reason "$moved" "$root_mtime")
        if [[ -n "$reason" ]]; then
            restore_worktree "$moved" "$candidate"
            log "Keeping agent worktree ($reason): $candidate"
            continue
        fi

        log "Cleaning up stale agent worktree: $candidate"
        # The remover inherits the lock and keeps it on the commands that delete, so the lock outlives this hook
        # until deletion stops. It would otherwise wait for the lock this hook holds. It reports a missing path as
        # success, so success is judged by the path being gone.
        jq -n --arg path "$moved" '{worktree_path: $path}' | CLAUDE_WT_CLEANUP_LOCKED=1 bash "$remove_script" 2>&1 | while IFS= read -r line; do log "$line"; done || true
        if [[ -e "$moved" || -L "$moved" ]]; then
            [[ -d "$moved" ]] && restore_worktree "$moved" "$candidate"
            log "WARNING: removal of $candidate failed; moved what remains back, but files may already be gone"
        fi
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

# Record the owning Claude Code process so cleanup keeps this worktree while it runs.
if ! { OWNER=$(claude_owner) && WT_GIT_DIR=$(git -C "$WT_PATH" rev-parse --absolute-git-dir 2>/dev/null) && echo "$OWNER" 2>/dev/null >"$WT_GIT_DIR/$OWNER_FILE_NAME"; }; then
    log "WARNING: could not record the owning Claude Code process; stale cleanup will keep this worktree"
fi

# Set up the worktree (COW clone when possible, else yarn install). ROOT_WORKTREE_PATH
# tells preinstall-worktree.sh which checkout to clone node_modules from.
export ROOT_WORKTREE_PATH="$CWD"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# A setup failure fails the hook (pipefail), rather than reporting a ready
# worktree without its dependencies.
if [[ -f "$WT_PATH/package.json" ]]; then
    bash "$SCRIPT_DIR/setup-worktree.sh" "$WT_PATH" 2>&1 | while IFS= read -r line; do log "$line"; done
fi

log "Worktree ready at: ${WT_PATH}"
echo "$WT_PATH"
