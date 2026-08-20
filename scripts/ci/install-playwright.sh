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
# ~35 min (2 bounded attempts, plus the retry and apt-lock waits between them), well inside the
# 90 min ceiling the workflow jobs carry. Healthy installs take 1-3 min; the bounds are generous
# because `timeout` cannot tell a stalled mirror from a slow one.
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
# single `nx test:e2e` run repeats the apt work once per project. Two outcomes are recorded and
# reused, because both multiply:
#
#   installed - skip the apt work the rest of the run, which is what makes it cheap.
#   stalled   - fail the rest of the run immediately. This is the one that matters. Nx does not bail
#               on a failed task, so without it every remaining project pays the full ~30 min budget
#               against a mirror already known to be stalled; enough of them in series overshoot the
#               job's `timeout-minutes` and the job is CANCELLED rather than failed, losing the
#               report upload these bounds exist to preserve. One project pays, the rest report the
#               same infrastructure error at once.
#
# Neither is a lock, and the sequence is deliberately safe without one. Concurrent callers may all
# find no record and run apt at once, but that is what they do today with no records at all, so it
# is no worse; apt's own locking serialises them and the retries below absorb it. What must not
# happen is a caller that lost that race condemning the runner for everyone else, which is why only
# a stall - never a plain failure - is recorded.
#
# CI only: GitHub runners are ephemeral, so this state cannot outlive the machine it describes. A
# developer machine is long-lived, where it could skip libraries a later OS change actually needs,
# or keep failing an install that a mirror recovery has since fixed. Being single-runner-scoped is
# also why nothing here is keyed by Playwright version: one runner is one checkout, so the version
# cannot change underneath the state. The browser set can and does vary between callers.
DEPS_INSTALLED_FILE=""
DEPS_STALLED_MARKER=""
if [ -n "${GITHUB_ACTIONS:-}" ]; then
    _state_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
    DEPS_INSTALLED_FILE="${_state_dir}/.ag-playwright-deps-installed"
    DEPS_STALLED_MARKER="${_state_dir}/.ag-playwright-deps-stalled"
fi

# Only the apt-touching modes say anything about the runner's OS libraries. `browsers` is a CDN
# download, including when `full` is downgraded to it below, so its outcome is never recorded.
touches_apt() {
    case "$MODE" in
        deps | full) return 0 ;;
        *) return 1 ;;
    esac
}

# Recorded per browser, because the OS libraries are not the same for each: Firefox and WebKit pull
# their own, so a chromium-only success must not be read as covering a later chromium+firefox+webkit
# request. Append-only, one browser per line - concurrent callers can add to it without a lock.
record_deps_installed() {
    touches_apt || return 0
    [ -n "${DEPS_INSTALLED_FILE}" ] || return 0
    printf '%s\n' "${BROWSERS[@]}" >> "${DEPS_INSTALLED_FILE}" 2>/dev/null || true
}

# Satisfied only when every browser asked for has already had its dependencies installed.
deps_already_installed() {
    [ -n "${DEPS_INSTALLED_FILE}" ] && [ -s "${DEPS_INSTALLED_FILE}" ] || return 1
    local browser
    for browser in "${BROWSERS[@]}"; do
        grep -qxF "${browser}" "${DEPS_INSTALLED_FILE}" 2>/dev/null || return 1
    done
    return 0
}

# Recorded only for a stall - an attempt killed at its bound - never for an install that merely
# failed. A fast failure has not cost the budget this short-circuit exists to avoid spending twice,
# and it may well be transient: a caller that lost a race for the dpkg lock fails in seconds, and
# must not condemn a runner whose dependencies another caller is busy installing correctly.
record_deps_stalled() {
    touches_apt || return 0
    [ -n "${DEPS_STALLED_MARKER}" ] || return 0
    touch "${DEPS_STALLED_MARKER}" 2>/dev/null || true
}

if touches_apt && [ -n "${DEPS_STALLED_MARKER}" ] && [ -e "${DEPS_STALLED_MARKER}" ]; then
    fail "The Playwright OS dependency install already stalled on this runner, so this attempt is skipped rather than repeating a ~30 min stall. See the first failure above for the cause. This is an infrastructure failure in the dependency install step - no tests were run, so it is NOT a test failure."
    exit 1
fi

if deps_already_installed; then
    case "$MODE" in
        deps)
            echo "OS dependencies for [${BROWSERS[*]}] already installed on this runner - skipping apt."
            exit 0
            ;;
        full)
            echo "OS dependencies for [${BROWSERS[*]}] already installed on this runner - downloading browsers only."
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
APT_WAIT_SECONDS="${PW_INSTALL_APT_WAIT_SECONDS:-120}"

# `timeout` signals only its direct child, `npx`. The `apt-get` Playwright starts under sudo is a
# grandchild, so it survives the kill and keeps /var/lib/apt/lists/lock. A retry on a fixed delay
# therefore raced a still-dying apt and died on "Could not get lock" in about a second - burning an
# attempt without ever reaching the mirror (run 32269132733, where the 20s delay was not enough and
# process 2808 still held the lock). So wait for apt to actually go before each attempt, rather than
# guess how long it needs.
#
# Prevention, not detection, and specifically NOT by capturing the attempt's output to classify the
# failure afterwards: that surviving grandchild also inherits stdout, so piping the attempt through
# `tee` means the pipe never reaches EOF when `timeout` kills its child. The pipeline then blocks
# forever and defeats the bound entirely - run 32272425164 hung 90 min to the job cap with `tee`
# still resident. The attempt must keep writing straight to the step log, with nothing downstream
# of it that can outlive the kill.
apt_is_busy() {
    [ -e /var/lib/apt/lists/lock ] || return 1
    pgrep -x apt-get >/dev/null 2>&1 || pgrep -x dpkg >/dev/null 2>&1
}

wait_for_apt() {
    apt_is_busy || return 0
    echo "Waiting up to ${APT_WAIT_SECONDS}s for a lingering apt/dpkg to release its lock..."
    waited=0
    while apt_is_busy && [ "${waited}" -lt "${APT_WAIT_SECONDS}" ]; do
        sleep 5
        waited=$((waited + 5))
    done
    if apt_is_busy; then
        warn "apt/dpkg still held its lock after ${waited}s. Retrying anyway."
    else
        echo "apt released its lock after ${waited}s."
    fi
}

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
    # Nothing was bounded, so a failure here is not a stall and is not recorded as one.
    [ "${status}" -eq 0 ] && record_deps_installed
    exit "${status}"
fi

stalled=0
for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
    # Before, not after: the apt a previous attempt started can outlive the kill, and a foreign one
    # (unattended-upgrades) can hold the lock at any point. Either way, going in while it is held
    # wastes the attempt on a collision instead of learning anything about the mirror.
    wait_for_apt
    group_start "${LABEL} - attempt ${attempt}/${MAX_ATTEMPTS} (bounded to ${ATTEMPT_TIMEOUT_SECONDS}s)"
    "${TIMEOUT_BIN}" --signal=TERM --kill-after=30s "${ATTEMPT_TIMEOUT_SECONDS}s" "${CMD[@]}"
    status=$?
    group_end

    if [ "${status}" -eq 0 ]; then
        record_deps_installed
        exit 0
    fi

    if [ "${status}" -eq 124 ] || [ "${status}" -eq 137 ]; then
        stalled=1
        reason="did not complete within its ${ATTEMPT_TIMEOUT_SECONDS}s bound and was killed (stalled or very slow package mirror / CDN fetch)"
    else
        reason="failed with exit code ${status}"
    fi
    warn "${LABEL} attempt ${attempt}/${MAX_ATTEMPTS} ${reason}."

    if [ "${attempt}" -lt "${MAX_ATTEMPTS}" ]; then
        sleep "${RETRY_DELAY_SECONDS}"
    fi
done

[ "${stalled}" -eq 1 ] && record_deps_stalled
fail "${LABEL} did not complete after ${MAX_ATTEMPTS} attempts, each bounded to ${ATTEMPT_TIMEOUT_SECONDS}s. This is an infrastructure failure in the dependency install step - no tests were run, so it is NOT a test failure."
exit 1
