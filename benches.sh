#!/usr/bin/env bash
# Runs behavioural benchmarks directly via Vitest, bypassing Nx.
# Benchmarks run in a real headless Chromium (Playwright) by DEFAULT, so layout-dependent work is
# measured against a real layout engine. All other arguments are forwarded to `vitest bench`.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Profiles live under benchmarks/tmp/ which is already git-ignored, so no separate ignore needed.
PROFILE_DIR="$SCRIPT_DIR/testing/behavioural/src/benchmarks/tmp/profiles"

usage() {
    cat <<'EOF'
Usage: ./benches.sh [pattern] [options]

  pattern                A file-name pattern forwarded to `vitest bench` (e.g. "grouping-pipelines").
                         Narrows the run to matching .bench.ts files. Omit to run all.

Engine:
  (default)              Real headless Chromium (Playwright) — measures against a real layout engine.
  --node, --jsdom        Run in node/jsdom instead — faster, no layout engine.

Modes:
  -w, --watch            Watch mode (re-runs on file changes).
  --headed               Visible Chromium, single run — watch the grid render.
  --ui                   Visible Chromium + the Vitest dashboard at a localhost URL; starts WITHOUT
                         running (pick benches from the dashboard), and stays open.
  --profile              Node single run with a V8 CPU profile (--cpu-prof) for method-cost analysis.
                         Writes a .cpuprofile under benchmarks/tmp/profiles/ (printed after the run) —
                         open it in Chrome DevTools or speedscope. Implies --node (browser can't emit it).
  --bench-compare ...    Pass through to bench-compare.mjs (base/test/compare/all/backup); everything
                         after it is forwarded verbatim, e.g. ./benches.sh --bench-compare all --runs 3.
  -h, --help             Show this help.

Anything else is forwarded verbatim to `vitest bench`.
EOF
}

# `--bench-compare [args...]` is a thin pass-through to the bench-compare.mjs tool. Handled before the
# option loop so its sub-commands/flags (base/test/compare/all/backup, --runs, --filter, …) reach the
# script untouched.
if [ "${1:-}" = "--bench-compare" ]; then
    shift
    exec node "$SCRIPT_DIR/testing/behavioural/src/benchmarks/bench-compare.mjs" "$@"
fi

# Default to --run (non-watch) unless the caller passes -w / --watch. --node/--jsdom, --headed, --ui
# and --profile are consumed here (not forwarded) and turned into the BENCH_* env vars the vitest
# config reads; everything else is forwarded to `vitest bench`.
run_flag="--run"
profile=0
show_help=0
node_flag=0
browser_mode_flag=0
forwarded=()
for arg in "$@"; do
    case "$arg" in
        -h | --help)
            show_help=1
            ;;
        -w | --watch)
            run_flag=""
            forwarded+=("$arg")
            ;;
        --node | --jsdom)
            export BENCH_NODE=1
            node_flag=1
            ;;
        --headed | --interactive)
            export BENCH_BROWSER_HEADED=1
            run_flag=""
            browser_mode_flag=1
            ;;
        --ui)
            # Visible browser + the Vitest dashboard (bench picker) at a localhost URL. --standalone
            # starts WITHOUT running anything (pick benches from the dashboard); --watch keeps the
            # server + browser alive (and is required by --standalone). CLI --watch beats config watch:false.
            export BENCH_BROWSER_HEADED=1
            run_flag=""
            forwarded+=("--ui" "--standalone" "--watch")
            browser_mode_flag=1
            ;;
        --profile)
            # V8 CPU profile of the grid code. Node-only: browser mode doesn't use the forks pool the
            # --cpu-prof execArgv attaches to. Single run (profiling distorts timing — not for numbers).
            export BENCH_NODE=1
            export BENCH_PROFILE=1
            export BENCH_PROFILE_DIR="$PROFILE_DIR"
            profile=1
            ;;
        *)
            forwarded+=("$arg")
            ;;
    esac
done

cd "$SCRIPT_DIR/testing/behavioural"

# --help shows vitest's own bench help first, then ours at the end so our options stay visible.
if [ "$show_help" -eq 1 ]; then
    npx vitest bench --help || true
    echo ""
    usage
    exit 0
fi

# --profile and --node run in node (no browser), so they can't combine with the browser-only
# --headed/--ui — fail loudly instead of silently picking node and ignoring the visible-browser flag.
if [ "$browser_mode_flag" -eq 1 ] && { [ "$profile" -eq 1 ] || [ "$node_flag" -eq 1 ]; }; then
    echo "benches.sh: --headed/--ui need a real browser and can't combine with --node/--jsdom/--profile." >&2
    exit 2
fi

# Browser is the default, so ensure the Playwright Chromium build matching the installed `playwright`
# package is present (the launch fails otherwise). `playwright install` is a no-op when up to date.
# Skipped for --node, which needs no browser.
if [ -z "${BENCH_NODE:-}" ]; then
    npx playwright install chromium chromium-headless-shell
fi

# On macOS, run under `caffeinate -i` so a long bench run isn't throttled or interrupted by idle
# sleep / App Nap. It's a built-in (no install), propagates the child's exit status, and is absent
# elsewhere — where we just run vitest directly.
caffeinate_prefix=()
if command -v caffeinate >/dev/null 2>&1; then
    caffeinate_prefix=(caffeinate -i)
fi

# Assemble the command. `${arr[@]+"${arr[@]}"}` expands to nothing when the array is empty — avoids
# the "unbound variable" error `set -u` raises on `"${arr[@]}"` under bash 3.2 (macOS).
cmd=(${caffeinate_prefix[@]+"${caffeinate_prefix[@]}"} npx vitest bench)
if [ -n "$run_flag" ]; then
    cmd+=("$run_flag")
fi
cmd+=(${forwarded[@]+"${forwarded[@]}"})

# Profiling needs to print the emitted .cpuprofile name afterwards, so run (not exec) and report it.
if [ "$profile" -eq 1 ]; then
    mkdir -p "$PROFILE_DIR"
    set +e
    "${cmd[@]}"
    status=$?
    set -e
    newest=$(ls -t "$PROFILE_DIR"/*.cpuprofile 2>/dev/null | head -1)
    if [ -n "$newest" ]; then
        echo ""
        echo "CPU profile written: $newest"
        echo "Open in Chrome DevTools (Performance → Load profile) or https://speedscope.app"
    fi
    exit "$status"
fi

exec "${cmd[@]}"
