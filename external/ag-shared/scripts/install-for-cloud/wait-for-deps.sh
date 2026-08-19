#!/usr/bin/env bash
# external/ag-shared/scripts/install-for-cloud/wait-for-deps.sh
#
# Block until an install started by finish-setup.sh (possibly in another session
# sharing this environment) has finished, then exit 0. Run this in a cloud session
# before any build, test or lint command when the SessionStart notice said
# dependencies were not ready.
#
# Exits 0 immediately when no install is in flight and node_modules looks valid,
# so it is safe to call unconditionally. When nothing is in flight and the tree is
# not usable, it says to run finish-setup.sh rather than waiting forever.
#
#   bash external/ag-shared/scripts/install-for-cloud/wait-for-deps.sh [timeout_seconds]

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
TIMEOUT="${1:-900}"

log() { echo "[wait-for-deps] $*"; }

cd "$REPO_ROOT" || exit 1

# An install is only in flight while the process holding the lock is alive. A lock
# from a killed session used to make this script wait out its full timeout on an
# install that no longer existed.
install_in_flight() {
    local holder
    holder="$(head -1 "$STATE/lock/pid" 2>/dev/null || true)"
    [[ -n "$holder" ]] && kill -0 "$holder" 2>/dev/null
}

if [[ -f "$STATE/failed" ]] && ! install_in_flight; then
    log "the last install FAILED — last 30 lines:"
    tail -30 "$STATE/install.log" 2>/dev/null
    log "re-run it: bash ${SCRIPT_DIR}/finish-setup.sh"
    exit 1
fi

if ! install_in_flight; then
    if [[ -d node_modules ]] && yarn check --integrity &>/dev/null &&
        [[ ! -f "$AG_CLOUD_CACHE_DIR/unscripted" ]]; then
        log "dependencies already present and valid"
        exit 0
    fi
    log "no install in flight, and node_modules is missing, stale or unscripted"
    log "run: bash ${SCRIPT_DIR}/finish-setup.sh"
    exit 1
fi

log "waiting for the install in flight (timeout ${TIMEOUT}s)"
start=$SECONDS
while ((SECONDS - start < TIMEOUT)); do
    if [[ -f "$STATE/ready" ]]; then
        log "dependencies ready after $((SECONDS - start))s of waiting"
        exit 0
    fi
    if [[ -f "$STATE/failed" ]]; then
        log "the install FAILED after $((SECONDS - start))s — last 30 lines:"
        tail -30 "$STATE/install.log" 2>/dev/null
        exit 1
    fi
    if ! install_in_flight; then
        log "the install stopped without finishing after $((SECONDS - start))s"
        log "run: bash ${SCRIPT_DIR}/finish-setup.sh"
        exit 1
    fi
    sleep 5
    # Progress every ~30s so a watching human sees movement.
    if (((SECONDS - start) % 30 < 5)); then
        log "still installing ($((SECONDS - start))s elapsed): $(tail -1 "$STATE/install.log" 2>/dev/null)"
    fi
done

log "timed out after ${TIMEOUT}s; install may still be running"
log "check progress: tail -f $STATE/install.log"
exit 1
