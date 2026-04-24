---
targets: ['*']
name: doc-test-repair
description: 'Diagnose and fix overnight doc-test failures from GitHub CI. Fetches the latest scheduled run of doc-tests.yml on the latest branch, extracts failing examples from the job logs, creates an isolated git worktree on a new branch, starts a dev server on a free port (avoiding conflicts), reproduces failures locally to get full error output, and iterates on code fixes until all pass. Use this skill whenever the user mentions doc-test failures, overnight CI failures, failing documentation examples, broken e2e example tests, or wants to investigate or repair doc-tests.yml results. ALWAYS use this skill — do not attempt the workflow manually.'
---

# Doc-Test Repair

This skill fetches overnight CI failures from `doc-tests.yml` by reading job logs,
creates an isolated worktree, starts a dev server on a conflict-free port, reproduces
failures locally to get full Playwright error output, and iterates fixes until all pass.

## Important: persisting state across shell commands

Shell variables do not survive between separate Bash tool calls. All setup state
(worktree path, port, failing examples, PID) must be written to a state file and
read back at the start of every subsequent command:

```bash
# Write state
STATE_FILE="/tmp/ag-doc-repair-state"
echo "FREE_PORT=${FREE_PORT}" >> "$STATE_FILE"
echo "WORKTREE_PATH=${WORKTREE_PATH}" >> "$STATE_FILE"
# ...

# Read state in the next command
source /tmp/ag-doc-repair-state
```

Create the state file at the very start of Phase 1 and append to it throughout
setup. Always `source` it at the top of any command that needs these values.

---

## Phase 1: Extract Failing Examples from CI Logs

### Initialise state file and get the latest run

```bash
STATE_FILE="/tmp/ag-doc-repair-state"
rm -f "$STATE_FILE"
touch "$STATE_FILE"

LATEST_RUN=$(gh run list \
  --repo ag-grid/ag-grid \
  --workflow=doc-tests.yml \
  --branch=latest \
  --event=schedule \
  --status=completed \
  --limit=10 \
  --json databaseId,conclusion,createdAt \
  --jq '[.[] | select(.conclusion != "cancelled")] | .[0].databaseId')

echo "Latest run ID: $LATEST_RUN"
echo "LATEST_RUN=${LATEST_RUN}" >> "$STATE_FILE"

gh run view "$LATEST_RUN" --repo ag-grid/ag-grid
```

If `$LATEST_RUN` is empty, try omitting `--event=schedule` — occasionally the
event metadata is missing. If the run conclusion is `success`, report that and stop.

### Extract failing example paths from the logs

```bash
source /tmp/ag-doc-repair-state

FAILING_EXAMPLES=$(gh run view "$LATEST_RUN" \
  --log-failed \
  --repo ag-grid/ag-grid \
  | grep -oE '[a-z][a-z0-9-]+/_examples/[a-z][a-z0-9-]+' \
  | sed 's|/_examples/|/|' \
  | sort -u)

echo "$FAILING_EXAMPLES"
echo "FAILING_EXAMPLES<<EOF" >> /tmp/ag-doc-repair-state
echo "$FAILING_EXAMPLES" >> /tmp/ag-doc-repair-state
echo "EOF" >> /tmp/ag-doc-repair-state
```

This extracts paths of the form `row-pagination/client-paging` directly from
Playwright's spec file references in the failure output.

If the grep produces no results, the log format may differ — try a broader match:

```bash
source /tmp/ag-doc-repair-state
gh run view "$LATEST_RUN" --log-failed --repo ag-grid/ag-grid \
  | grep -E 'FAIL|✘|failed' \
  | head -50
```

Use that output to identify the pattern and adjust the extraction accordingly.

If there are no failures, report to the user and stop.

---

## Phase 2: Create an Isolated Worktree

```bash
source /tmp/ag-doc-repair-state

REPO_ROOT=$(git rev-parse --show-toplevel)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH="ag-doc-test-repair/${TIMESTAMP}"
WORKTREE_PATH="${REPO_ROOT}/../ag-grid-doc-test-repair-${TIMESTAMP}"

git worktree add "$WORKTREE_PATH" -b "$BRANCH"
echo "Worktree: $WORKTREE_PATH  Branch: $BRANCH"

echo "REPO_ROOT=${REPO_ROOT}" >> /tmp/ag-doc-repair-state
echo "WORKTREE_PATH=${WORKTREE_PATH}" >> /tmp/ag-doc-repair-state
echo "BRANCH=${BRANCH}" >> /tmp/ag-doc-repair-state
```

Symlink `node_modules` from the main checkout so no reinstall is needed:

```bash
source /tmp/ag-doc-repair-state
ln -s "${REPO_ROOT}/node_modules" "${WORKTREE_PATH}/node_modules"
[ -d "${REPO_ROOT}/.yarn" ] && ln -s "${REPO_ROOT}/.yarn" "${WORKTREE_PATH}/.yarn"
```

---

## Phase 3: Start Dev Server on a Free Port

Find a free port that is explicitly not 4610 (the default dev server port). Scanning
upward from 4700 keeps the number recognisable while guaranteeing no clash:

```bash
FREE_PORT=$(python3 -c "
import socket

def is_free(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 0)
            s.bind(('127.0.0.1', port))
            return True
        except OSError:
            return False

for port in range(4700, 4800):
    if is_free(port):
        print(port)
        break
")
echo "FREE_PORT=${FREE_PORT}"
echo "FREE_PORT=${FREE_PORT}" >> /tmp/ag-doc-repair-state
```

This range deliberately starts above 4610 so the default dev server port is
never selected even if it happens to be momentarily bindable.

Start the dev server from the worktree, passing the port through both the `PORT`
env var (read by Astro's config) and the `--port` flag (used by `project.json`):

```bash
source /tmp/ag-doc-repair-state
DEV_LOG=$(mktemp -t dev-server-XXXXXX.log)
echo "DEV_LOG=${DEV_LOG}" >> /tmp/ag-doc-repair-state

cd "$WORKTREE_PATH"
NX_DAEMON=false PORT="$FREE_PORT" yarn nx dev > "$DEV_LOG" 2>&1 &
DEV_SERVER_PID=$!
echo "DEV_SERVER_PID=${DEV_SERVER_PID}" >> /tmp/ag-doc-repair-state
echo "Dev server PID: $DEV_SERVER_PID  port: $FREE_PORT  log: $DEV_LOG"
```

Wait for it to respond on the chosen port:

```bash
source /tmp/ag-doc-repair-state
echo "Waiting for https://localhost:${FREE_PORT}/ ..."
MAX_WAIT=180
ELAPSED=0
until curl -sk "https://localhost:${FREE_PORT}/" > /dev/null 2>&1; do
  sleep 4
  ELAPSED=$((ELAPSED + 4))
  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo "ERROR: Dev server did not start in ${MAX_WAIT}s. Last log:"
    tail -30 "$DEV_LOG"
    kill "$DEV_SERVER_PID" 2>/dev/null
    exit 1
  fi
done
echo "Dev server ready on port $FREE_PORT (${ELAPSED}s)."
```

Verify the server is on the expected port and not 4610:

```bash
source /tmp/ag-doc-repair-state
lsof -i ":${FREE_PORT}" | head -5
echo "Confirm nothing on 4610:"
lsof -i :4610 | head -3 || echo "(nothing on 4610 — good)"
```

> The server becoming reachable does not mean all pages are compiled. Allow a
> further 30–60 seconds or watch `$DEV_LOG` for the build-complete message
> before running tests, to avoid stale-page false failures.

---

## Phase 4: Reproduce Failures Locally

Run the failing tests against the local dev server to get full Playwright error output.
This is the primary source of diagnostic information — the CI log only tells you
*what* failed; the local run tells you *why*.

```bash
source /tmp/ag-doc-repair-state
GREP_PATTERN=$(echo "$FAILING_EXAMPLES" | paste -sd '|' -)
echo "Running pattern: $GREP_PATTERN"
echo "Against: https://localhost:${FREE_PORT}"

cd "$WORKTREE_PATH"
BASE_URL="https://localhost:${FREE_PORT}" NX_DAEMON=false \
  yarn nx run ag-grid-docs:test:interactive:chromium -- "$GREP_PATTERN"
```

To run a single example in isolation:

```bash
source /tmp/ag-doc-repair-state
cd "$WORKTREE_PATH"
BASE_URL="https://localhost:${FREE_PORT}" NX_DAEMON=false \
  yarn nx run ag-grid-docs:test:interactive:chromium -- "row-pagination/client-paging"
```

To target a specific framework:

```bash
source /tmp/ag-doc-repair-state
cd "$WORKTREE_PATH"
BASE_URL="https://localhost:${FREE_PORT}" FRAMEWORK=angular NX_DAEMON=false \
  yarn nx run ag-grid-docs:test:interactive:chromium -- "row-pagination/client-paging"
```

If a test passes locally that failed in CI, it may be a flaky timing issue
(retry a couple of times), a regression already fixed on `latest` after the CI
run, or a browser-specific failure (Safari/Firefox). Check which framework job
the CI failure came from.

---

## Phase 5: Diagnose and Fix

Work through failures one example at a time. For each failure:

1. Read the Playwright error — it includes the failing assertion, the test URL,
   and a stack trace pointing to the spec file line.
2. The example source lives at:
   ```
   documentation/ag-grid-docs/src/content/docs/<page>/_examples/<example>/
   ├── example.spec.ts     ← test assertions
   ├── main.ts             ← vanilla JS implementation
   ├── provided/angular/
   ├── provided/react/
   └── provided/vue3/
   ```
3. Make the fix in the **worktree** files (at `$WORKTREE_PATH/documentation/...`).
4. Re-run that single example to confirm it passes before moving on.

### Common failure patterns

**Renamed grid API method or ColDef property:**
```bash
grep -r "oldName\|newName" packages/ag-grid-community/src/ --include="*.ts" -l
```
Update all affected files under `_examples/` (main.ts and provided/ variants).

**Locator broken (test ID or CSS class changed):**
Check the `agIdFor.*` usage in the spec and verify the grid still emits those IDs.

**Grid not rendering (timeout on `waitForGridContent`):**
Open the example URL directly in a browser and check the console:
`https://localhost:<FREE_PORT>/examples/<page>/<example>/vanilla?enableTestIds=true`

**Spec assertion no longer matches intended behaviour:**
Update `example.spec.ts` — but only when the grid behaviour change is intentional,
not a regression.

---

## Phase 6: Verify All Fixes and Commit

Re-run the full set of previously-failing examples to confirm everything passes:

```bash
source /tmp/ag-doc-repair-state
GREP_PATTERN=$(echo "$FAILING_EXAMPLES" | paste -sd '|' -)
cd "$WORKTREE_PATH"
BASE_URL="https://localhost:${FREE_PORT}" NX_DAEMON=false \
  yarn nx run ag-grid-docs:test:interactive:chromium -- "$GREP_PATTERN"
```

If any still fail, repeat Phase 5 for those.

When all pass, commit:

```bash
source /tmp/ag-doc-repair-state
cd "$WORKTREE_PATH"
git add documentation/
git commit -m "$(cat <<'MSG'
fix(docs): repair failing doc-test examples
MSG
)"
```

Stop the dev server:

```bash
source /tmp/ag-doc-repair-state
kill "$DEV_SERVER_PID" 2>/dev/null
echo "Dev server stopped."
```

---

## Cleanup (after PR is merged)

```bash
source /tmp/ag-doc-repair-state
git worktree remove "$WORKTREE_PATH"
git branch -d "$BRANCH"
rm -f /tmp/ag-doc-repair-state
```
