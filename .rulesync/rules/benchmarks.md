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

```bash
# Run behavioural benchmarks
yarn nx benchmark ag-behavioural-testing

# Run specific benchmark file
yarn nx benchmark ag-behavioural-testing -- src/tree-data/datapath/benchmarks/tree-data-path.bench.ts

# Watch mode for development
yarn nx benchmark ag-behavioural-testing --configuration=watch

# Update benchmark baselines
yarn nx benchmark ag-behavioural-testing --configuration=update
```

## Key Performance Areas

### Grid Rendering

-   Initial render time
-   Virtual scrolling performance
-   Row/column update speed

### Data Operations

-   Sorting performance
-   Filtering speed
-   Grouping operations

### Memory Usage

-   Memory footprint with large datasets
-   Memory cleanup after destroy

## Writing Benchmarks

When creating new benchmarks:

1. Focus on realistic scenarios
2. Use consistent data sizes
3. Measure both time and memory
4. Document expected baseline values
5. Run multiple iterations for accuracy

## Debugging Performance

For watch mode during development:

```bash
yarn nx benchmark ag-behavioural-testing --configuration=watch
```

## Best Practices

1. Run benchmarks before and after changes
2. Use production builds for accurate results
3. Close other applications during benchmarking
4. Document any environmental factors
5. Track trends over time, not just absolute values
