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
#                                  | 'squash' (replace the branch with one parentless commit
#                                  carrying its current tree). Publishes only ever add commits, so
#                                  the branch history is monotonic and removing a preview never
#                                  reclaims its blobs; squashing is what actually frees them.
#   TARGET_PREFIX       required   path(s) owned by this operation, e.g. 'pr-123'. MODE=remove
#                                  accepts a whitespace-separated list so a sweep (e.g. reclaiming
#                                  many stale previews at once) lands as ONE push: GitHub Pages
#                                  rebuilds the whole site per push and its branch builds are
#                                  single-flight, so N pushes cost N cancelling builds. Paths must
#                                  not contain whitespace. MODE=sync requires exactly one.
#                                  Not used (and not required) by MODE=squash, which owns the
#                                  whole branch rather than a prefix.
#   COMMIT_MESSAGE      required   commit message
#   SOURCE_DIR          sync only  directory whose contents overlay TARGET_PREFIX/
#   PUBLISH_BRANCH      optional   default 'gh-pages'
#   MAX_ATTEMPTS        optional   default 5
#   PUBLISH_REMOTE      optional   overrides the derived github.com remote (tests only)
#
# Outputs (when GITHUB_OUTPUT is set):
#   commit_sha          the branch tip carrying this operation's content. Callers that address the
#                       published files by immutable commit (e.g. a raw.githubusercontent.com URL)
#                       need this — the branch name alone is served with a cache TTL and can move.
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${MODE:?MODE is required (sync|remove|squash)}"
: "${COMMIT_MESSAGE:?COMMIT_MESSAGE is required}"
[ "$MODE" = squash ] || : "${TARGET_PREFIX:?TARGET_PREFIX is required}"
TARGET_PREFIX="${TARGET_PREFIX:-}"
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
    squash)
        # Squash owns the branch, not a prefix. Drop anything passed so the rm -rf validation
        # below cannot be handed a path this mode never touches.
        TARGET_PREFIXES=()
        ;;
    *) echo "::error::MODE must be 'sync', 'remove' or 'squash' (got '$MODE')"; exit 1 ;;
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

if [ "$branch_exists" = false ] && [ "$MODE" != sync ]; then
    echo "Publish branch '$PUBLISH_BRANCH' does not exist; nothing to $MODE."
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

# Report the tip that carries this operation's content, for callers that address published files by
# commit rather than by branch name.
emit_commit_sha() {
    [ -n "${GITHUB_OUTPUT:-}" ] || return 0
    echo "commit_sha=$(git rev-parse HEAD)" >> "$GITHUB_OUTPUT"
}

apply_operation() {
    case "$MODE" in
        sync)
            mkdir -p "$TARGET_PREFIX"
            cp -R "$SOURCE_DIR"/. "$TARGET_PREFIX"/
            touch .nojekyll # disable Jekyll for the whole Pages site
            ;;
        squash)
            # Re-parent the fetched tree onto nothing. The index and working tree survive the
            # checkout, so the commit below carries the branch tip's tree byte for byte — only
            # its ancestry is dropped.
            # Attempt-unique name: --orphan refuses to create a branch that already exists, and
            # the retry path re-enters this with the first attempt's branch still present.
            git checkout --quiet --orphan "squashed-publish-${attempt}"
            ;;
        *)
            for p in "${TARGET_PREFIXES[@]}"; do
                rm -rf -- "$p"
            done
            ;;
    esac
}

# These paths are deleted with rm -rf inside a clone of the publish branch. Reject anything
# that could escape it or resolve to the clone root before that happens.
for p in ${TARGET_PREFIXES[@]+"${TARGET_PREFIXES[@]}"}; do
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
        # depth 2 in squash mode: one commit deep cannot tell "already squashed" from
        # "shallow boundary", and the answer decides whether to force-push at all.
        git fetch --quiet --depth "$([ "$MODE" = squash ] && echo 2 || echo 1)" origin "$PUBLISH_BRANCH"
        git checkout --quiet -B "$PUBLISH_BRANCH" FETCH_HEAD
        git clean -qfd
    fi

    if [ "$MODE" = squash ]; then
        # The lease. A publish that lands between this fetch and the push below moves the tip,
        # the push is rejected, and the retry squashes the newer tree instead of discarding it.
        expected_tip="$(git rev-parse HEAD)"
        if [ "$(git rev-list --count HEAD)" -eq 1 ]; then
            echo "'$PUBLISH_BRANCH' is already a single commit; nothing to squash."
            exit 0
        fi
    fi

    apply_operation

    git add -A
    if git diff --cached --quiet; then
        # Identical content is already on the branch, so HEAD (the tip we just fetched) serves it.
        # Still an addressable result, so still report a sha.
        echo "No changes to '${TARGET_PREFIX:-$PUBLISH_BRANCH}' on '$PUBLISH_BRANCH'; nothing to commit."
        emit_commit_sha
        exit 0
    fi
    git commit --quiet -m "$COMMIT_MESSAGE"

    if [ "$MODE" = squash ]; then
        push_args=("--force-with-lease=${PUBLISH_BRANCH}:${expected_tip}")
    else
        push_args=()
    fi
    if git push --quiet ${push_args[@]+"${push_args[@]}"} origin "HEAD:$PUBLISH_BRANCH"; then
        echo "Published '${TARGET_PREFIX:-$PUBLISH_BRANCH}' to '$PUBLISH_BRANCH' (attempt $attempt/$MAX_ATTEMPTS)."
        emit_commit_sha
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
