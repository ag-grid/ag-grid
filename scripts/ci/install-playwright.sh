#!/usr/bin/env bash
# Bounded, retrying Playwright install. `install-deps` / `install --with-deps` shell out to
# `apt-get update`, which has no timeout: when the mirror stalls (AG-18231) the step hangs until
# the job's time limit cancels it and no test ever runs.
#
# Usage: install-playwright.sh <deps|full|browsers> <browser>...
#   deps     - `playwright install-deps`        (cache hit: OS libraries only; apt)
#   full     - `playwright install --with-deps` (cache miss: browser download + apt)
#   browsers - `playwright install`             (browser download only; no apt)
#
# In CI the step must FAIL rather than be cancelled: a job cancelled by `timeout-minutes` makes
# `cancelled()` true and skips the report upload. So the budgets below are sized to give up after
# ~32 min, well inside the 90 min ceiling the workflow jobs carry. Healthy installs take 1-3 min;
# the bounds are generous because `timeout` cannot tell a stalled mirror from a slow one.
#
# This is also the installer behind the Nx `setup` targets, so it runs on developer machines as
# well as in CI. It keeps its output plain locally and only emits GitHub workflow commands under
# Actions.
set -uo pipefail

MODE="${1:-}"
shift || true
BROWSERS=("$@")

if [ -n "${GITHUB_ACTIONS:-}" ]; then
    group_start() { echo "::group::$1"; }
    group_end() { echo "::endgroup::"; }
    warn() { echo "::warning::$1"; }
    fail() { echo "::error::$1"; }
else
    group_start() { echo "$1"; }
    group_end() { :; }
    warn() { echo "WARNING: $1" >&2; }
    fail() { echo "ERROR: $1" >&2; }
fi

# The OS libraries are machine-global, but several Nx `setup` targets each call this script, so a
# single `nx test:e2e` run repeats the apt work once per project. Both outcomes are recorded and
# reused, because both multiply:
#
#   success - skip the apt work the rest of the run, which is what makes it cheap.
#   failure - fail the rest of the run immediately. This is the one that matters. Nx does not bail
#             on a failed task, so without it every remaining project pays the full ~30 min budget
#             against a mirror already known to be stalled; enough of them in series overshoot the
#             job's `timeout-minutes` and the job is CANCELLED rather than failed, losing the
#             report upload these bounds exist to preserve. One project pays, the rest report the
#             same infrastructure error at once.
#
# CI only: GitHub runners are ephemeral, so a marker cannot outlive the machine it describes. A
# developer machine is long-lived, where a stale marker could skip libraries a later OS change
# actually needs, or keep failing an install that a mirror recovery has since fixed.
DEPS_OK_MARKER=""
DEPS_FAILED_MARKER=""
if [ -n "${GITHUB_ACTIONS:-}" ]; then
    _marker_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
    DEPS_OK_MARKER="${_marker_dir}/.ag-playwright-deps-installed"
    DEPS_FAILED_MARKER="${_marker_dir}/.ag-playwright-deps-failed"
fi

# Only the apt-touching modes say anything about the runner's OS libraries. `browsers` is a CDN
# download, including when `full` was downgraded to it below, so its outcome is never recorded.
mark_deps() {
    case "$MODE" in
        deps | full) [ -n "$1" ] && touch "$1" 2>/dev/null || true ;;
    esac
}

if [ -n "${DEPS_FAILED_MARKER}" ] && [ -e "${DEPS_FAILED_MARKER}" ]; then
    case "$MODE" in
        deps | full)
            fail "Playwright OS dependency install already failed on this runner, so this attempt is skipped rather than repeating a ~30 min stall. See the first failure above for the cause. This is an infrastructure failure in the dependency install step - no tests were run, so it is NOT a test failure."
            exit 1
            ;;
    esac
fi

if [ -n "${DEPS_OK_MARKER}" ] && [ -e "${DEPS_OK_MARKER}" ]; then
    case "$MODE" in
        deps)
            echo "Playwright OS dependencies already installed on this runner - skipping apt."
            exit 0
            ;;
        full)
            echo "Playwright OS dependencies already installed on this runner - downloading browsers only."
            MODE=browsers
            ;;
    esac
fi

case "$MODE" in
    deps)
        CMD=(npx playwright install-deps "${BROWSERS[@]}")
        DEFAULT_TIMEOUT=600
        DEFAULT_ATTEMPTS=3
        LABEL="Playwright OS dependency install (playwright install-deps)"
        ;;
    full)
        CMD=(npx playwright install --with-deps "${BROWSERS[@]}")
        DEFAULT_TIMEOUT=900
        DEFAULT_ATTEMPTS=2
        LABEL="Playwright browser + OS dependency install (playwright install --with-deps)"
        ;;
    browsers)
        CMD=(npx playwright install "${BROWSERS[@]}")
        DEFAULT_TIMEOUT=900
        DEFAULT_ATTEMPTS=2
        LABEL="Playwright browser download (playwright install)"
        ;;
    *)
        fail "install-playwright.sh: unknown mode '${MODE}' (expected deps|full|browsers)"
        exit 2
        ;;
esac

ATTEMPT_TIMEOUT_SECONDS="${PW_INSTALL_TIMEOUT_SECONDS:-${DEFAULT_TIMEOUT}}"
MAX_ATTEMPTS="${PW_INSTALL_MAX_ATTEMPTS:-${DEFAULT_ATTEMPTS}}"
RETRY_DELAY_SECONDS="${PW_INSTALL_RETRY_DELAY_SECONDS:-20}"

# GNU coreutils `timeout`, absent from a stock macOS (where coreutils installs it as `gtimeout`).
# Without it the install still runs, just unbounded: the stall this guards against is an
# apt/Linux failure mode, so an unbounded run on a developer machine is the pre-existing
# behaviour rather than a regression.
TIMEOUT_BIN=""
for candidate in timeout gtimeout; do
    if command -v "${candidate}" >/dev/null 2>&1; then
        TIMEOUT_BIN="${candidate}"
        break
    fi
done

if [ -z "${TIMEOUT_BIN}" ]; then
    warn "No \`timeout\` binary found, so the ${ATTEMPT_TIMEOUT_SECONDS}s bound cannot be applied. Running ${LABEL} unbounded - install coreutils to re-enable the bound."
    group_start "${LABEL} - unbounded"
    "${CMD[@]}"
    status=$?
    group_end
    if [ "${status}" -eq 0 ]; then
        mark_deps "${DEPS_OK_MARKER}"
    else
        mark_deps "${DEPS_FAILED_MARKER}"
    fi
    exit "${status}"
fi

for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
    group_start "${LABEL} - attempt ${attempt}/${MAX_ATTEMPTS} (bounded to ${ATTEMPT_TIMEOUT_SECONDS}s)"
    "${TIMEOUT_BIN}" --signal=TERM --kill-after=30s "${ATTEMPT_TIMEOUT_SECONDS}s" "${CMD[@]}"
    status=$?
    group_end

    if [ "${status}" -eq 0 ]; then
        mark_deps "${DEPS_OK_MARKER}"
        exit 0
    fi

    if [ "${status}" -eq 124 ] || [ "${status}" -eq 137 ]; then
        reason="did not complete within its ${ATTEMPT_TIMEOUT_SECONDS}s bound and was killed (stalled or very slow package mirror / CDN fetch)"
    else
        reason="failed with exit code ${status}"
    fi
    warn "${LABEL} attempt ${attempt}/${MAX_ATTEMPTS} ${reason}."

    if [ "${attempt}" -lt "${MAX_ATTEMPTS}" ]; then
        # Give a TERM-ed apt time to release the dpkg/apt lock before retrying.
        sleep "${RETRY_DELAY_SECONDS}"
    fi
done

mark_deps "${DEPS_FAILED_MARKER}"
fail "${LABEL} did not complete after ${MAX_ATTEMPTS} attempts, each bounded to ${ATTEMPT_TIMEOUT_SECONDS}s. This is an infrastructure failure in the dependency install step - no tests were run, so it is NOT a test failure."
exit 1
