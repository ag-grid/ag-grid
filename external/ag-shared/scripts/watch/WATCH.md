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

Only one `nx run-many` runs at a time. New change events accumulate in `buildBuffer` while a build is in progress, then are processed in the next cycle. This avoids Nx task graph contention and keeps output readable.

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

`build:umd` is listed **before** `build` in each project's target list. Because `buildBuffer` is processed in order and same-target tasks are batched together, the reloadable `build:umd` target runs first, triggering the browser reload as early as possible. The `build` catch-all (types + package) runs after.

## Configuration (`*Watch.config.js`)

- `ignoredProjects` — projects whose changes are never processed (e.g. `ag-charts-website` is handled separately via `generate-examples`).
- `devServerReloadTargets` — targets whose completion can trigger a browser reload.
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
