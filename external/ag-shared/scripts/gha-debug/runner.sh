#!/bin/bash
set -euo pipefail

if [[ -f '.env.local' ]]; then
    source .env.local
fi

repo=${1:-""}
if [[ -z "${repo}" ]]; then
    echo "Usage: $0 <repo>"
    echo "Example: $0 ag-charts"
    exit 1
fi

if [[ "${RUNNER_TOKEN:-}" == "" ]]; then
    echo "RUNNER_TOKEN is not set. Please set it in .env.local or export it as an environment variable."
    echo "Get a new runner token from: https://github.com/ag-grid/${repo}/settings/actions/runners/new?arch=arm64&os=linux"
    exit 1
fi

scriptdir=$(dirname $0)
workdir=$(mktemp -d)
echo "Using workdir: ${workdir}"
cd ${scriptdir}

export REPO_URL="https://github.com/ag-grid/${repo}"
export RUNNER_NAME="${RUNNER_NAME:-$(hostname)}"
export LABELS="${RUNNER_LABELS:-ubuntu-debug,ubuntu-debug-${RUNNER_NAME}}"
export RUNNER_TOKEN
trap "echo 'Stopping runner...'; docker compose down" EXIT SIGINT SIGTERM
docker compose up --build -d gha-runner gha-cache
docker compose logs --follow
docker compose down
wait
