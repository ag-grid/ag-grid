#!/bin/bash
# external/ag-shared/scripts/setup-worktree/setup-worktree.sh
#
# Install dependencies in a new git worktree, the fast way when possible.
#
# Usage: setup-worktree.sh [worktree-path]   (defaults to the current directory)
#
# Called by claude-worktree-create.sh and Cursor's worktree setup, and by hand
# after a manual `git worktree add`. Strategy:
#   1. Run preinstall-worktree.sh — it fixes external symlinks, COW-clones
#      node_modules, .nx cache, and plugins/*/dist, and writes
#      node_modules/.ag-worktree-fast-path-ok when the COW'd state is
#      equivalent to a full `yarn install`. The post-checkout git hook has
#      usually done this already; running it again is a quick no-op.
#   2. If the marker is present → skip `yarn install` and just run the
#      postinstall chain with AG_WORKTREE_FAST_PATH=1. Expensive steps
#      (patches, plugin-build, nx daemon reset) self-skip via that env
#      var; cheap idempotent steps (git hooks, setup-prompts) still run.
#      Future postinstall steps run by default unless explicitly gated.
#   3. If the marker is missing → fall back to a full install, with
#      AG_PREINSTALL_ACTIVE=1 so preinstall-worktree.sh does not run twice:
#      `npm run bootstrap` where the repo defines it (ag-grid, ag-studio), since
#      it sets the AG registry and only runs approved install scripts, otherwise
#      `yarn install`, offline first.
#
# Exits non-zero when the postinstall chain or the install fails, so callers do
# not report a worktree as ready without its dependencies.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${1:-$PWD}" && pwd)"

log() { echo "[setup-worktree] $*"; }

if [[ ! -f "$REPO_ROOT/package.json" ]]; then
    log "ERROR: no package.json in ${REPO_ROOT}" >&2
    exit 1
fi

export AG_SKIP_NATIVE_DEP_VERSION_CHECK=1

cd "$REPO_ROOT"

log "Running preinstall (COW clone + symlink fix)..."
bash "$SCRIPT_DIR/preinstall-worktree.sh" || true

if [[ -f "$REPO_ROOT/node_modules/.ag-worktree-fast-path-ok" ]]; then
    log "Fast path: skipping yarn install, running gated postinstall chain..."
    AG_WORKTREE_FAST_PATH=1 yarn run postinstall
elif node -e 'process.exit(require("./package.json").scripts?.bootstrap ? 0 : 1)'; then
    log "Slow path: running npm run bootstrap..."
    AG_PREINSTALL_ACTIVE=1 npm run bootstrap
else
    log "Slow path: running yarn install --immutable (offline)..."
    AG_PREINSTALL_ACTIVE=1 YARN_ENABLE_NETWORK=false yarn install --immutable ||
        AG_PREINSTALL_ACTIVE=1 yarn install
fi

log "Worktree ready at: ${REPO_ROOT}"
