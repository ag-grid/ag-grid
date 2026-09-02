#!/usr/bin/env bash
# external/ag-shared/scripts/install-for-cloud/finish-setup.sh
#
# Finish preparing a Claude Code cloud session, in the foreground. Needed once per
# session before any build, test or lint command — sessions are fresh VMs from the
# environment snapshot, so this cannot be done once for all of them.
#
# Run it when the SessionStart notice says dependencies are not ready:
#   bash external/ag-shared/scripts/install-for-cloud/finish-setup.sh
#
# Why a foreground script rather than something automatic:
#
#   - The environment's setup script has a ~5 minute cap, and a full install of
#     this monorepo needs ~9 minutes on a cloud VM. So it installs with
#     --ignore-scripts and marks the cache `unscripted`; the remaining work —
#     patches, allow-scripts, the nx plugin build — has to happen in a session.
#   - The SessionStart hook cannot do it. Claude Code waits for hooks before the
#     first message (a blocking install froze one session for 9+ minutes), and a
#     detached install does not outlive the session that spawned it (measured: a
#     later session found a truncated log, no process, and a stale lock).
#   - A Bash tool call does survive, because the session waits on it. That is this
#     script.
#
# It is idempotent and safe to run when everything is already fine.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../../../.." && pwd)}"
if [[ -z "${AG_CLOUD_CACHE_DIR:-}" ]]; then
    if [[ -d /opt/ag-cloud ]]; then
        AG_CLOUD_CACHE_DIR=/opt/ag-cloud
    else
        AG_CLOUD_CACHE_DIR="$HOME/.cache/ag-cloud"
    fi
fi
STATE="$AG_CLOUD_CACHE_DIR/deps"
START_TS=$SECONDS

export AG_SKIP_NATIVE_DEP_VERSION_CHECK=1
export PUPPETEER_SKIP_DOWNLOAD=true
export NX_DAEMON=false

log() { echo "[finish-setup] $*"; }

cd "$REPO_ROOT" || {
    log "cannot enter ${REPO_ROOT}"
    exit 1
}

# ---------------------------------------------------------------------------
# Lock — one install at a time per environment, since /opt/ag-cloud is shared by
# every session in it. The lock records its pid so a lock left behind by a killed
# session can be told apart from a live install.
# ---------------------------------------------------------------------------

mkdir -p "$STATE"
if ! mkdir "$STATE/lock" 2>/dev/null; then
    holder="$(head -1 "$STATE/lock/pid" 2>/dev/null || true)"
    if [[ -n "$holder" ]] && kill -0 "$holder" 2>/dev/null; then
        log "another install is running (pid ${holder}); waiting for it instead"
        exec bash "$SCRIPT_DIR/wait-for-deps.sh"
    fi
    log "clearing a stale lock (holder ${holder:-unknown} is gone)"
    rm -rf "$STATE/lock"
    mkdir -p "$STATE/lock"
fi
echo $$ >"$STATE/lock/pid"
trap 'rm -rf "$STATE/lock"' EXIT

rm -f "$STATE/ready" "$STATE/failed"
date +%s >"$STATE/started"

# ---------------------------------------------------------------------------
# Install
# ---------------------------------------------------------------------------

log "yarn install --prefer-offline in ${REPO_ROOT} (several minutes)"
if yarn install --prefer-offline 2>&1 | tee "$STATE/install.log" | tail -5; then
    date +%s >"$STATE/ready"
    log "install finished in $((SECONDS - START_TS))s"
else
    date +%s >"$STATE/failed"
    log "install FAILED after $((SECONDS - START_TS))s — last 30 lines:"
    tail -30 "$STATE/install.log" 2>/dev/null
    exit 1
fi

# ---------------------------------------------------------------------------
# Refresh the cache from the now-scripted tree. Do not count on this helping the
# next session: sessions are fresh VMs restored from the environment snapshot, and
# a session measured 133 s of uptime against cache files stamped seven minutes
# before its own boot, with no trace of an earlier session's writes. Kept because
# it costs a hardlink copy, repairs the cache inside long-lived sessions, and pays
# off if the platform ever does preserve it.
# ---------------------------------------------------------------------------

refresh_cache() {
    [[ -d node_modules ]] || return 1
    [[ -w "$AG_CLOUD_CACHE_DIR" ]] || {
        log "cache dir ${AG_CLOUD_CACHE_DIR} is not writable; skipping refresh"
        return 1
    }

    local staging="$AG_CLOUD_CACHE_DIR/node_modules.scripted.$$"
    rm -rf "$staging"
    # Hardlinks: ~200k files, so a real copy is minutes.
    cp -al node_modules "$staging" 2>/dev/null || cp -a node_modules "$staging" 2>/dev/null || {
        rm -rf "$staging"
        return 1
    }
    rm -rf "$AG_CLOUD_CACHE_DIR/node_modules"
    mv "$staging" "$AG_CLOUD_CACHE_DIR/node_modules"

    if [[ -f yarn.lock ]]; then
        if command -v sha256sum &>/dev/null; then
            sha256sum yarn.lock | awk '{print $1}' >"$AG_CLOUD_CACHE_DIR/yarn.lock.sha256"
        else
            shasum -a 256 yarn.lock | awk '{print $1}' >"$AG_CLOUD_CACHE_DIR/yarn.lock.sha256"
        fi
    fi
    rm -f "$AG_CLOUD_CACHE_DIR/unscripted"
    log "cache refreshed from the scripted tree; later sessions restore it directly"
}

refresh_cache || log "cache not refreshed — later sessions will run this script again"

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

log "total $((SECONDS - START_TS))s"
bash "$SCRIPT_DIR/cloud-doctor.sh"
exit 0
