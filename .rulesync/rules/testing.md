---
targets: ['*']
description: 'Testing strategies, Vitest patterns, and verification for AG Grid'
globs: ['**/*.test.ts', '**/*.spec.ts', 'testing/**/*']
---

# Testing — Quick Reference

For the full guide — runner flag reference, Vitest patterns, the complete async-waiting playbook, and snapshot usage — load the `/testing` skill.

## Choosing a layer

**Default to a behavioural test.** Behavioural tests in `testing/behavioural/` are the primary suite: they drive the full grid as a black box through the public `GridApi`. A package `*.test.ts` is only for pure logic (formatter, comparator, parser) with no grid-integration surface.

**Signs you're testing internals — write a behavioural test instead:** casting to `as any` for private state, hand-building `beans`/`gos`/`ctrlsSvc`, calling a private method to reach a branch, or spying on an internal method as the assertion. Such tests pass even when the real code path never runs.

Search `testing/behavioural` for an existing harness before assuming a behaviour can't be black-box tested (e.g. `DragEventDispatcher` drives real header drags); extend the harness rather than dropping to a unit test.

## Wait, don't sleep

**Poll async grid updates with `waitFor`** (from `@testing-library/dom`). **Never** `await asyncSetTimeout(<fixed n>)` and then assert — a guessed delay is flaky and slow. A `no-restricted-syntax` ESLint rule in `testing/behavioural/eslint.config.mjs` flags every `asyncSetTimeout(n)` where `n > 0`.

```typescript
api.setGridOption('rowData', ATHLETES);
await waitFor(() => expect(panel.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES));
```

**In a React suite, flush ticks inside `act`.** `waitFor` and `userEvent` are already act-aware, but a bare `await asyncSetTimeout(0)` is not: the grid re-renders rows asynchronously, so an update scheduled by an api call lands in the *next* tick — after a synchronous `act(...)` has closed — and React reports "An update to RowComp inside a test was not wrapped in act(...)". Wrap the flush instead:

```typescript
const flush = async () => { await act(async () => { await asyncSetTimeout(0); }); };
```

`asyncSetTimeout(0)` is fine for flushing a single tick after a synchronous action. `asyncSetTimeout(1)` is the *same call* — Node clamps 0 to 1ms — so it buys nothing.

The skill covers the traps that make a `waitFor` unfalsifiable or a sleep load-bearing — negative assertions, polls that were already true, test IDs landing on a debounce, and sleeps that only look like safety margins — plus how to prove a wait is genuinely necessary. **Load it before converting any timing-dependent test.**

## Regression tests: cover every reproduction path

A bug rarely has one trigger. Enumerate the reproduction paths named in the ticket and add a test for each — a programmatic API call, a panel drag and a tool-panel drop are three tests, not one. Test the plural case, not just N=1, and assert the observable end state for every path.

**Prefer red before green: write the failing test first.** That is the default, because it forces the discriminating input to be chosen before the fix exists to bias it. The invariant it serves is weaker — see the test fail for the reason you expect, at least once — so when the fix already exists (ported, cherry-picked, or you simply wrote it first), applying the test before the patch or reverting the patch to confirm red is a legitimate route to the same place. A test that fails for the wrong reason — typo'd selector, unregistered module, a `waitFor` already true — is as uninformative as one that never fails.

Pick the input that *separates* the two behaviours. A test that passes against both the fixed and the unfixed code proves nothing, however green it is — this is the check that catches a guard which stops a crash by skipping the work the function existed to do.

**Then refactor, on green.** The third step is not optional and it is where tidying belongs: simplifying the fix, extracting a harness, merging same-setup tests, adding the `GridRows`/`GridColumns`/`FilterDom` snapshots. The test suite is what makes that safe, so it must stay green *and unchanged* throughout — if an assertion has to be edited to keep passing, that is a behaviour change wearing a refactor's clothes, and it needs its own red step.

## Commands

- `./behave.sh` — the whole unit suite (package + behavioural) as one multi-project Vitest run.
- `./benches.sh` — behavioural benchmarks in headless Chromium.
- `./docs-e2e.sh` — Playwright E2E against the docs site. The Nx target is `test:e2e`; there is **no** `e2e` target.

### Never block on a gate; read its log afterwards

**Never run `./behave.sh`, `./checks.sh`, `./benches.sh` or `./docs-e2e.sh` in the foreground** — while a Bash call is in flight the user cannot reach the agent at all. Launch with the harness's background mechanism, which delivers a completion event in a later turn, and do other work meanwhile. (`--async` detaches the script itself and reports back to the terminal it was launched from when it ends — useful to a human, useless to an agent, which cannot be woken that way.)

**Locally, never `sleep` to wait for a run — no exceptions, and no duration is the right one.** A backgrounded run wakes the agent by itself, so after starting one there are exactly two correct moves: **do other work**, or **end the turn**. Ending the turn is not giving up; it is the mechanism. One started elsewhere has `--async-status` (exit 3 = still running) and `--wait`, below. For progress mid-run, grep the log — it is written live. (This rule exists to keep an interactive session reachable, so like the foreground rule below it is local-only: under `CI` the gate runs in the foreground and there is nothing to wait on.)

**If you are typing a duration, you are guessing, and the guess is always wrong.** Too short and the call buys nothing but still has to be repeated; too long and it is killed at the harness's 2-minute cap, so it does not even finish the wait it blocked the console for.

**`sleep N; grep …` is how this gets past the rule.** As a compound it reads like *checking*, not like *waiting*, so it never trips. Any `sleep` anywhere in a command line is the violation, whatever follows the semicolon — as is a poll loop, or "just a short one to let the log settle". The three rationalisations to kill by name: *"I want to report in this turn"* (that pull is the whole cause — the user needs the console free, not the answer inside one turn), *"the notification came but the log looks stale"* (if the notification came, the run is over: re-read in a fresh call), and *"it's only a small suite"* (size judgement is what keeps failing, and backgrounding costs nothing, so there is nothing to trade).

**Never pipe a gate — not into `tail`, `head`, `grep` or anything else.** A pipeline exits with its **last** command's status, so `./behave.sh … | tail -40` reports `tail`'s `0` and a red run arrives labelled green; backgrounded, that bogus `0` is what the completion event carries, so the failure is never surfaced at all. Ask the script for less instead — these filter the console and still exit with the run's own status:

```bash
./behave.sh --quiet <path>                          # its own summary plus every failure — the usual choice
./behave.sh --log-tail 30 <path>                    # the end of the log
./behave.sh --log-grep PROBE <path>                 # an ad-hoc pattern
./behave.sh --log-grep PROBE --log-tail 5 <path>    # combined: the last 5 matches
```

**`2>&1 | tail -N` is how this rule gets broken.** It is the reflex ending for any long-running shell command, typed without a thought, so it never registers as a decision about exit status. **The tell is the `|` character, not the intent** — before running a gate, look at the line for a pipe, and if there is one, a flag above replaces it. `--log-tail 30` *is* `| tail -30`, minus the lost verdict; there is no filtering a pipe can do that the flags cannot.

**`--quiet` is the one to reach for.** Each gate declares its own `failRe`/`summaryRe`, which is what `--quiet` prints, so hand-writing `--log-grep '×|FAIL|Tests '` is a worse and vitest-only spelling of it. Keep `--log-grep` for what `--quiet` does not show: a probe's `console.log`, or vitest's `Errors  N error` line, which reports a throw from outside a test body and **still exits 0**.

**A killed run's `0` is not a pass.** `--kill` ends the run, but the completion event that follows still reports `exit code 0`. After killing, re-run — never read the dead run's status as a verdict.

**Every local run captures itself, and prints the log path as its first line** — `▶ tmp/_behave-output/<id>/output.log`, the whole of stdout and stderr with the colour codes stripped. That line is also the only proof a run happened, so treat a missing `▶` as "nothing ran". No redirect has to be arranged in advance and a red run needs no second run: grep that file, during the run or after it, or pass `--bail 1` to make the run stop at the first failure itself. Beside it sit the `command` and a `status`, plus `result.json` (vitest's machine-readable results) for `./behave.sh` only. `latest` symlinks the newest and week-old runs are pruned.

**Under `CI`, run them in the foreground instead.** Backgrounding is there to keep an interactive session reachable, and a workflow has nobody to block, so take the output directly. The scripts capture nothing under `CI` for the same reason, so there is no log to grep and none is needed.

- `--async-status [id]` — has a run finished? Exit 0 passed, 1 failed, **3 still running**. Defaults to the newest run and takes an id or any path containing one, so it also reports on a run started elsewhere.
- `--wait <id|latest> [secs]` — the same report, waiting up to `secs` for the run to finish.
- `--kill [id]` — stop a run (the newest by default) and every process it spawned.
- `--quiet` — console gets the paths, summary and failures only (not `./checks.sh`, which is quiet already); it hides a test's own `console.log`, so read the log when probing. `--no-log` turns capture off.
- `--log-tail <n>` / `--log-grep <pattern>` — print only part of the log when the run ends, instead of piping. Both imply `--quiet`, combine with each other, and leave the exit status the run's. `--log-grep` takes a regex, falling back to a substring if it will not compile.

**Run with `--bail 1` by habit.** `./behave.sh --bail 1 <path>` stops at the first failing test — what you want in a fix-one-error-at-a-time loop, and it skips the rest of the reporting too. `--no-diff` reports names and messages with no diffs, for when a suite fails wholesale. A red run can take minutes where the green one takes seconds: vitest's diff serialisation of grid objects is effectively unbounded. The skill explains why, plus the `--stack-trace-len` trap and how `--bail` reads in a JSON report.

`./behave.sh --slowest N` reports what a run spent its time on (default 5; `AG_SLOWEST_TESTS`, 0 to silence). Three tables plus a line:

- **Slowest tests** and **slowest test files**, each below a floor in `timings.ts`, so a healthy run prints nothing. Read a file by its per-test rate, not its total.
- **Idle** — files ranked by the off-CPU milliseconds themselves, listed above 1s (`AG_WAITING_MIN_MS`). Usually a fixed timer the test out-waited, so usually time a fix gives back — but `eventLoopUtilization` counts every event-loop wait, so worker↔main RPC and inline-snapshot writes land here too and a snapshot-heavy file can rank high with no timer to remove. The ranking is absolute rather than a share of the file, because 3s inside a 10s file is still 3s.
- **Worker time** — the run's total worker-seconds, the parallel factor against wall clock, and the split between `load` (importing the grid plus building a happy-dom) and `tests`. Load is a per-file constant and flat across them, so it is a budget line rather than a table: it is what makes an extra file cost something, and once the parallel factor sits at core count, wall time only falls by spending fewer worker-seconds. Read the current figure off the run rather than from here — it is actively being optimised, so any number written down is stale.

All four take `--help` and resolve only from the repo root — from elsewhere call them by path (`../../behave.sh`), not via `cd "$(git rev-parse --show-toplevel)" &&`, which agent harnesses gate on. `./behave.sh` does not type-check; run `yarn nx run ag-behavioural-testing:build:test` before committing. Some suites take minutes — allow a five-minute timeout and collect the exit status rather than treating silence as success.

## Speed

**A test should take well under 4 seconds.** The suite mean is ~70ms, so 4s already means something is wrong. A slower one is reported as a warning and a much slower one fails outright; both thresholds live in `testing/shared/vitest/timings.ts`, and are looser in CI.

**Never pass a timeout to `test()`.** It does not raise the limit — `testing/shared/vitest/output.setup.ts` fails on measured duration, so an override only lets a slow test run to completion and then fail anyway. It hid a 147s test for months. If a test needs more time, the time is the bug.

**A slow test is almost never doing work; it is waiting.** Check CPU before optimising anything: a run at 30% CPU is sleeping, usually on a fixed timer the test could avoid rather than out-wait. Watch for a product timeout that only fires because happy-dom has no layout and no CSS transitions, and for polling on a state the code reaches a second later than the one you can already assert.

**A hard-coded grid delay can be collapsed for this suite: `FAST_TEST_TIMINGS`.** `packages/ag-stack/src/fastTestTimings.ts` exports a single `false`; `testing/behavioural/vitest.config.ts` aliases that module to a `true` copy, so only behavioural tests are affected — E2E, the docs site and every published bundle read `false`. Each read stays a ternary in the shipped bundle rather than folding, because `ag-stack` is a separate package the grid imports — cheap, but not free, so spend it only where the delay costs the suite real time. Branch where the delay is a constant: `const MIN_TOOLTIP_DELAY = FAST_TEST_TIMINGS ? 0 : 200`. Two rules: a delay a test can set through a **grid option does not go behind the flag** (set the option), and lifting a floor achieves nothing until the test also asks for the small value. Suites that assert the timing itself keep the real values — they are why the constant still has to work.

**Read a slow file by its per-test rate, not its total** — `--slowest` prints both. A high total with a normal rate is volume, and there is nothing to reclaim without deleting coverage. A high *rate* is a defect worth chasing.

**Split a file whose tests are individually fast but numerous.** Vitest parallelises across files, not within one, so a long matrix serialises in a single worker. Split it into sibling suites sharing a harness module — one of the few cases that outweighs the preference for extending an existing suite. Prefer `test.each` over one test looping the matrix, so a failure names the case rather than only the file.

## Key practices

- Prefer `GridRows` / `GridColumns` inline snapshots over raw API assertions where practical; update with `./behave.sh --update-grid-rows`.
- Repetition is fine in tests — prefer inline setup over shared factories. Do not flag duplicated test *setup* in review; **do** flag duplicated test *cases*.
- **Register the module before using a grid API.** Tests build their own module lists, so an unregistered API logs `error #200` and **no-ops silently**. A passing test prints no `error #200`.
