#!/usr/bin/env bash
# Bounded, retrying Playwright install.
#
# `playwright install-deps` / `install --with-deps` shell out to `apt-get update`, which has no
# timeout and no retry: when the Azure mirror stalls (AG-18231, run 32093233856) the step hangs
# until the 6-hour GitHub Actions job limit cancels the job, and no example test ever runs.
# Bound each attempt, retry a few times, and fail with a message that names the install - not the
# tests - as the cause.
#
# Usage: install-playwright.sh <deps|full|browsers> <browser>...
#   deps     - `playwright install-deps`        (cache hit: OS libraries only; apt)
#   full     - `playwright install --with-deps` (cache miss: browser download + apt)
#   browsers - `playwright install`             (browser download only; no apt)
#
# Budgets are sized so that the WORST case (every attempt timing out, plus the delays between
# them) still fails the step well inside the smallest `timeout-minutes` declared by a job that
# calls it - currently 60 in .github/workflows/doc-tests.yml. That matters: a job cancelled by
# `timeout-minutes` makes `cancelled()` true and skips the report upload, whereas a failed step
# fails the job and the shard still appears in the combined report.
#   deps     3 x 300s + 2 x 20s = 15.7 min
#   full     2 x 600s + 1 x 20s = 20.3 min
#   browsers 2 x 600s + 1 x 20s = 20.3 min
set -uo pipefail

MODE="${1:-}"
shift || true
BROWSERS=("$@")

case "$MODE" in
    deps)
        CMD=(npx playwright install-deps "${BROWSERS[@]}")
        DEFAULT_TIMEOUT=300
        DEFAULT_ATTEMPTS=3
        LABEL="Playwright OS dependency install (playwright install-deps)"
        ;;
    full)
        CMD=(npx playwright install --with-deps "${BROWSERS[@]}")
        DEFAULT_TIMEOUT=600
        DEFAULT_ATTEMPTS=2
        LABEL="Playwright browser + OS dependency install (playwright install --with-deps)"
        ;;
    browsers)
        CMD=(npx playwright install "${BROWSERS[@]}")
        DEFAULT_TIMEOUT=600
        DEFAULT_ATTEMPTS=2
        LABEL="Playwright browser download (playwright install)"
        ;;
    *)
        echo "::error::install-playwright.sh: unknown mode '${MODE}' (expected deps|full|browsers)"
        exit 2
        ;;
esac

ATTEMPT_TIMEOUT_SECONDS="${PW_INSTALL_TIMEOUT_SECONDS:-${DEFAULT_TIMEOUT}}"
MAX_ATTEMPTS="${PW_INSTALL_MAX_ATTEMPTS:-${DEFAULT_ATTEMPTS}}"
RETRY_DELAY_SECONDS="${PW_INSTALL_RETRY_DELAY_SECONDS:-20}"

for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
    echo "::group::${LABEL} - attempt ${attempt}/${MAX_ATTEMPTS} (bounded to ${ATTEMPT_TIMEOUT_SECONDS}s)"
    timeout --signal=TERM --kill-after=30s "${ATTEMPT_TIMEOUT_SECONDS}s" "${CMD[@]}"
    status=$?
    echo "::endgroup::"

    if [ "${status}" -eq 0 ]; then
        exit 0
    fi

    if [ "${status}" -eq 124 ] || [ "${status}" -eq 137 ]; then
        reason="made no progress within ${ATTEMPT_TIMEOUT_SECONDS}s and was killed (stalled package mirror or CDN fetch)"
    else
        reason="failed with exit code ${status}"
    fi
    echo "::warning::${LABEL} attempt ${attempt}/${MAX_ATTEMPTS} ${reason}."

    if [ "${attempt}" -lt "${MAX_ATTEMPTS}" ]; then
        # Give a TERM-ed apt time to release the dpkg/apt lock before retrying.
        sleep "${RETRY_DELAY_SECONDS}"
    fi
done

echo "::error::${LABEL} did not complete after ${MAX_ATTEMPTS} attempts, each bounded to ${ATTEMPT_TIMEOUT_SECONDS}s. This is an infrastructure failure in the dependency install step - no example tests were run, so it is NOT a test failure."
exit 1
