#!/usr/bin/env bash
# Runs docs Playwright e2e tests directly, bypassing Nx.
# All arguments are forwarded to playwright. Defaults to chromium only.
#
# Usage:
#   ./docs-e2e.sh                                   # Run all tests (chromium)
#   ./docs-e2e.sh "file-pattern"                    # Run tests matching pattern
#   ./docs-e2e.sh "file-pattern" --grep "name"      # Run specific test by name
#   ./docs-e2e.sh --all-browsers                    # Run all browsers
#   ./docs-e2e.sh --framework react                 # Run with specific framework
#   ./docs-e2e.sh --url https://localhost:4610      # Run against specific URL
#   ./docs-e2e.sh --headed                          # Run in headed mode
#   ./docs-e2e.sh --ui                              # Open Playwright UI mode
#   ./docs-e2e.sh --debug                           # Debug mode

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
    cat <<'EOF'
Usage: ./docs-e2e.sh [options] [playwright-args]

Runs docs Playwright e2e tests directly, bypassing Nx. Defaults to chromium only.
Any unrecognised arguments are forwarded directly to playwright test.

Options:
  --all-browsers          Run all browsers (chromium, firefox, webkit)
  --framework <name>      Set FRAMEWORK env var (e.g. react, angular, vue)
  --url <url>             Set BASE_URL env var (default: https://localhost:4610)
  --help                  Show this help message

Playwright options (forwarded as-is):
  "file-pattern"          Run tests matching pattern
  --grep <name>           Run tests matching name
  --project <browser>     Run specific browser project
  --headed                Run in headed mode
  --ui                    Open Playwright UI mode
  --debug                 Debug mode

Examples:
  ./docs-e2e.sh
  ./docs-e2e.sh "toolbar"
  ./docs-e2e.sh "toolbar" --grep "Quick filter"
  ./docs-e2e.sh --all-browsers
  ./docs-e2e.sh --framework react
  ./docs-e2e.sh --url https://localhost:4610
  ./docs-e2e.sh --headed
  ./docs-e2e.sh --ui
EOF
}

ALL_BROWSERS=false
args=()

while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            usage
            exit 0
            ;;
        --all-browsers)
            ALL_BROWSERS=true
            shift
            ;;
        --framework=*)
            export FRAMEWORK="${1#--framework=}"
            shift
            ;;
        --framework)
            export FRAMEWORK="$2"
            shift 2
            ;;
        --url=*)
            export BASE_URL="${1#--url=}"
            shift
            ;;
        --url)
            export BASE_URL="$2"
            shift 2
            ;;
        *)
            args+=("$1")
            shift
            ;;
    esac
done

# Default to chromium unless --all-browsers or --project already specified
if [ "$ALL_BROWSERS" = false ] && [[ ! " ${args[*]+"${args[*]}"} " =~ "--project" ]]; then
    args+=("--project=chromium")
fi

cd "$SCRIPT_DIR/documentation/ag-grid-docs"

exec npx playwright test "${args[@]+"${args[@]}"}"
