#!/usr/bin/env bash
#
# Commit a single pr-<N>/ subtree onto a GitHub Pages publish branch, with a
# bounded, conflict-free retry loop so concurrent writers never clobber one
# another. Shared by the pr-preview-publish and pr-preview-cleanup composite
# actions (invoked as `../pr-preview-lib/gh-pages-commit.sh`).
#
# Why retry instead of a cross-PR lock: every writer only ever touches files
# under its own TARGET_PREFIX (its pr-<N>/ directory), so a push rejected by a
# concurrent writer is always resolvable — refetch the branch tip, re-apply this
# operation on top of it, and push again. Two prefixes can never conflict
# textually, so we reset-to-tip and re-apply rather than rebase (rebase is
# unreliable on the shallow clones this uses). This lets different PRs publish in
# parallel without serialising on a single lock.
#
# Inputs (environment):
#   GH_TOKEN            required   token with contents:write on the publish branch
#   GITHUB_REPOSITORY   required   owner/repo — set by the Actions runner
#   MODE                required   'sync' (publish files) | 'remove' (delete subtree)
#   TARGET_PREFIX       required   path(s) owned by this operation, e.g. 'pr-123'. MODE=remove
#                                  accepts a whitespace-separated list so a sweep (e.g. reclaiming
#                                  many stale previews at once) lands as ONE push: GitHub Pages
#                                  rebuilds the whole site per push and its branch builds are
#                                  single-flight, so N pushes cost N cancelling builds. Paths must
#                                  not contain whitespace. MODE=sync requires exactly one.
#   COMMIT_MESSAGE      required   commit message
#   SOURCE_DIR          sync only  directory whose contents overlay TARGET_PREFIX/
#   PUBLISH_BRANCH      optional   default 'gh-pages'
#   MAX_ATTEMPTS        optional   default 5
#   PUBLISH_REMOTE      optional   overrides the derived github.com remote (tests only)
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${MODE:?MODE is required (sync|remove)}"
: "${TARGET_PREFIX:?TARGET_PREFIX is required}"
: "${COMMIT_MESSAGE:?COMMIT_MESSAGE is required}"
PUBLISH_BRANCH="${PUBLISH_BRANCH:-gh-pages}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-5}"
REMOTE="${PUBLISH_REMOTE:-https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git}"

# Unquoted on purpose: TARGET_PREFIX is a whitespace-separated list in remove mode. `set -f` is
# load-bearing — an unquoted expansion also globs, and it globs against the CALLER's directory
# before the safety validation below runs, so a path containing `*` or `?` would silently become
# a set of unrelated real paths that then pass validation and get rm -rf'd.
set -f
# shellcheck disable=SC2206
TARGET_PREFIXES=($TARGET_PREFIX)
set +f

case "$MODE" in
    sync)
        : "${SOURCE_DIR:?SOURCE_DIR is required for MODE=sync}"
        if [ "${#TARGET_PREFIXES[@]}" -ne 1 ]; then
            echo "::error::MODE=sync takes exactly one TARGET_PREFIX (got ${#TARGET_PREFIXES[@]})."; exit 1
        fi
        ;;
    remove)
        if [ "${#TARGET_PREFIXES[@]}" -eq 0 ]; then
            echo "TARGET_PREFIX is empty; nothing to remove."; exit 0
        fi
        ;;
    *) echo "::error::MODE must be 'sync' or 'remove' (got '$MODE')"; exit 1 ;;
esac

# ls-remote --exit-code: 0 = branch exists, 2 = missing, other = real error.
set +e
git ls-remote --exit-code --heads "$REMOTE" "$PUBLISH_BRANCH" >/dev/null 2>&1
rc=$?
set -e
case "$rc" in
    0) branch_exists=true ;;
    2) branch_exists=false ;;
    *) echo "::error::Could not query '$PUBLISH_BRANCH' on $GITHUB_REPOSITORY (git ls-remote exit $rc)."; exit 1 ;;
esac

if [ "$branch_exists" = false ] && [ "$MODE" = remove ]; then
    echo "Publish branch '$PUBLISH_BRANCH' does not exist; nothing to remove."
    exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ "$branch_exists" = true ]; then
    git clone --quiet --branch "$PUBLISH_BRANCH" --depth 1 --single-branch "$REMOTE" "$TMP"
else
    # First-ever publish to this repo — create the publish branch as an orphan so
    # it carries no default-branch history.
    git init --quiet "$TMP"
    git -C "$TMP" remote add origin "$REMOTE"
    git -C "$TMP" checkout --quiet --orphan "$PUBLISH_BRANCH"
fi
cd "$TMP"
git config user.name 'github-actions[bot]'
git config user.email 'github-actions[bot]@users.noreply.github.com'

apply_operation() {
    if [ "$MODE" = sync ]; then
        mkdir -p "$TARGET_PREFIX"
        cp -R "$SOURCE_DIR"/. "$TARGET_PREFIX"/
        touch .nojekyll # disable Jekyll for the whole Pages site
    else
        for p in "${TARGET_PREFIXES[@]}"; do
            rm -rf -- "$p"
        done
    fi
}

# These paths are deleted with rm -rf inside a clone of the publish branch. Reject anything
# that could escape it or resolve to the clone root before that happens.
for p in "${TARGET_PREFIXES[@]}"; do
    case "$p" in
        /* | */../* | ../* | */.. | .. | . | '')
            echo "::error::refusing unsafe TARGET_PREFIX entry: '$p'"; exit 1 ;;
    esac
done

attempt=1
while :; do
    # Re-base the working tree on the current remote tip so the only push-race
    # window is fetch→push. Skipped on the first orphan-create attempt, when the
    # branch does not yet exist on the remote.
    if git ls-remote --exit-code --heads origin "$PUBLISH_BRANCH" >/dev/null 2>&1; then
        git fetch --quiet --depth 1 origin "$PUBLISH_BRANCH"
        git checkout --quiet -B "$PUBLISH_BRANCH" FETCH_HEAD
        git clean -qfd
    fi

    apply_operation

    git add -A
    if git diff --cached --quiet; then
        echo "No changes to '$TARGET_PREFIX' on '$PUBLISH_BRANCH'; nothing to commit."
        exit 0
    fi
    git commit --quiet -m "$COMMIT_MESSAGE"

    if git push --quiet origin "HEAD:$PUBLISH_BRANCH"; then
        echo "Published '$TARGET_PREFIX' to '$PUBLISH_BRANCH' (attempt $attempt/$MAX_ATTEMPTS)."
        exit 0
    fi

    if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
        echo "::error::push to '$PUBLISH_BRANCH' failed after $MAX_ATTEMPTS attempts."
        exit 1
    fi
    echo "::notice::push to '$PUBLISH_BRANCH' rejected (attempt $attempt) — refreshing from remote and retrying."
    sleep "$attempt"
    attempt=$((attempt + 1))
done
