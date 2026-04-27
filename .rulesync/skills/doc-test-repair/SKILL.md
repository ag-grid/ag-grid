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

-   CI annotations and job logs tell you _what_ failed, not _why_. They are not diagnostic input.
-   Reading `example.spec.ts` tells you what the test asserts, not why the assertion fails now.
-   Reading `main.ts` / `provided/*` tells you what the example does, not what broke.
-   `git log` on the example or the grid tells you what changed, not whether that change caused this failure.

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

### State guard

Any command that `cd`s into the worktree must first assert that state has loaded,
otherwise an empty `$WORKTREE_PATH` silently turns `cd ""` into "stay in the
main repo" — and you'll run tests against the wrong source tree without noticing.
Use this prelude:

```bash
source /tmp/ag-doc-repair-state 2>/dev/null || { echo "State file missing"; exit 1; }
[ -n "$WORKTREE_PATH" ] || { echo "WORKTREE_PATH is empty — state not loaded"; exit 1; }
[ -d "$WORKTREE_PATH" ]  || { echo "WORKTREE_PATH does not exist: $WORKTREE_PATH"; exit 1; }
cd "$WORKTREE_PATH"
```

If you ever notice a test command `cd`ing into `/Users/.../Workspace/latest`
(the main repo) instead of the worktree sibling path, the guard was skipped —
stop and investigate before proceeding.

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

Multi-line values cannot be round-tripped through a sourceable `KEY=VALUE`
state file — attempting a heredoc such as `FAILING_EXAMPLES<<EOF ... EOF`
is a no-op (bash parses it as input redirection to the nonexistent command
`FAILING_EXAMPLES`), and the inner `EOF` also terminates the outer one.
Instead, persist the list to a dedicated file (one example per line) and
record the **path** in state:

```bash
source /tmp/ag-doc-repair-state

FAILING_EXAMPLES_FILE=/tmp/ag-doc-repair-failing-examples
gh run view "$LATEST_RUN" \
  --log-failed \
  --repo ag-grid/ag-grid \
  | grep -oE '[a-z][a-z0-9-]+/_examples/[a-z][a-z0-9-]+' \
  | sed 's|/_examples/|/|' \
  | sort -u > "$FAILING_EXAMPLES_FILE"

cat "$FAILING_EXAMPLES_FILE"
echo "FAILING_EXAMPLES_FILE=${FAILING_EXAMPLES_FILE}" >> /tmp/ag-doc-repair-state
```

To iterate the list in a later phase, use a `while read` loop — it's the
only construct that's portable across every shell Claude Code might use
(`readarray`/`mapfile` are bash-4-only; macOS ships bash 3.2, and zsh
doesn't have either). Don't try to collapse the list into a single
pipe-separated pattern: nx re-shells the positional args, and `|` gets
reinterpreted as a pipeline operator, splitting your command in two.

```bash
source /tmp/ag-doc-repair-state
while IFS= read -r example; do
  [ -z "$example" ] && continue
  # ...use $example one at a time...
done < "$FAILING_EXAMPLES_FILE"
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

Create the worktree from a freshly-fetched `origin/latest` so the reproduction
matches the code CI actually tested. Passing an explicit start-point to
`git worktree add` is essential — without it, the new branch inherits from
the caller's current `HEAD`, which may be an unrelated feature branch.

```bash
source /tmp/ag-doc-repair-state

REPO_ROOT=$(git rev-parse --show-toplevel)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH="ag-doc-test-repair/${TIMESTAMP}"
WORKTREE_PATH="${REPO_ROOT}/../ag-grid-doc-test-repair-${TIMESTAMP}"

git -C "$REPO_ROOT" fetch origin latest
git -C "$REPO_ROOT" worktree add "$WORKTREE_PATH" -b "$BRANCH" origin/latest
echo "Worktree: $WORKTREE_PATH  Branch: $BRANCH (from origin/latest)"

# Sanity-check: the new branch's tip must match origin/latest.
BASE_SHA=$(git -C "$REPO_ROOT" rev-parse origin/latest)
TIP_SHA=$(git -C "$WORKTREE_PATH" rev-parse HEAD)
[ "$BASE_SHA" = "$TIP_SHA" ] || { echo "Worktree not rooted at origin/latest"; exit 1; }

echo "REPO_ROOT=${REPO_ROOT}" >> /tmp/ag-doc-repair-state
echo "WORKTREE_PATH=${WORKTREE_PATH}" >> /tmp/ag-doc-repair-state
echo "BRANCH=${BRANCH}" >> /tmp/ag-doc-repair-state
```

Symlink every `node_modules` from the main checkout so no reinstall is needed.
**A top-level symlink alone is not enough** — yarn workspaces hoist most
dependencies to the root but leave package-specific ones in nested
`packages/*/node_modules` and `community-modules/*/node_modules`. If those
aren't linked, the dev server fails with errors like
`Cannot find package @vue/tsconfig/tsconfig.dom.json`. Walk every
`node_modules` outside of itself and link each in place:

```bash
source /tmp/ag-doc-repair-state

# Link .yarn once (cheap, might not exist).
[ -d "${REPO_ROOT}/.yarn" ] && ln -s "${REPO_ROOT}/.yarn" "${WORKTREE_PATH}/.yarn"

# Link every node_modules directory, skipping nested ones (find prunes).
while IFS= read -r dir; do
  rel="${dir#${REPO_ROOT}/}"
  link="${WORKTREE_PATH}/${rel}"
  mkdir -p "$(dirname "$link")"
  ln -s "$dir" "$link"
done < <(find "$REPO_ROOT" -name node_modules -type d -prune)

# Sanity-check one nested dep the dev server needs.
test -e "${WORKTREE_PATH}/packages/ag-grid-vue3/node_modules/@vue/tsconfig/tsconfig.dom.json" \
  || { echo "nested node_modules link missing"; exit 1; }
```

`find -prune` stops descending once it finds a `node_modules`, so nested
`node_modules/*/node_modules` are skipped (they live under their parent link).

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

Start the dev server from the worktree. The `dev` target in
`documentation/ag-grid-docs/project.json` runs `astro dev --port=${PORT} --host`,
so exporting `PORT=$FREE_PORT` is sufficient — the shell substitutes it into the
command before astro sees it. Do **not** append `--port=` to `yarn nx dev`;
nx will forward it as an unknown flag.

Run the server in its own process group via `setsid` so the cleanup step can
kill the whole tree (nx, vite, astro children) rather than just the parent
yarn process:

```bash
source /tmp/ag-doc-repair-state 2>/dev/null || { echo "State file missing"; exit 1; }
[ -n "$WORKTREE_PATH" ] || { echo "WORKTREE_PATH is empty"; exit 1; }
DEV_LOG=$(mktemp -t dev-server-XXXXXX.log)
echo "DEV_LOG=${DEV_LOG}" >> /tmp/ag-doc-repair-state

cd "$WORKTREE_PATH"
# setsid gives the server its own process group so `kill -- -$PGID` can tear it
# down along with all children. macOS does not ship setsid — fall back to plain &.
if command -v setsid > /dev/null 2>&1; then
  setsid bash -c "NX_DAEMON=false PORT=$FREE_PORT yarn nx dev > \"$DEV_LOG\" 2>&1" &
else
  NX_DAEMON=false PORT="$FREE_PORT" yarn nx dev > "$DEV_LOG" 2>&1 &
fi
DEV_SERVER_PID=$!
DEV_SERVER_PGID=$(ps -o pgid= -p "$DEV_SERVER_PID" | tr -d ' ')
echo "DEV_SERVER_PID=${DEV_SERVER_PID}"   >> /tmp/ag-doc-repair-state
echo "DEV_SERVER_PGID=${DEV_SERVER_PGID}" >> /tmp/ag-doc-repair-state
echo "Dev server PID: $DEV_SERVER_PID  PGID: $DEV_SERVER_PGID  port: $FREE_PORT  log: $DEV_LOG"
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
    # Kill the whole process group if we have one (matches Phase 7 cleanup),
    # so nx/vite/astro children don't get orphaned on this exit path.
    if [ -n "${DEV_SERVER_PGID:-}" ]; then
      kill -TERM -- "-${DEV_SERVER_PGID}" 2>/dev/null
      sleep 2
      kill -KILL -- "-${DEV_SERVER_PGID}" 2>/dev/null
    else
      kill "$DEV_SERVER_PID" 2>/dev/null
    fi
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

-   Worktree exists at `$WORKTREE_PATH` and is on the repair branch.
-   Dev server is reachable on `https://localhost:${FREE_PORT}/` (curl returns).
-   State file has `WORKTREE_PATH`, `FREE_PORT`, `DEV_SERVER_PID`, `FAILING_EXAMPLES_FILE`, and the failing-examples file exists.
-   Nothing is listening on port 4610 (or you've confirmed it's a different dev server you don't care about).

---

## Phase 4: Reproduce Failures Locally

Run the failing tests against the local dev server to capture the Playwright
error output — the only diagnostic signal you're allowed to act on (see
"Required diagnostic signal" at the top of this skill).

### Playwright positional-arg format

The final positional argument to `playwright test` is a **file-path regex**,
not a test-name pattern. Example paths are stored in state as
`toolbar/grid-options`, but the actual spec file lives at
`.../toolbar/_examples/grid-options/example.spec.ts`. So the argument must
match the `/_examples/` segment:

| Stored path                              | Playwright arg                                     |
| ---------------------------------------- | -------------------------------------------------- |
| `toolbar/grid-options`                   | `toolbar/_examples/grid-options`                   |
| `aggregation-columns/enable-aggregation` | `aggregation-columns/_examples/enable-aggregation` |

Do not try to batch examples with a `|`-separated alternation; nx re-shells
the positional args and the pipe gets interpreted as a shell pipeline,
truncating the command. Run one example per invocation.

### Run each failing example

```bash
source /tmp/ag-doc-repair-state 2>/dev/null || { echo "State file missing"; exit 1; }
[ -n "$WORKTREE_PATH" ] || { echo "WORKTREE_PATH is empty"; exit 1; }
[ -d "$WORKTREE_PATH" ] || { echo "WORKTREE_PATH does not exist"; exit 1; }

REPRODUCED_FILE=/tmp/ag-doc-repair-reproduced
NOT_REPRODUCED_FILE=/tmp/ag-doc-repair-not-reproduced
: > "$REPRODUCED_FILE"
: > "$NOT_REPRODUCED_FILE"

cd "$WORKTREE_PATH"
while IFS= read -r example; do
  [ -z "$example" ] && continue
  # toolbar/grid-options -> toolbar/_examples/grid-options
  spec_arg="${example%/*}/_examples/${example##*/}"
  echo "=== $example  (arg: $spec_arg) ==="
  if BASE_URL="https://localhost:${FREE_PORT}" NX_DAEMON=false \
       yarn nx run ag-grid-docs:test:interactive:chromium -- "$spec_arg"; then
    echo "$example" >> "$NOT_REPRODUCED_FILE"
  else
    echo "$example" >> "$REPRODUCED_FILE"
  fi
done < "$FAILING_EXAMPLES_FILE"

echo "REPRODUCED_FILE=${REPRODUCED_FILE}" >> /tmp/ag-doc-repair-state
echo "NOT_REPRODUCED_FILE=${NOT_REPRODUCED_FILE}" >> /tmp/ag-doc-repair-state

echo "--- Reproduced locally ($(wc -l < "$REPRODUCED_FILE")) ---"
cat "$REPRODUCED_FILE"
echo "--- Did not reproduce ($(wc -l < "$NOT_REPRODUCED_FILE")) ---"
cat "$NOT_REPRODUCED_FILE"
```

To target a specific framework, re-run one example with `FRAMEWORK=` set
(useful for Safari/Firefox-only CI failures):

```bash
source /tmp/ag-doc-repair-state
cd "$WORKTREE_PATH"
BASE_URL="https://localhost:${FREE_PORT}" FRAMEWORK=angular NX_DAEMON=false \
  yarn nx run ag-grid-docs:test:interactive:chromium -- "row-pagination/_examples/client-paging"
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

The loop above already wrote `/tmp/ag-doc-repair-reproduced` and
`/tmp/ag-doc-repair-not-reproduced`. Those files are the source of truth for
the rest of the workflow — don't re-record the buckets in the state file.

Report a short summary to the user: how many failures reproduced, how many
did not, and your best guess at why (flake / already-fixed / framework-specific)
for each that did not. Wait for the user to confirm the plan before moving to
Phase 5. If _no_ failures reproduce, stop and hand back to the user — there is
nothing to fix.

---

## Phase 5: Diagnose and Fix

Only work on examples listed in `$REPRODUCED_FILE` from Phase 4, and only
once you have the local Playwright error output for that example in your
context (see "Required diagnostic signal" at the top). Examples in
`$NOT_REPRODUCED_FILE` are off-limits — leave them for the user.

Work through the reproduced failures one at a time. For each failure:

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

Re-run the set of examples that reproduced locally in Phase 4 (one at a time
— see Phase 4 for why batching with `|` doesn't work). Passing the
previously-reproduced examples is the bar for finishing; the never-reproduced
ones were deliberately not touched.

```bash
source /tmp/ag-doc-repair-state 2>/dev/null || { echo "State file missing"; exit 1; }
[ -n "$WORKTREE_PATH" ] || { echo "WORKTREE_PATH is empty"; exit 1; }

cd "$WORKTREE_PATH"
FAIL_COUNT=0
while IFS= read -r example; do
  [ -z "$example" ] && continue
  spec_arg="${example%/*}/_examples/${example##*/}"
  echo "=== verify $example ==="
  if ! BASE_URL="https://localhost:${FREE_PORT}" NX_DAEMON=false \
         yarn nx run ag-grid-docs:test:interactive:chromium -- "$spec_arg"; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "STILL FAILING: $example"
  fi
done < "$REPRODUCED_FILE"

[ "$FAIL_COUNT" -eq 0 ] || { echo "$FAIL_COUNT examples still failing"; exit 1; }
echo "All previously-reproduced examples now pass."
```

If any still fail, repeat Phase 5 for those.

When all pass, commit:

```bash
source /tmp/ag-doc-repair-state 2>/dev/null || { echo "State file missing"; exit 1; }
[ -n "$WORKTREE_PATH" ] || { echo "WORKTREE_PATH is empty"; exit 1; }
cd "$WORKTREE_PATH"
git add documentation/
git commit -m "$(cat <<'MSG'
fix(docs): repair failing doc-test examples
MSG
)"
```

---

## Phase 7: Mandatory cleanup

Run this step **every time the skill ends**, whether fixes succeeded, partially
succeeded, or you're bailing out. A left-behind dev server will clash with
`yarn nx dev` on the next run and leak resources. Do not declare the skill
finished until the "survivors" check below prints nothing.

### Stop the dev server and all its children

```bash
source /tmp/ag-doc-repair-state 2>/dev/null
if [ -n "${DEV_SERVER_PGID:-}" ]; then
  # Negative PID targets the whole process group (nx, vite, astro, node children).
  kill -TERM -- "-${DEV_SERVER_PGID}" 2>/dev/null
  sleep 2
  kill -KILL -- "-${DEV_SERVER_PGID}" 2>/dev/null
  echo "Sent TERM/KILL to process group ${DEV_SERVER_PGID}."
elif [ -n "${DEV_SERVER_PID:-}" ]; then
  # Fallback: no PGID recorded (setsid unavailable). Kill parent; children may linger.
  kill -TERM "$DEV_SERVER_PID" 2>/dev/null
  sleep 2
  kill -KILL "$DEV_SERVER_PID" 2>/dev/null
  echo "Sent TERM/KILL to PID ${DEV_SERVER_PID} (no PGID — children may linger)."
fi
```

### Survivors check

Confirm nothing is still listening on `$FREE_PORT` and no straggler processes
are rooted in the worktree. If anything is printed, track it down and kill it
by hand — do not move on until this is clean:

```bash
source /tmp/ag-doc-repair-state 2>/dev/null
if [ -n "${FREE_PORT:-}" ]; then
  echo "Listening on ${FREE_PORT}:"
  lsof -i ":${FREE_PORT}" 2>/dev/null | tail -n +1 || echo "(none — good)"
fi
if [ -n "${WORKTREE_PATH:-}" ]; then
  echo "Processes with cwd inside worktree:"
  pgrep -af "$WORKTREE_PATH" || echo "(none — good)"
fi
```

### Remove the worktree (optional — only once the fix is merged)

Do not remove the worktree while the fix branch is still under review.
Skip this block until the PR has merged; the branch metadata is the only way
to reconstruct what was done if something needs revisiting.

```bash
source /tmp/ag-doc-repair-state
git worktree remove "$WORKTREE_PATH"
git branch -d "$BRANCH"
rm -f /tmp/ag-doc-repair-state
```
