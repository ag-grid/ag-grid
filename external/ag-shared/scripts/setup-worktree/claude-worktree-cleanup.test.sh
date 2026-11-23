#!/bin/bash
# external/ag-shared/scripts/setup-worktree/claude-worktree-cleanup.test.sh
# Regression tests for the stale agent worktree cleanup in claude-worktree-create.sh and for
# claude-worktree-remove.sh. Run by hand: bash claude-worktree-cleanup.test.sh
# Takes about 70 seconds: ctime cannot be backdated, so the stale window is shortened to a minute and waited out.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CREATE="$SCRIPT_DIR/claude-worktree-create.sh"
REMOVE="$SCRIPT_DIR/claude-worktree-remove.sh"

T=$(mktemp -d)
PIDS=()
cleanup() {
    ((${#PIDS[@]})) && kill "${PIDS[@]}" 2>/dev/null
    [[ "$(uname)" == Darwin ]] && chmod -R -N "$T" 2>/dev/null
    chmod -R u+rwx "$T" 2>/dev/null
    rm -rf -- "$T"
}
trap cleanup EXIT

FAILED=0
pass() { echo "ok   $*"; }
fail() {
    echo "FAIL $*"
    FAILED=1
}
expect() {
    local name=$1
    shift
    if "$@"; then pass "$name"; else fail "$name"; fi
}

# Load the cleanup functions without running the hook.
eval "$(sed -n '/^# Agents run in parallel/,/^cleanup_stale_agent_worktrees$/p' "$CREATE" | sed '$d')"
STALE_AGENT_WORKTREE_MINUTES=1
LOG="$T/log"
log() { echo "$*" >>"$LOG"; }
# cleanup_locked finds the remover next to $0, which is this script.

CWD="$T/repo"
WORKTREE_ROOT="$T/wts"
REPO_NAME=repo
WT_PATH="$WORKTREE_ROOT/repo/agent-new"
WTS="$WORKTREE_ROOT/repo"

git init -q "$CWD"
printf 'node_modules\n' >"$CWD/.gitignore"
echo a >"$CWD/f"
git -C "$CWD" add -A
git -C "$CWD" -c user.name=t -c user.email=t@t commit -qm init
git -C "$CWD" config user.name t
git -C "$CWD" config user.email t@t

make_wt() {
    git -C "$CWD" worktree add -q "$WTS/$1" -b "$1" 2>/dev/null
    mkdir -p "$WTS/$1/node_modules/p"
    echo 1 >"$WTS/$1/node_modules/p/i.js"
}
set_owner() { echo "$2" >"$(git -C "$WTS/$1" rev-parse --absolute-git-dir)/$OWNER_FILE_NAME"; }
DEAD_PID=99999
while ps -o pid= -p "$DEAD_PID" >/dev/null 2>&1; do DEAD_PID=$((DEAD_PID + 1)); done

for n in stale live legacy chmod ignored openfile inuse dirty interrupted renamed readonly acl aclroot blocked; do make_wt "agent-$n"; done
for n in stale chmod ignored openfile inuse dirty readonly acl aclroot blocked; do set_owner "agent-$n" "$DEAD_PID"; done
# Siblings of the protected files below, which a removal that stopped partway would delete.
for n in readonly acl aclroot; do echo 1 >"$WTS/agent-$n/sibling"; done
# A directory this user cannot empty, set before the wait so its ctime is old.
chmod u-w "$WTS/agent-readonly/node_modules/p"
# On macOS, the same through an ACL with the mode bits left alone.
if [[ "$(uname)" == Darwin ]]; then
    chmod +a "everyone deny delete_child" "$WTS/agent-acl/node_modules/p"
    chmod +a "everyone deny delete" "$WTS/agent-aclroot/.git"
fi
# Occupies the path cleanup moves agent-blocked to.
mkdir "$WTS/.removing-agent-blocked"
sleep 600 &
PIDS+=($!)
set_owner agent-live "$!"
mkdir -p "$WTS/agent-nogit/x"
echo 1 >"$WTS/agent-nogit/x/f"
echo changed >"$WTS/agent-dirty/f"
# An interrupted move: the hook's record written, renamed on disk, git still registering the old path.
echo "$(cd -P "$WTS" && pwd)/agent-interrupted" >"$(git -C "$WTS/agent-interrupted" rev-parse --absolute-git-dir)/claude-moved-from"
mv "$WTS/agent-interrupted" "$WTS/.removing-agent-interrupted"
# A manual rename to the hidden name, with no record from the hook.
mv "$WTS/agent-renamed" "$WTS/.removing-agent-renamed"

sleep 70

chmod +x "$WTS/agent-chmod/f"
echo 2 >"$WTS/agent-ignored/node_modules/p/i.js"
touch -t 202001010000 "$WTS/agent-ignored/node_modules/p/i.js"
(
    cd "$WTS/agent-inuse/node_modules" && exec sleep 600
) &
PIDS+=($!)
(
    exec 3>>"$WTS/agent-openfile/node_modules/p/i.js"
    cd / && exec sleep 600
) &
PIDS+=($!)
# A pre-commit hook that rejects the remover's safety commit and records that it ran.
printf '#!/bin/sh\ntouch "%s/hook-ran"\n[ -e /dev/fd/9 ] && touch "%s/hook-held"\nexit 1\n' "$T" "$T" >"$CWD/.git/hooks/pre-commit"
chmod +x "$CWD/.git/hooks/pre-commit"
sleep 1

gone() { [[ ! -e "$WTS/$1" ]]; }
kept() { [[ -e "$WTS/$1" ]]; }
registered() { git -C "$CWD" worktree list --porcelain | grep -qxF "worktree $(cd -P "$WTS/$1" && pwd)"; }

# Without a process listing every candidate is kept, and the run completes.
if (
    stable_process_paths() { return 1; }
    cleanup_stale_agent_worktrees
); then pass "a failed process listing does not abort the cleanup"; else fail "a failed process listing does not abort the cleanup"; fi
expect "a failed process listing keeps the candidate" kept agent-stale

# Unrelated processes starting or exiting on a busy machine make the listing unstable, which keeps every worktree.
# The scenarios pin the process-id check; the turnover test below exercises it.
# A git wrapper records whether the deleting command holds the lock descriptor.
mkdir "$T/bin"
printf '#!/bin/bash\n[[ "$*" == *"worktree remove"* && -e /dev/fd/9 ]] && touch "%s/remove-held"\nexec "%s" "$@"\n' "$T" "$(command -v git)" >"$T/bin/git"
chmod +x "$T/bin/git"
real_user_pids=$(declare -f user_pids)
user_pids() { :; }
PATH="$T/bin:$PATH" cleanup_stale_agent_worktrees
eval "$real_user_pids"

expect "stale worktree with an exited owner is removed" gone agent-stale
expect "removal leaves no hidden copy" gone .removing-agent-stale
expect "worktree whose owner runs is kept" kept agent-live
expect "worktree without an owner record is kept" kept agent-legacy
expect "leftover without .git is kept" kept agent-nogit
expect "chmod (ctime only) keeps the worktree" kept agent-chmod
expect "recent ignored file keeps the worktree" kept agent-ignored
expect "process cwd inside keeps the worktree" kept agent-inuse
expect "open file from a process elsewhere keeps the worktree" kept agent-openfile
expect "rejected safety commit reached the remover" test -e "$T/hook-ran"
expect "git hooks do not inherit the lock" test ! -e "$T/hook-held"
expect "the deleting git command holds the lock" test -e "$T/remove-held"
expect "failed safety commit restores the worktree" registered agent-dirty
expect "interrupted move is recovered and registered" registered agent-interrupted
expect "manual rename without the hook's record is left alone" kept .removing-agent-renamed
refused() { grep -qxF "Keeping agent worktree (recently active, or cannot be fully read or deleted): $WTS/$1" "$LOG"; }
expect "a worktree with a directory it cannot empty is kept intact" test -e "$WTS/agent-readonly/node_modules/p/i.js" -a -e "$WTS/agent-readonly/sibling"
expect "the preflight refuses a directory it cannot empty" refused agent-readonly
if [[ "$(uname)" == Darwin ]]; then
    expect "a worktree with an ACL forbidding deletion is kept intact" test -e "$WTS/agent-acl/node_modules/p/i.js" -a -e "$WTS/agent-acl/sibling"
    expect "the preflight refuses an ACL forbidding deletion" refused agent-acl
    expect "a worktree whose .git link cannot be deleted is kept intact" test -e "$WTS/agent-aclroot/.git" -a -e "$WTS/agent-aclroot/sibling"
    expect "the preflight refuses a .git link that cannot be deleted" refused agent-aclroot
fi
expect "a refused move aside leaves no record" test ! -e "$(git -C "$WTS/agent-blocked" rev-parse --absolute-git-dir)/claude-moved-from"
expect "lock is released after cleanup" bash -c 'exec 9>>"$1"; perl -MFcntl=:flock -e '"'"'open(my $fh, ">&=", 9) or exit 1; flock($fh, LOCK_EX | LOCK_NB) or exit 1'"'" _ "$WTS/.cleanup.lock"

# move_worktree refuses an occupied destination and leaves the worktree registered where it was.
mkdir "$WTS/.occupied"
if move_worktree "$WTS/agent-legacy" "$WTS/.occupied"; then fail "move to an occupied destination is refused"; else pass "move to an occupied destination is refused"; fi
expect "worktree stays put after a refused move" registered agent-legacy

# A worktree locked while it was aside is still moved back.
git -C "$CWD" worktree add -q "$WTS/agent-lockedaside" -b agent-lockedaside 2>/dev/null
git -C "$CWD" worktree move "$WTS/agent-lockedaside" "$WTS/.removing-agent-lockedaside"
git -C "$CWD" worktree lock "$WTS/.removing-agent-lockedaside"
restore_worktree "$WTS/.removing-agent-lockedaside" "$WTS/agent-lockedaside"
expect "a worktree locked while aside is restored" registered agent-lockedaside
git -C "$CWD" worktree unlock "$WTS/agent-lockedaside"

# A restore that landed elsewhere is found through git's registration and moved back on the next run.
git -C "$CWD" worktree add -q "$WTS/agent-misplaced" -b agent-misplaced 2>/dev/null
echo "$(cd -P "$WTS" && pwd)/agent-misplaced" >"$(git -C "$WTS/agent-misplaced" rev-parse --absolute-git-dir)/claude-moved-from"
git -C "$CWD" worktree move "$WTS/agent-misplaced" "$WTS/elsewhere-misplaced"
cleanup_stale_agent_worktrees
expect "a restore that landed elsewhere is moved back" registered agent-misplaced

rm -f "$CWD/.git/hooks/pre-commit"
remove() { jq -n --arg path "$1" '{worktree_path: $path}' | (cd / && bash "$REMOVE") 2>>"$LOG"; }

# The remover takes the hidden copy an interrupted cleanup left, after an incomplete move, when its record matches.
git -C "$CWD" worktree add -q "$WTS/agent-direct" -b agent-direct 2>/dev/null
DIRECT_GIT_DIR=$(git -C "$WTS/agent-direct" rev-parse --absolute-git-dir)
echo "$(cd -P "$WTS" && pwd)/agent-direct" >"$DIRECT_GIT_DIR/claude-moved-from"
mv "$WTS/agent-direct" "$WTS/.removing-agent-direct"
remove "$WTS/agent-direct"
expect "direct removal removes the matching hidden copy" gone .removing-agent-direct
expect "direct removal clears git's registration" test ! -d "$DIRECT_GIT_DIR"

# The remover also finds a worktree where a restore left it.
git -C "$CWD" worktree add -q "$WTS/agent-misremove" -b agent-misremove 2>/dev/null
echo "$(cd -P "$WTS" && pwd)/agent-misremove" >"$(git -C "$WTS/agent-misremove" rev-parse --absolute-git-dir)/claude-moved-from"
git -C "$CWD" worktree move "$WTS/agent-misremove" "$WTS/elsewhere-misremove"
remove "$WTS/agent-misremove"
expect "direct removal removes a worktree where a restore left it" gone elsewhere-misremove

# With nothing beside the path, the session's directory names the repository.
mkdir -p "$T/solo"
git -C "$CWD" worktree add -q "$T/solo/agent-solo" -b agent-solo 2>/dev/null
echo "$(cd -P "$T/solo" && pwd)/agent-solo" >"$(git -C "$T/solo/agent-solo" rev-parse --absolute-git-dir)/claude-moved-from"
git -C "$CWD" worktree move "$T/solo/agent-solo" "$T/solo-elsewhere"
jq -n --arg path "$T/solo/agent-solo" --arg cwd "$CWD" '{worktree_path: $path, cwd: $cwd}' | (cd / && bash "$REMOVE") 2>>"$LOG"
expect "direct removal finds a misplaced worktree through the session's directory" test ! -e "$T/solo-elsewhere"

# A misplaced worktree nested inside whatever now occupies its path: which one was meant is ambiguous.
git -C "$CWD" worktree add -q "$WTS/agent-ambiguous" -b agent-ambiguous 2>/dev/null
echo "$(cd -P "$WTS" && pwd)/agent-ambiguous" >"$(git -C "$WTS/agent-ambiguous" rev-parse --absolute-git-dir)/claude-moved-from"
git -C "$CWD" worktree move "$WTS/agent-ambiguous" "$WTS/elsewhere-ambiguous"
mkdir "$WTS/agent-ambiguous"
echo 1 >"$WTS/agent-ambiguous/other"
git -C "$CWD" worktree move "$WTS/elsewhere-ambiguous" "$WTS/agent-ambiguous/nested"
if remove "$WTS/agent-ambiguous"; then
    fail "an occupied path with a misplaced worktree fails the remover"
else
    pass "an occupied path with a misplaced worktree fails the remover"
fi
expect "the occupant and the misplaced worktree are kept" test -e "$WTS/agent-ambiguous/other" -a -e "$WTS/agent-ambiguous/nested/f"

# Without git's registration to go on, rm still never deletes a checkout inside the path.
mkdir -p "$WTS/agent-holder"
git clone -q "$CWD" "$WTS/agent-holder/clone"
if remove "$WTS/agent-holder"; then fail "a directory holding a checkout fails the remover"; else pass "a directory holding a checkout fails the remover"; fi
expect "the checkout inside is kept" test -e "$WTS/agent-holder/clone/f"

# An unrelated checkout at the hidden name is left alone.
git clone -q "$CWD" "$WTS/.removing-agent-other"
remove "$WTS/agent-other"
expect "unrelated checkout at the hidden name is kept" kept .removing-agent-other

# Git's refusal to remove a locked worktree leaves it intact.
git -C "$CWD" worktree add -q "$WTS/agent-locked" -b agent-locked 2>/dev/null
git -C "$CWD" worktree lock "$WTS/agent-locked"
if remove "$WTS/agent-locked"; then fail "git's refusal fails the remover"; else pass "git's refusal fails the remover"; fi
expect "a locked worktree is left intact" registered agent-locked
git -C "$CWD" worktree unlock "$WTS/agent-locked"

# The remover refuses a worktree whose git status cannot be read.
git -C "$CWD" worktree add -q "$WTS/agent-badindex" -b agent-badindex 2>/dev/null
echo garbage >"$(git -C "$WTS/agent-badindex" rev-parse --absolute-git-dir)/index"
if remove "$WTS/agent-badindex"; then fail "unreadable git status fails the remover"; else pass "unreadable git status fails the remover"; fi
expect "the failure is the status check" grep -q "Cannot read git status of $WTS/agent-badindex" "$LOG"
expect "unreadable git status blocks removal" kept agent-badindex

# stable_process_paths accepts a listing only when the process ids match before and after, retrying three times.
# user_pids runs in a command substitution, so its call count is kept in a file.
turnover_test() {
    local mode=$1
    (
        : >"$T/pid-calls"
        user_pids() {
            echo x >>"$T/pid-calls"
            if [[ $mode == same ]]; then echo 1; else wc -l <"$T/pid-calls"; fi
        }
        process_paths() { echo /x; }
        stable_process_paths >/dev/null
    )
}
if turnover_test changing; then fail "process turnover makes the listing incomplete"; else pass "process turnover makes the listing incomplete"; fi
expect "turnover exhausts all three attempts" test "$(wc -l <"$T/pid-calls" | tr -d ' ')" = 6
expect "a stable listing is accepted" turnover_test same

if ((FAILED)); then
    echo "--- log"
    cat "$LOG"
    exit 1
fi
echo "all passed"
