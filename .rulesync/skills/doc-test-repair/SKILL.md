---
targets: ['*']
name: doc-test-repair
description: 'Diagnose and fix overnight doc-test failures from GitHub CI. Fetches the latest scheduled run of doc-tests.yml on the latest branch, extracts failing examples from the job logs, creates an isolated git worktree on a new branch, starts a dev server on a free port (avoiding conflicts), reproduces failures locally to get full error output, and iterates on code fixes until all pass. Use this skill whenever the user mentions doc-test failures, overnight CI failures, failing documentation examples, broken e2e example tests, or wants to investigate or repair doc-tests.yml results. ALWAYS use this skill — do not attempt the workflow manually.'
---

# Doc-Test Repair

This skill fetches overnight CI failures from `doc-tests.yml` by reading job logs,
creates an isolated worktree, starts a dev server on a conflict-free port, reproduces
failures locally to get full Playwright error output, and iterates fixes until all pass.

## Required diagnostic signal

Read this before you do anything else. It overrides the temptation to move fast.

The only acceptable input for Phase 5 (diagnosis and fixing) is the **Playwright
error output from a local test run against the worktree's dev server**. Nothing
else is a substitute:

- CI annotations and job logs tell you *what* failed, not *why*. They are not diagnostic input.
- Reading `example.spec.ts` tells you what the test asserts, not why the assertion fails now.
- Reading `main.ts` / `provided/*` tells you what the example does, not what broke.
- `git log` on the example or the grid tells you what changed, not whether that change caused this failure.

If you think you already know the cause from CI logs and source reading alone,
you are guessing. That is exactly the failure mode this skill exists to prevent:
guessed fixes edit code that wasn't broken, or miss the real cause, or "fix"
things that were already fixed on `latest`. Phases 2–4 are not optional scaffolding
— they produce the one piece of evidence you are allowed to act on.

**Do not skip to fixes.** Phases 2, 3, and 4 are mandatory before any edit to
example source. If you find yourself reading source files to form a theory
before you have local Playwright output, stop and go set up the worktree.

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

### Setup checklist

Before moving to Phase 4, confirm all of the following. If any is missing,
go back and finish Phase 2 or 3 before reading any source files:

- Worktree exists at `$WORKTREE_PATH` and is on the repair branch.
- Dev server is reachable on `https://localhost:${FREE_PORT}/` (curl returns).
- State file has `WORKTREE_PATH`, `FREE_PORT`, `DEV_SERVER_PID`, `FAILING_EXAMPLES`.
- Nothing is listening on port 4610 (or you've confirmed it's a different dev server you don't care about).

---

## Phase 4: Reproduce Failures Locally

Run the failing tests against the local dev server to get full Playwright error output.
This is the primary source of diagnostic information — the CI log only tells you
*what* failed; the local run tells you *why*.

**This phase is a gate.** Do not proceed to Phase 5 (diagnosis or fixes) for any
example until that example has been confirmed to fail locally. Fixing something
you haven't reproduced means you're guessing — and you'll waste time "fixing"
code that was never broken, or that was already fixed on `latest` since the CI run.

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

### Triage before fixing

Split the failing examples into two buckets based on the local run:

1. **Reproduced locally** — the test fails against the worktree's dev server.
   These are the only examples you should diagnose and fix in Phase 5.
2. **Did not reproduce** — the test passes locally. Do **not** edit these.
   Investigate the cause instead:
   - Re-run 2–3 times to rule out flakiness (timing, animation, network).
   - Check `git log origin/latest --since="<CI run timestamp>"` for commits
     that may have already fixed it on `latest` after the CI run.
   - Check which framework job the CI failure came from (Safari/Firefox
     failures won't reproduce under the default chromium run — re-run with
     `FRAMEWORK=…` or the matching browser project).

Record both buckets in the state file and report them to the user before
starting any fixes:

```bash
source /tmp/ag-doc-repair-state
echo "REPRODUCED<<EOF" >> /tmp/ag-doc-repair-state
echo "<paths that failed locally>" >> /tmp/ag-doc-repair-state
echo "EOF" >> /tmp/ag-doc-repair-state
echo "NOT_REPRODUCED<<EOF" >> /tmp/ag-doc-repair-state
echo "<paths that passed locally>" >> /tmp/ag-doc-repair-state
echo "EOF" >> /tmp/ag-doc-repair-state
```

Report a short summary to the user: how many failures reproduced, how many
did not, and your best guess at why (flake / already-fixed / framework-specific)
for each that did not. Wait for the user to confirm the plan before moving to
Phase 5. If *no* failures reproduce, stop and hand back to the user — there is
nothing to fix.

---

## Phase 5: Diagnose and Fix

### Precondition check

Before editing any source file in this phase, answer these questions for the
example you are about to work on. If you cannot answer yes to all three, stop
and go back to Phase 4.

1. Did I run Playwright locally against `https://localhost:${FREE_PORT}/` for this example?
2. Did it fail?
3. Do I have the Playwright error output (assertion message, stack trace, locator that failed) in my context right now?

If the answer to any of these is no — including "I read the spec and CI log
and I'm confident I know the cause" — you do not have the required input.
Go run the test locally. The only exception is examples in the **did not
reproduce** bucket from Phase 4, which you are not allowed to edit at all.

### Work loop

Only work on examples in the **reproduced locally** bucket from Phase 4.
If an example did not reproduce, do not touch its source files — write up
what you found and leave it for the user to decide.

Work through the reproduced failures one example at a time. For each failure:

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
