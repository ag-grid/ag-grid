---
targets: ['*']
description: 'Running and creating performance benchmarks for AG Grid'
globs: ['**/benchmark*']
---

# Benchmarks Guide

This guide covers running and creating performance benchmarks for AG Grid.

## Overview

Performance benchmarks help detect regressions and validate optimizations.

Behavioural benchmarks (Vitest) live in `testing/behavioural/` and measure specific operations.

## Running Benchmarks

Behavioural benchmarks run via `./benches.sh`, in a real headless Chromium (Playwright), so layout-dependent work is measured against a real layout engine. Run `./benches.sh --help` for the full usage — it prints vitest's `bench --help` followed by benches.sh's own options.

An agent must start it in the background, never in the foreground: a benchmark run takes minutes, and a foreground call blocks the session for all of it. Every local run prints its log path first and streams stdout+stderr there (`tmp/_bench-output/<id>/output.log`), so the numbers are readable afterwards without a redirect. Benchmark timings are also the one thing a parallel workload distorts — leave the machine alone while one runs, rather than filling the wait with other work.

```bash
# Run all behavioural benchmarks
./benches.sh

# Run specific benchmark file (positional arg forwarded to `vitest bench`)
./benches.sh "tree-data-path"

# Run a specific benchmark by name within matching files
./benches.sh "tree-data-path" -t "flattening"

# Watch mode for development
./benches.sh --watch
```

### Profiling

For method-cost analysis, `--profile` CPU-profiles each bench's measured run in Chromium (through CDP) and writes one `.cpuprofile` per bench (directory printed after the run) to open in Chrome DevTools or speedscope. Profiling distorts timing, so it is for call trees, not numbers:

```bash
./benches.sh --profile "tree-data-path"
```

### Comparing runs

`--bench-compare` forwards to `bench-compare.mjs` for baseline/compare workflows (`base`, `test`, `compare`, `all`, `backup`); everything after it is passed through verbatim:

```bash
# Base (the sibling checkout ../ag-grid2, or a path after `all`) + test paired, then compare: round 1 screens
# every bench, later rounds rerun only what it could not settle
./benches.sh --bench-compare all

# Record a baseline, then a later run, and compare them (sequential, not paired)
./benches.sh --bench-compare base
./benches.sh --bench-compare test
./benches.sh --bench-compare compare
```

`all` runs both sides at once, taking turns per bench, so machine drift lands on both sides alike: within a round the same side goes first on every bench (no side runs two benches back to back), and which side that is alternates by round. Each side's window is cut into back-to-back slices (4 for a slow bench, up to 16 for a fast one, each ending on an even call count so a bench alternating two calls has as many of each) that give the bench a within-run variance; from 8 slices up, a side's fastest and slowest slice are trimmed.

Each bench is reported as test's speed relative to base, as the likeliest of `↑` faster, `↓` slower or `~` same (a change under 2%, shown with the measurement's 95% range as `±`) — e.g. `↑ 1.20×`, `~ 1.01× ±3%` — with that likelihood as its confidence. The likelihood uses what the run's own benches show: most did not change, and how large a real change typically is, so a small wobble on a noisy bench reads as same rather than as a doubtful change. Round 1 runs every bench; up to `--runs` (default 3) rounds in all, the later ones rerun, in fresh processes, every change (it must hold in a second process pair) and every result below 95% confidence that more runs could settle or change. A slowdown gets investigated, so one must be real before it is reported: a bench at least 10% likely to be slower, or measured at least 2% and 1.5× its noise slower, takes every round left, up to two past `--runs` when that is above 1, until it is 99% sure either way. The report's Changes table lists only results at least 90% likely; a lean that did not get there is listed under "Slower, not confirmed". A lean that recurs across runs but vanishes in a `--filter`ed run of its file with more rounds comes from what ran before it in the process, not from its own code.

Between processes, most pairs agree within a few percent but some land far off, on any bench: a bench's spread in one run does not predict its spread in the next. So the noise is one mixture per machine (the typical spread, and how often and how far an outlier pair lands), learned from every bench measured in two process pairs (`process-noise.json` beside the results), and each bench's rounds are weighed by how well they agree, so one outlier round neither makes nor hides a change. Confidences are rescaled to the run's own spread across benches. The noise is fitted once the history holds 30 benches seen in two process pairs, the prior once the run itself has 30 benches, and the rescaling needs 10; below those, defaults are used. `--runs 1` is a screen only; `--all-rounds` reruns every bench, to seed the noise history. `base` and `test` run one round each, in separate sessions: the machine can shift a whole round's times by as much as 18% as it heats, which only pairing in time cancels, so with at least 10 benches their comparison takes out the run-wide median shift and states it in the report. Use `all` for a decision, and separate sessions as a screen.

## Key Performance Areas

### Grid Rendering

- Initial render time
- Virtual scrolling performance
- Row/column update speed

### Data Operations

- Sorting performance
- Filtering speed
- Grouping operations

### Memory Usage

- Memory footprint with large datasets
- Memory cleanup after destroy

## Writing Benchmarks

When creating new benchmarks:

1. Focus on realistic scenarios
2. Use consistent data sizes
3. Measure both time and memory
4. Document expected baseline values
5. Run multiple iterations for accuracy

Each bench measures for 0.5 s per side: noise between processes (~3%) dwarfs a window's own, so a longer one buys nothing. It warms up for 250 ms first, and at least 10 calls: JIT tiers up on work done, not on calls, so a fast bench needs the same warmup time as a slow one. A side collects its garbage after teardown, in its own turn, so V8's idle-time GC does not run while the other side measures. A synchronous bench call runs on a virtual clock: `setTimeout` is recorded during the call, and the timers due within the following idle gap (1 s, an action then a pause) run inside the measured time, so work the grid defers, such as destroying removed rows, is part of the call's cost rather than piling up across calls. Timers still pending after warmup run before the measured window, and those pending at the end before teardown. `Date.now()` is not virtual, so a timer that re-arms until real time has passed spins until the clock's re-arm limit throws. CSS transitions and animations are zero-length on every bench page, as a timed loop never yields the frames that would finish them. Drive a scroll gesture with `scrollStep` from `bench-utils`: its steps are one frame apart, so scroll-end and other debounced timers wait for the gesture to end. Take its positions from `sweep(i)`, which goes out and back, so every call is one step rather than one in twenty being a jump back to the start. An `async` bench keeps real timers.

When a call needs a starting state, wrap the bench fn in `untimedPrepare(prepare, measure)` rather than undoing the previous call inside the measured one: `prepare` runs before every call, on the same virtual clock but untimed, so a call measures one operation (`benchRebuild` does this for rebuilding rows from empty).

## Best Practices

1. Run benchmarks before and after changes
2. Use production builds for accurate results
3. Close other applications during benchmarking
4. Document any environmental factors
5. Track trends over time, not just absolute values
