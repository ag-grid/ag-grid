# SSRM streaming benchmark

A demo and measurement harness for a trading-desk streaming workload on the Server-Side Row Model: live top inserts, per-cell streaming updates, server-side sort, filter, grouping and aggregation, many grids and wide column sets. `REPORT.md` holds the per-requirement findings; `results/` holds the numbers they come from.

It lives in `testing/manual/` because that is where the repo keeps hand-run demos: it is outside Nx, CI and the docs site, so nothing here is built, linted, type-checked or shipped. It is plain JavaScript loading the built UMD bundle, with no `package.json` and nothing to install.

## Run it

The repo must be bootstrapped (`npm run bootstrap`, Node per `.nvmrc`). Build the bundles once, from the repo root:

```bash
yarn nx run-many -t build:umd -p ag-grid-community,ag-grid-enterprise
```

### Demo

```bash
node testing/manual/ssrm-streaming-bench/serve.mjs   # optional port, default 4620
```

Open the printed `http://localhost:4620/` URL. Use `localhost`, not `file://`: the licence watermark is hidden only there.

The top bar has every control (insert interval, per-cell update rate, column count, sync or async transactions, `asyncTransactionWaitMillis`, `cacheBlockSize`, `maxBlocksInCache`, number of grids, backend latency, grouping, trimming fields to the visible columns, `animateRows`, row height, `viewSubscription.debounceMs`). **Apply** reloads the page with the settings in the URL query, so any configuration can be bookmarked, for example `?cols=2000&trim=1` or `?grids=100`. Sort by clicking the `arrival` or `qty` header and filter `qty` or `sym` from their header filter buttons; group with the **Group by sym** checkbox (`?group=1`).

**Select rows 5-9 + cell range**, **Pause updates** and **Resume updates** drive the selection check. Pause is done by the demo app, not the grid: the feed keeps running and transactions are buffered, then applied in order on resume.

The overlay in the bottom right shows, once a second: frames per second, the longest frame and the frames over 50 ms; inserts applied per second and cell updates sent per second; content refreshes per second (frames where a sampled visible cell changed) and the rendered per-cell update rate; transaction timing; DOM row elements added and removed per second and row elements re-keyed to another row; loaded row nodes, subscribed rows and the visible rows x columns; the selection check result.

### Harness

```bash
node testing/manual/ssrm-streaming-bench/run-bench.mjs                  # every scenario, about 10 minutes
node testing/manual/ssrm-streaming-bench/run-bench.mjs --only S1,S4     # some scenarios, merged into results.json
node testing/manual/ssrm-streaming-bench/run-bench.mjs --report-only    # rebuild the tables from results.json
```

It starts the server, runs each scenario in a fresh headless Chromium page at 3840x2160 (3 s warm-up, then 10 s measured; `--warmup` and `--measure` change these) and writes `results/results.json` (raw numbers and machine spec) and `results/results.md`. It also rewrites the generated table in `REPORT.md`. It uses the Chromium that Playwright installs, falling back to `/usr/bin/google-chrome` or `/usr/bin/chromium`; `--chrome <path>` picks one.

Scenarios and the pass/fail thresholds are in `scenarios.mjs`. The thresholds were fixed before anything was measured.

## Files

| File                             | What                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/backend.js`                 | Mock backend: rows derived from their id, so 100m rows need no storage; sort, filter, grouping, SUM aggregates kept up to date on every change, grand total; optional trimming to the visible columns; simulated latency |
| `src/grids.js`                   | One grid with its backend and live feed: top inserts, cell updates for the rows `viewSubscription` reports in view, group and grand total updates, pause buffer                                                          |
| `src/metrics.js`                 | Frame timing, cell text sampled per frame by row id and column id, DOM row churn (`MutationObserver`), transaction timing, aggregate lag, loaded node count                                                              |
| `src/main.js`                    | Controls, overlay and the `window.__bench` API the harness drives                                                                                                                                                        |
| `serve.mjs`                      | Static server on `127.0.0.1`, serving this folder and the built bundle under `/dist/`                                                                                                                                    |
| `scenarios.mjs`, `run-bench.mjs` | Scenario matrix, thresholds and the Playwright runner                                                                                                                                                                    |

## What the numbers mean

- They come from headless Chromium with software rendering. A frame rate pass means the main thread kept up, not that a screen showed it. Treat them as relative and re-run on the target hardware before quoting any of them.
- Update rates are read from the rendered cells, not counted from what was sent. A cell that changes twice inside one frame counts once.
- "Every row updated once a second" is measured for the rows in view. View Subscription streams updates only for those.
