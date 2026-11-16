# Watch System Design

## Purpose

The watch system provides a fast dev feedback loop: source file change → browser reload. It wraps `nx watch` to batch project change events, run incremental builds via `nx run-many`, and signal the Vite dev server to reload once the relevant output is ready.

## Pipeline

```
Source file saved
  → Nx daemon detects change (~100–500ms)
  → nx watch echoes project name
  → watch.js quiet period debounce (50ms, resets on each event)
  → nx run-many <target> -c watch -p <projects>  (one batch at a time)
  → touch ag-build-queue.empty  (only when last reloadable target completes)
  → Vite plugin detects file touch (10ms debounce)
  → Browser full-reload
```

## Key Design Decisions

### Sequential build batching

Only one `nx run-many` runs at a time. New change events accumulate in `buildBuffer` while a build is in progress, then are processed in the next cycle. This avoids Nx task graph contention and keeps output readable. The one exception is the background lane below, which gives way to a newer save instead of making it wait.

### Quiet period debounce (50ms)

`QUIET_PERIOD_MS` in `constants.js` delays the first build until the file-event stream quiets. This batches multi-file IDE saves (which typically complete within tens of milliseconds). Git operations are handled separately by `isBuildBlocked()` — see below.

### Git operation blocking

`isBuildBlocked()` checks for `index.lock`, `rebase-merge`, `rebase-apply`, and `MERGE_MSG`. Git holds `index.lock` for the entire duration of working-tree modifications, so file events only fire after it is released. Builds blocked by git are retried every 10 seconds.

### Reload gating

`ag-build-queue.empty` is touched only when:
- At least one **reloadable target** was in the batch that just ran (`beforeReloadableCount > 0`)
- No reloadable targets remain in the queue (`afterReloadableCount === 0`)

This ensures the browser does not reload until all build outputs needed by the dev server are ready.

### Target priority in `*Watch.config.js`

Within a project's target list, reloadable targets come **before** non-reloadable ones. `buildBuffer` is processed in order and same-kind tasks are batched together, so the reloadable batch runs first and the browser reloads as early as possible; the slower non-reloadable targets (such as `build:types`) follow without delaying it.

Every output the dev server serves must be built by a reloadable target, or the reload fires while that output is still stale. In `chartsWatch.config.js`, the community, enterprise and locale cases queue the changed package's own `build:umd` and `build:package` (vanilla examples read `dist/umd`; islands, TypeScript and framework examples read `dist/package`) before `build:types`. A core edit queues those two targets for community and enterprise, which rebuild core's `dist/package` as a dependency (core has no `build:umd`). They queue those targets rather than the composite `build`, which is not reloadable. The types, locale and core cases also avoid `build`: it is a no-op over `build:types` and `build:package` (plus `build:umd` for locale), so each is split into explicit tuples, which lets `build:types` run in the background lane while the rest stays in the foreground.

### Background lane

A target listed in the config's `backgroundTargets` is slow, nothing the browser needs to reload depends on it, and it must never make a later save wait. Charts lists `build:types`: `tsc` takes 5–15 s, and the website only needs `dist/types` for type-checking.

- A background tuple is held back while any other tuple is queued, and runs as a batch of its own once nothing else is.
- When a save queues any non-background tuple while a background batch is running, the batch is **pre-empted**: its `nx run-many` process group is sent `SIGTERM` (signalling `nx` alone leaves its executors running for a moment longer), its tuples are put back on the queue (without duplicating any already there) and the new batch starts at once. After the reloadable batch, the re-queued `build:types` runs again, so `dist/types` is current once saves stop. Until then `dist/types` can be partial, because `tsc` clears it before writing.
- A pre-empted batch is recorded in `recentBuilds` as `cancelled` and does not touch `targetHistory`, so it never counts as a failure. A background batch that fails by itself is reported as a failure, as for any other target.
- If the process group cannot be signalled, the batch is left to finish and the new save waits behind it, as it would without the lane. If the batch is still running 3 s after the signal (`PREEMPT_EXIT_TIMEOUT_MS`), the watch logs a warning and keeps waiting.
- Background batches run in their own process group, so the terminal's Ctrl+C no longer reaches them; the watch stops them when it exits.
- A background target must not also be a reload target: the reload would be held back until nothing else is queued, so the watch refuses to start.

A config without `backgroundTargets` (grid, studio) is unaffected.

## Tests

`watch.test.mjs` runs the real `watch.js` against a fake `nx` on `PATH` (`yarn nx test ag-shared`). It covers pre-emption and re-queue, `cancelled` against `failed` in the status file, a build that ignores the kill, no executor left behind, and a config with no `backgroundTargets` (grid) staying as it was.

## Configuration (`*Watch.config.js`)

- `ignoredProjects` — projects whose changes are never processed (e.g. `ag-charts-website` is handled separately via `generate-examples`).
- `devServerReloadTargets` — targets whose completion can trigger a browser reload.
- `backgroundTargets` (optional) — targets that run in the background lane described above. Omit it for the behaviour every config had before the lane existed.
- `getProjectBuildTargets(project)` — maps a changed project to the list of `[project, targets[], config]` tuples to build. Handles fan-out: a change to `ag-charts-core` triggers builds for both `ag-charts-community` and `ag-charts-enterprise`.

## Timing Budget (approximate)

| Phase | Duration |
|---|---|
| Nx daemon file detection | 100–500ms |
| Quiet period debounce | 50ms |
| Nx invocation overhead | 180–320ms |
| Build execution (esbuild, cached) | 50–500ms |
| HMR plugin debounce | 10ms |
| **Total (cached)** | **~0.3–1.1s** |

### Nx invocation optimisations (watch mode)

- **Combined targets**: a single `nx run-many -t build:umd build` replaces 2–3 separate spawns, saving ~280–620ms per cycle.
- **`NX_FORCE_REUSE_CACHED_GRAPH`**: reads cached project graph directly instead of an IPC round-trip (~20–40ms per invocation).
- **`nx run` fast path**: single-project single-target changes use `nx run <project>:<target>:<config>` instead of `run-many` (~10–30ms saving).
- **`build:umd` source-only inputs**: community and enterprise override `dependsOn: []` and `inputs: ["production", "^production"]`, removing the inherited `build:package` dependency chain (~200–600ms saving for core changes).

## Files

| File | Purpose |
|---|---|
| `watch.js` | Main entry point; orchestrates the pipeline |
| `constants.js` | Shared tunables (debounce, batch size, file paths) |
| `chartsWatch.config.js` | Charts-specific project → target mapping |
| `gridWatch.config.js` | Grid-specific project → target mapping |
| `studioWatch.config.js` | Studio-specific project → target mapping |

## Manual check (charts reload gating)

1. Run `yarn nx dev` and open a page with an island (`/charts/javascript/license-install/`) and a docs page with TypeScript examples in two tabs.
2. Add a visible change to a community file (for example a `console.log` in `packages/ag-charts-community/src/chart/legend/legend.ts`) and save once.
3. The watch output shows `Reloading dev server...` once, after the `build:umd` and `build:package` batch and before the `build:types` batch. Both tabs reload once and log the new message, with no manual refresh.
4. `build:types` still completes afterwards. Repeat with an enterprise file and an `ag-charts-core` file.
5. Save the file again while `build:types` is running (a few seconds after the first reload). The watch logs `pre-empting it` and `Background build cancelled`, starts the `build:umd` and `build:package` batch straight away, reloads once more, and then runs `build:types` again to completion. `ps` shows no `nx` or executor process left over from the cancelled run.
6. Save a file under `packages/ag-charts-locale/src` and open a vanilla locale example (`/charts/javascript/localisation/`, the `installing-locale` example): after one reload it shows the change, because locale's `dist/umd` is rebuilt before the reload.
