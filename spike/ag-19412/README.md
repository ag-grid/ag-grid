# AG-19412 spike harness

Throwaway scripts from the [AG-19412](https://ag-grid.atlassian.net/browse/AG-19412) spike into 1M-row client-side load time. Not for merging; they exist so the measurements can be reproduced.

Run from the repo root after `yarn nx run-many -t build -p ag-grid-community,ag-grid-enterprise`. Each "bundle dir" holds an `ag-grid-enterprise.js` UMD build (copy `packages/ag-grid-enterprise/dist/ag-grid-enterprise.js` into one).

## Timing

- `ab.mjs <rounds> <flat|collapsed|grouped> name=dir ...` - A/B first-load and repeat-load medians, a fresh browser per run, alternating variant order. The main comparison tool.
- `scale.mjs <rounds> <mode> <territories,...> name=dir ...` - same, across row counts (`repro-scaled.html`, rows = territories x 6).
- `selected-update.mjs <rounds> name=dir ...` - 5 rows selected, then `rowData` updated from 10 rows to 1M.
- `modsets.mjs <rounds> <mode> <local|released>` - module sets (`ClientSideRowModelModule`, `AllCommunityModule`, `AllEnterpriseModule`) via ES modules; `modsets-files.mjs` takes `FILES` / `SETS` env overrides.
- `run.mjs <dir> <outDir> [profile] [modes...]` - simple timings, or one CPU profile per mode.

## Profiling and memory

- `selftime.mjs <cpuprofile>` - self and inclusive time per function.
- `lineticks.mjs <cpuprofile> <fn...>` - per-line ticks inside the named functions.
- `children.mjs <cpuprofile> [depth]` - call tree with times.
- `diffprof.mjs a.cpuprofile[,...] b.cpuprofile[,...]` - per-function time difference, B minus A.
- `allocprof.mjs <dir> <mode>` - allocation sampling by function.
- `nodesize.mjs <dir>` - heap per load and `RowNode` property counts; `lateprops.mjs <dir>` - properties added after construction.
- `trace.mjs <dir> <mode> <out.json>` - Chrome trace with GC time per thread.
- `sanity.mjs <dir>` - group lookup, aggregation, expand and reload still behave.

## V8 numeric-id effect

- `micro.mjs` / `micro-chrome.mjs` - Map build cost with grid-shaped keys (Node and Chromium).
- `run-t8.mjs <scenario...>` - which live structures slow later Map building; `numStrHashedKeepStrings` reproduces the root cause.

## Patches

`patch-all.mjs <src bundle> <dst bundle> <patch,...>` applies the spike's fixes to a built UMD bundle by string replacement. Tier 1 (safe): `nofirst,md,nomap,rowh,poslg,hasch,noclosure,ctorinit`. Tier 2: `state,slim,lazyidx,destroyidx,gmap,pathcache`. The selection fix (`syncInCreatedNodes`) and the `firstChild` removal are in source on this branch, so build from it before patching (skip `nofirst` then).
