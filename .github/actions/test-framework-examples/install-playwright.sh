#!/usr/bin/env bash
# Bounded, retrying Playwright install. `install-deps` / `install --with-deps` shell out to
# `apt-get update`, which has no timeout: when the mirror stalls (AG-18231) the step hangs until
# the 6-hour job limit cancels the job and no test ever runs.
#
# Usage: install-playwright.sh <deps|full|browsers> <browser>...
#   deps     - `playwright install-deps`        (cache hit: OS libraries only; apt)
#   full     - `playwright install --with-deps` (cache miss: browser download + apt)
#   browsers - `playwright install`             (browser download only; no apt)
#
# The step must FAIL rather than be cancelled: a job cancelled by `timeout-minutes` makes
# `cancelled()` true and skips the report upload. So the budgets below are sized to give up after
# ~32 min, well inside the 90 min ceiling every doc-tests job now carries. Healthy installs take
# 1-3 min; the bounds are generous because `timeout` cannot tell a stalled mirror from a slow one.
set -uo pipefail

MODE="${1:-}"
shift || true
BROWSERS=("$@")

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
        reason="did not complete within its ${ATTEMPT_TIMEOUT_SECONDS}s bound and was killed (stalled or very slow package mirror / CDN fetch)"
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
