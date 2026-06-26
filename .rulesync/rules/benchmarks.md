---
targets: ['*']
description: 'Running and creating performance benchmarks for AG Grid'
globs: ['testing/performance/**/*', '**/benchmark*']
---

# Benchmarks Guide

This guide covers running and creating performance benchmarks for AG Grid.

## Overview

Performance benchmarks help detect regressions and validate optimizations.

**Two types of performance testing exist in AG Grid:**

1. **Behavioural Benchmarks** (Vitest) - Located in `testing/behavioural/` - micro-benchmarks for specific operations
2. **Performance E2E Tests** (Playwright) - Located in `testing/performance/e2e/` - end-to-end performance scenarios

## Running Benchmarks

Behavioural benchmarks run via `./benches.sh`, in a real headless Chromium (Playwright) by **default** so layout-dependent work is measured against a real layout engine. Run `./benches.sh --help` for the full usage — it prints vitest's `bench --help` followed by benches.sh's own options.

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

For method-cost analysis, `--profile` runs node-only with a V8 CPU profile and writes a `.cpuprofile` (path printed after the run) to open in Chrome DevTools or speedscope:

```bash
./benches.sh --profile "tree-data-path"
```

### Comparing runs

`--bench-compare` forwards to `bench-compare.mjs` for baseline/compare workflows (`base`, `test`, `compare`, `all`, `backup`); everything after it is passed through verbatim:

```bash
# Record a baseline, then compare a later run against it
./benches.sh --bench-compare base
./benches.sh --bench-compare compare

# Baseline + test + compare in one go, averaged over 3 runs
./benches.sh --bench-compare all --runs 3
```

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

## Best Practices

1. Run benchmarks before and after changes
2. Use production builds for accurate results
3. Close other applications during benchmarking
4. Document any environmental factors
5. Track trends over time, not just absolute values
