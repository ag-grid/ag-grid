# Experiment: CSRM vs synchronous in-memory SSRM, 1M rows

A stashed experiment, not intended to merge. It compares the Client-Side Row Model (CSRM) with a
Server-Side Row Model (SSRM) whose datasource is fully synchronous and in memory, both over the same
1,000,000 generated rows. Recorded here so the setup, the findings and the caveats survive.

Scaffolded from `testing/manual/template/` (via the `manual-test` skill). JavaScript harness only; the
React / Angular / Vue pages are the untouched template pages.

## What was asked

- CSRM with 1M rows vs a synchronous SSRM implementation held in memory.
- Metrics: initial load time, sort / filter latency, scroll performance, memory footprint.
- SSRM datasource scope: slice + sort + filter (no grouping / aggregation).
- Harness: a manual test project.

## Running it

This project is gitignored under `testing/manual/` on `latest` (only `template/` is tracked), so it is
force-added on this branch. `node_modules`, `dist`, `yarn.lock` and `.yarn` are not committed.

```bash
cd testing/manual/csrm-vs-ssrm-1m
touch yarn.lock        # makes it a standalone Yarn project; it is not a workspace member
yarn install
yarn dev               # or: yarn build && node node_modules/vite/bin/vite.js preview --port 4711
```

Open, in a **visible, foreground** browser window:

- `/src/javascript/index.html?mode=csrm`
- `/src/javascript/index.html?mode=ssrm`

One mode per page load keeps heap numbers clean. `?rows=N` changes the row count. Click **Run all**
(or `await window.exp.runAll()` in the console) and read the results table. `window.exp` exposes
`actions`, `results`, `stats` (datasource counters) and `getApi()`.

A hidden or background tab throttles `requestAnimationFrame`, so paint and scroll timings are
meaningless there (and a long `runAll` call from an automation tool times out after 45 s: start it
without awaiting and poll `window.exp.results`).

## Files

| File | Purpose |
| --- | --- |
| `src/config.ts` | Module registration, `RowData`, `columnDefs`, `defaultColDef`, shared `gridOptions` (no `rowData`) |
| `src/data.ts` | Seeded (mulberry32) generator for the rows, so both modes see identical data |
| `src/datasource.ts` | Synchronous SSRM datasource: filters, sorts and slices a plain array, calls `params.success` before `getRows` returns |
| `src/javascript/main.ts` | Harness: mode switch, timed actions, results table, `window.exp` |
| `src/javascript/index.html` | Toolbar, grid, results panel |

## Design

- **Data:** 1M rows of `id, athlete, country, sport, age, year, gold, silver, bronze, total`. Generated
  before any measurement and held in memory in both modes, so "grid overhead" is heap after load minus
  heap after generation.
- **Load:** neither row model is given data at `createGrid`. CSRM then does
  `setGridOption('rowData', allRows)`; SSRM does `setGridOption('serverSideDatasource', datasource)`.
  Both are timed to first paint plus settle.
- **Datasource cache:** the filtered + sorted array is cached per `(filterModel, sortModel)`. Scrolling
  asks for many blocks under the same models, and re-sorting 1M rows per block would be unrealistic.
  The one-off cost shows as `datasourcePrepareMs`.
- **Filters supported by the datasource:** text (`contains`, `notContains`, `equals`, `notEqual`,
  `startsWith`, `endsWith`, `blank`, `notBlank`) and number (`equals`, `notEqual`, `greaterThan[OrEqual]`,
  `lessThan[OrEqual]`, `inRange`, `blank`, `notBlank`), single or combined (`conditions` /
  `condition1`/`condition2`, `AND`/`OR`). `inRange` is exclusive, matching the grid default.
- **Settling:** `timed()` runs the action, then waits double-rAF repeatedly until no `modelUpdated` or
  `getRows` activity has happened since the previous frame pair. Bias is at most ~2 frames and equal in
  both modes.
- **Scroll:** drives `.ag-body-vertical-scroll-viewport.scrollTop` one step per frame. "Fast" covers the
  full range in 300 frames; "slow" covers the first ~30k rows in 600 frames.
- **Modules:** a minimal set, deliberately without `ValidationModule` / `AllCommunityModule`, so dev-mode
  validation does not skew timings: `ClientSideRowModel(+Api)`, `ServerSideRowModel(+Api)`, `ColumnApi`,
  `RowApi`, `ScrollApi`, `TextFilter`, `NumberFilter`. `getRowId` is on in both modes.

## Problems hit while building it (and fixed)

1. **`yarn install` failed** in the copied project (not in the workspace). Fixed with an empty
   `yarn.lock`, as Yarn itself suggests.
2. **Silent API no-ops.** With only the row-model modules registered, `applyColumnState` / `getColumnState`
   / `getDisplayedRowCount` logged `error #200` and did nothing, so the first sort timings looked
   instant (~11 ms). Registering the API modules fixed it. (`ColumnFilterModule` is internal and not
   needed: the text/number filter modules pull it in.)
3. **Hidden browser tab** throttled `requestAnimationFrame`, giving nonsense paint/scroll numbers.
   Re-run in a visible Chrome (Chrome DevTools MCP page).
4. **Wrong scroll selector.** `.ag-body-viewport` does not exist in this version; the scroller is
   `.ag-body-vertical-scroll-viewport`. The first full run stalled at the scroll step because of it.
5. **Filter result mismatch.** `age` 20-30 AND `year` > 2010 returned 146,677 rows in SSRM vs 120,039 in
   CSRM. The grid's number filter `inRange` is exclusive by default; the datasource was inclusive. Fixed
   in `datasource.ts`; row counts now match for every filter.

## Results

Built bundle (`vite build` + `vite preview`), visible Chrome, 1M rows, one run per mode. Grid version
`36.2.0-beta.20261008.1557` (local source build). Single runs: treat small gaps as noise.

| | CSRM | Sync SSRM |
| --- | --- | --- |
| Load to painted | 318 ms | 31-35 ms (first block only) |
| Sort string asc | 3.6 s | 1.1 s (1.06 s in datasource) |
| Sort number desc | 1.0 s | 0.41 s |
| Sort country asc, then total desc | 1.5 s | 0.73 s |
| Filter text, `athlete` contains "A1" (2,806 rows) | 241 ms | 83 ms |
| Filter numeric (120,039 rows) | 233 ms | 75 ms |
| Clear filter or sort | 84-215 ms | 33-45 ms |
| Fast scroll, mean frame | 9.4 ms | 24.9 ms |
| Slow scroll, mean frame | 9.3 ms | 36 ms |
| Slow scroll, frames over 50 ms (of 600) | 0 | 145-165 |
| Heap added by load (GC-forced) | about +209 MB | about +1 MB |

Raw timings of the underlying runs: CSRM `apiMs` for sorts was 3.6 s / 0.95 s / 1.5 s with `totalMs`
within ~50 ms of that; SSRM `apiMs` was 3-18 ms with the cost showing up in `datasourcePrepareMs`.

### Reading the results

- **SSRM wins load, sort, filter and memory** because it never creates 1M `RowNode`s. It sorts and
  filters a plain array and builds only the visible block.
- **SSRM loses scrolling.** It fetched a block on nearly every frame (~290 `getRows` calls per scroll
  test). Slow scroll janks (max frame 155 ms); CSRM scrolls smoothly.
- **CSRM's string sort time** includes `RowNode` work on top of the comparison.

### Why filtering differs so much (code read, not profiled)

The comparison is not like for like. Per row, per active filter, CSRM does
(`clientSideRowModel/filterStage.ts` -> `filterManager.doesRowPassFilter` ->
`columnFilterService.doFiltersPass` -> filter handler `doesFilterPass`):

- builds a params object `{ node, data, model, handlerParams }` and looks up the model;
- the handler allocates a `models` array, spreads the conditions into it and creates a closure for
  `.every` / `.some`;
- reads the value via `params.getValue(node)` (value service and column definition, not `row.age`);
- runs the filter's own matcher, formatter and normalisation.

The datasource just runs `array.filter` over plain objects. After filtering, CSRM also rebuilds the
displayed rows (flatten + re-index of 1M rows): clearing a filter does no filter work and still costs
45-60 ms in CSRM, so roughly 50 ms of CSRM's filter time is not filtering. SSRM holds one block and a
row count instead.

So the result is the cost of AG Grid's generic filter pipeline vs a hand-written array filter. A real
server-side filter adds network time, and a datasource supporting as many filter types as CSRM would
likely be slower than this one. Not done: a CSRM variant with a minimal filter (e.g. an external
filter), or a profile of the CSRM filter pass to split allocation / value access / matcher cost.

## Memory measurement

`performance.memory.usedJSHeapSize` is only approximate without `--enable-precise-memory-info
--js-flags=--expose-gc`, and the harness's own `memory` action gave noisy numbers (e.g. negative
overhead) for that reason. The figures above come from a separate procedure: on a fresh page per mode,
take a heap snapshot (which forces a full GC) -> read the heap -> call `exp.actions.load()` -> take a
second snapshot -> read the heap again.

| | Heap after data, GC'd | Heap after load, GC'd | Delta |
| --- | --- | --- | --- |
| CSRM | 453.6 MB | 662.9 MB | about +209 MB |
| SSRM | 372.6 MB | 373.7 MB | about +1 MB |

The two baselines differ by ~80 MB for identical data, so only the deltas are meaningful. (Heap
snapshots must be written inside a workspace root for the Chrome DevTools MCP; they were written to the
gitignored `tmp/` and deleted.)

## Caveats

- One run per mode; no repeats or warm-up passes.
- The scroll tests are scripted `scrollTop` jumps, not real wheel input.
- SSRM numbers assume the datasource caches the filtered/sorted array per model. A datasource that
  re-sorted per block would be far worse.
- `getRowId` is enabled in both modes; this adds an id map to CSRM load.
- The grid ran from the local source build with the repo's current in-progress changes, not a release.
