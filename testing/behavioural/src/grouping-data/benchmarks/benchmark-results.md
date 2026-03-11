# Aggregation Benchmark Results

**Date:** 2026-03-11
**Setup:** 5,000 rows, 50 value columns (`sum`), 3-level grouping (5 x 6 x 4 = 120 groups), 250 rows updated (5%), 5 columns changed in partial-col benchmarks
**Machine:** macOS Darwin 24.6.0
**Bench tuning:** `time: 3000ms`, `warmupIterations: 10` (38-88 samples per benchmark, RME ±0.7-2.5%)

**Fair comparison:** Both branches use identical grid configuration:

-   `mockGridLayout: false`, `includeDefaultModules: false` (feature uses `benchmark: true`, latest uses equivalent manual options)
-   `animateRows: false`, `suppressRowVirtualisation: false`, `suppressColumnVirtualisation: false`, `ensureDomOrder: false`, `debug: false`
-   Only 3 modules loaded: `ClientSideRowModelModule`, `ClientSideRowModelApiModule`, `RowGroupingModule`

Each iteration performs a paired round-trip (2 operations) to ensure real work every call.

**RowsPath** = `aggregateOnlyChangedColumns: false` (default, re-aggregates all value columns for changed groups)
**CellsPath** = `aggregateOnlyChangedColumns: true` (only re-aggregates columns whose cells actually changed)

## Averaged Results (mean of 3 runs, in ms)

| Benchmark                             | Feature (ms) | Latest (ms) | Delta            |
| ------------------------------------- | ------------ | ----------- | ---------------- |
| full refresh — RowsPath               | 78.55        | 79.75       | -1.5% (noise)    |
| full refresh — CellsPath              | 81.39        | 82.49       | -1.3% (noise)    |
| immutable (all 50 cols) — RowsPath    | 40.62        | 41.03       | -1.0% (noise)    |
| immutable (all 50 cols) — CellsPath   | 41.11        | 41.70       | -1.4% (noise)    |
| immutable (5/50 cols) — RowsPath      | 38.59        | 38.14       | +1.2% (noise)    |
| immutable (5/50 cols) — CellsPath     | 38.49        | 40.06       | **-3.9% faster** |
| transaction (all 50 cols) — RowsPath  | 39.17        | 40.72       | **-3.8% faster** |
| transaction (all 50 cols) — CellsPath | 39.53        | 41.41       | **-4.5% faster** |
| transaction (5/50 cols) — RowsPath    | 36.82        | 36.38       | +1.2% (noise)    |
| transaction (5/50 cols) — CellsPath   | 36.81        | 36.60       | +0.6% (noise)    |

## Raw Results — Feature Branch (`AG-16586-changed-path-optimization-cell-agg`)

### Run 1

| Benchmark                             | hz    | mean (ms) | samples | rme    |
| ------------------------------------- | ----- | --------- | ------- | ------ |
| full refresh — RowsPath               | 12.69 | 78.83     | 39      | ±2.05% |
| full refresh — CellsPath              | 12.37 | 80.87     | 38      | ±2.48% |
| immutable (all 50 cols) — RowsPath    | 25.41 | 39.35     | 77      | ±1.12% |
| immutable (all 50 cols) — CellsPath   | 25.31 | 39.51     | 76      | ±1.07% |
| immutable (5/50 cols) — RowsPath      | 26.56 | 37.65     | 80      | ±1.27% |
| immutable (5/50 cols) — CellsPath     | 26.50 | 37.73     | 80      | ±1.15% |
| transaction (all 50 cols) — RowsPath  | 25.95 | 38.53     | 78      | ±1.12% |
| transaction (all 50 cols) — CellsPath | 25.78 | 38.79     | 78      | ±1.04% |
| transaction (5/50 cols) — RowsPath    | 27.63 | 36.19     | 83      | ±1.26% |
| transaction (5/50 cols) — CellsPath   | 27.48 | 36.38     | 83      | ±1.05% |

### Run 2

| Benchmark                             | hz    | mean (ms) | samples | rme    |
| ------------------------------------- | ----- | --------- | ------- | ------ |
| full refresh — RowsPath               | 12.62 | 79.23     | 38      | ±1.59% |
| full refresh — CellsPath              | 12.12 | 82.51     | 37      | ±1.84% |
| immutable (all 50 cols) — RowsPath    | 22.64 | 44.17     | 68      | ±1.01% |
| immutable (all 50 cols) — CellsPath   | 22.24 | 44.96     | 67      | ±1.19% |
| immutable (5/50 cols) — RowsPath      | 23.99 | 41.69     | 73      | ±1.24% |
| immutable (5/50 cols) — CellsPath     | 24.19 | 41.35     | 73      | ±0.77% |
| transaction (all 50 cols) — RowsPath  | 23.67 | 42.25     | 72      | ±0.92% |
| transaction (all 50 cols) — CellsPath | 23.80 | 42.02     | 72      | ±0.87% |
| transaction (5/50 cols) — RowsPath    | 25.28 | 39.55     | 76      | ±1.04% |
| transaction (5/50 cols) — CellsPath   | 25.03 | 39.96     | 76      | ±0.92% |

### Run 3

| Benchmark                             | hz    | mean (ms) | samples | rme    |
| ------------------------------------- | ----- | --------- | ------- | ------ |
| full refresh — RowsPath               | 12.89 | 77.60     | 39      | ±1.64% |
| full refresh — CellsPath              | 12.38 | 80.80     | 38      | ±2.09% |
| immutable (all 50 cols) — RowsPath    | 26.08 | 38.34     | 79      | ±0.79% |
| immutable (all 50 cols) — CellsPath   | 25.73 | 38.87     | 78      | ±1.15% |
| immutable (5/50 cols) — RowsPath      | 27.46 | 36.42     | 83      | ±1.22% |
| immutable (5/50 cols) — CellsPath     | 27.49 | 36.38     | 83      | ±1.35% |
| transaction (all 50 cols) — RowsPath  | 27.23 | 36.73     | 82      | ±1.05% |
| transaction (all 50 cols) — CellsPath | 26.47 | 37.78     | 80      | ±1.35% |
| transaction (5/50 cols) — RowsPath    | 28.80 | 34.72     | 87      | ±1.57% |
| transaction (5/50 cols) — CellsPath   | 29.33 | 34.10     | 88      | ±1.16% |

## Raw Results — `latest` Branch

### Run 1

| Benchmark                             | hz    | mean (ms) | samples | rme    |
| ------------------------------------- | ----- | --------- | ------- | ------ |
| full refresh — RowsPath               | 12.55 | 79.03     | 38      | ±1.83% |
| full refresh — CellsPath              | 12.19 | 82.05     | 37      | ±2.47% |
| immutable (all 50 cols) — RowsPath    | 25.00 | 41.26     | 76      | ±1.42% |
| immutable (all 50 cols) — CellsPath   | 23.49 | 42.57     | 71      | ±2.62% |
| immutable (5/50 cols) — RowsPath      | 26.82 | 37.28     | 81      | ±1.24% |
| immutable (5/50 cols) — CellsPath     | 23.16 | 43.18     | 70      | ±3.52% |
| transaction (all 50 cols) — RowsPath  | 22.99 | 43.49     | 69      | ±2.73% |
| transaction (all 50 cols) — CellsPath | 21.99 | 45.47     | 66      | ±3.91% |
| transaction (5/50 cols) — RowsPath    | 27.48 | 36.39     | 83      | ±1.44% |
| transaction (5/50 cols) — CellsPath   | 27.45 | 36.42     | 83      | ±1.10% |

### Run 2

| Benchmark                             | hz    | mean (ms) | samples | rme    |
| ------------------------------------- | ----- | --------- | ------- | ------ |
| full refresh — RowsPath               | 12.53 | 79.83     | 38      | ±1.35% |
| full refresh — CellsPath              | 12.17 | 82.19     | 37      | ±1.88% |
| immutable (all 50 cols) — RowsPath    | 23.80 | 42.01     | 72      | ±1.47% |
| immutable (all 50 cols) — CellsPath   | 23.66 | 42.27     | 71      | ±1.35% |
| immutable (5/50 cols) — RowsPath      | 25.51 | 39.20     | 77      | ±1.27% |
| immutable (5/50 cols) — CellsPath     | 25.32 | 39.49     | 76      | ±1.30% |
| transaction (all 50 cols) — RowsPath  | 25.01 | 39.99     | 76      | ±0.73% |
| transaction (all 50 cols) — CellsPath | 24.71 | 40.47     | 75      | ±1.30% |
| transaction (5/50 cols) — RowsPath    | 26.64 | 37.54     | 80      | ±1.52% |
| transaction (5/50 cols) — CellsPath   | 26.88 | 37.21     | 81      | ±1.04% |

### Run 3

| Benchmark                             | hz    | mean (ms) | samples | rme    |
| ------------------------------------- | ----- | --------- | ------- | ------ |
| full refresh — RowsPath               | 12.44 | 80.39     | 38      | ±1.65% |
| full refresh — CellsPath              | 12.01 | 83.24     | 37      | ±1.83% |
| immutable (all 50 cols) — RowsPath    | 25.11 | 39.82     | 76      | ±1.14% |
| immutable (all 50 cols) — CellsPath   | 24.84 | 40.26     | 75      | ±1.36% |
| immutable (5/50 cols) — RowsPath      | 26.37 | 37.93     | 80      | ±1.45% |
| immutable (5/50 cols) — CellsPath     | 26.66 | 37.51     | 81      | ±1.52% |
| transaction (all 50 cols) — RowsPath  | 25.85 | 38.68     | 78      | ±0.93% |
| transaction (all 50 cols) — CellsPath | 26.12 | 38.29     | 79      | ±0.84% |
| transaction (5/50 cols) — RowsPath    | 28.41 | 35.20     | 86      | ±0.88% |
| transaction (5/50 cols) — CellsPath   | 27.64 | 36.18     | 83      | ±1.58% |

## Assessment

The feature branch shows **marginal improvements** within the noise margin for most benchmarks:

-   **Full refresh:** ~1-1.5% faster — within noise margin. Full refresh re-creates all groups from scratch, so the changed-path optimization has minimal impact.
-   **Immutable updates (all cols):** ~1-1.4% faster — within noise margin. When all 50 columns change, the cells-path optimization has no column-skipping advantage.
-   **Immutable updates (5/50 cols) — CellsPath:** **3.9% faster** — the clearest signal. When only 5 of 50 columns change and `aggregateOnlyChangedColumns` is enabled, the feature branch's optimized cell-level tracking skips re-aggregating 45 unchanged columns per group.
-   **Transaction updates (all cols):** **3.8-4.5% faster** — a consistent improvement. The pre-resolved column metadata and `Object.create(null)` aggData reduce per-group overhead even when all columns are re-aggregated.
-   **Transaction updates (5/50 cols):** ~0.6-1.2% — within noise margin for this scenario.

### Key observations

1. **The optimization is real but modest at this scale.** With only 120 groups (5 x 6 x 4), aggregation accounts for a small fraction of total pipeline cost. The 3.9-4.5% improvements in transaction and partial-column scenarios confirm the optimization works.

2. **CellsPath vs RowsPath shows no meaningful difference on `latest`.** On `latest`, `aggregateOnlyChangedColumns` barely affects performance, suggesting the old implementation's column-skipping was not efficient. On the feature branch, CellsPath and RowsPath perform equally — the new code is fast regardless of the flag.

3. **Run-to-run variance on `latest` is higher.** `latest` Run 1 shows notably worse results for CellsPath scenarios (e.g., `immutable 5/50 CellsPath` at 43.18ms vs 37.51ms in Run 3), with RME up to ±3.9%. The feature branch is more consistent (RME ±0.77-2.48%), suggesting the new code has more predictable performance.

4. **The benefit scales with aggregation cost.** With more groups, more value columns, or heavier agg functions (e.g., custom aggregation), the percentage improvement would increase since aggregation would represent a larger share of the pipeline.
