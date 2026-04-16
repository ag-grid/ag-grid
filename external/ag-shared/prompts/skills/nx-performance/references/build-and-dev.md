# Build Pipeline & Dev Server Reference

## Decomposed build targets

The recommended pattern splits `build` into four sub-targets that maximise parallelism and minimise cache invalidation:

```
build (nx:noop aggregator)
├── build:types (@nx/js:tsc)       → dist/types/*.d.ts
├── build:package (@nx/esbuild)    → dist/package/*.cjs.js + *.esm.mjs
├── build:umd (@nx/esbuild)        → dist/umd/*.js (depends on build:package)
└── build:test (tsc)               → dist/test/** (depends on build:types)
```

### Why decomposition matters

-   **Parallel execution**: `build:types` and `build:package` run simultaneously — no mutual dependency.
-   **Granular caching**: Changing a type signature invalidates `build:types` but not `build:package` (if the JS output is unchanged). Changing implementation invalidates `build:package` but not `build:types`.
-   **Minimal downstream invalidation**: `build:umd` uses `jsOutputs` (not `production`), so it only rebuilds when actual JS output changes — not when comments or tests change.

### What invalidates what

| Change type         | build:types | build:package | build:umd                 | build:test |
| ------------------- | ----------- | ------------- | ------------------------- | ---------- |
| Source code change  | Rebuilds    | Rebuilds      | Only if JS output changed | Rebuilds   |
| Test file change    | Cached      | Cached        | Cached                    | Rebuilds   |
| Comment-only change | Rebuilds    | Cached        | Cached                    | Rebuilds   |

### Per-package overrides

Individual packages can override `targetDefaults`. For example, a community package may override `build:umd` to build from source rather than `dist/` output, because its UMD bundle is a self-contained browser bundle needing a dedicated entry point (`main-umd.ts`).

```json
"build:umd": {
  "dependsOn": [],
  "inputs": ["production", "^production"],
  "options": { "main": "{projectRoot}/src/main-umd.ts" }
}
```

### What to audit

1. **Is `build` a monolithic target?** If a single target runs tsc + bundle + UMD, every change invalidates everything.
2. **Does `build:umd` depend on `build:package` output (not source)?** The UMD bundle should consume `dist/package/main.cjs.js`, not `src/`. Some packages may legitimately override this.
3. **Are test compilation and library compilation separated?** `build:test` depending on `build:types` (not `build:package`) means tests can compile as soon as types are ready.

---

## esbuild over tsc for bundling

Use `@nx/esbuild:esbuild` for `build:package` and `build:umd`. esbuild is 10-100x faster than tsc + bundler for producing JS output. `@nx/js:tsc` is only used for `build:types` (declaration emit).

Custom esbuild plugins (`esbuild.config.cjs`) handle: CSS inlining and minification, HTML minification, post-build `.min.js` generation, UMD wrapper adaptation.

### What to audit

-   Is tsc being used for JS output when esbuild could do it?
-   Are there separate minification steps that could be folded into esbuild plugins?

---

## Batch executors

For targets that run hundreds of times with identical setup (e.g., ~200 example generation tasks), batch executors avoid spawning a separate Node process per task:

-   Receives all tasks in a single process
-   Uses Node.js worker threads for CPU-parallelism (requires Node >= 18.18)
-   Falls back to serial execution on older Node versions

Both `implementation` and `batchImplementation` must be declared in `executors.json`.

### What to audit

-   Are there targets that run hundreds of times with identical setup? These are candidates for batch executors.
-   Are batch executors registered with `batchImplementation` in `executors.json`?

---

## Dev server

### Startup sequence

```
nx dev
├── Phase 1: Dependencies (sequential)
│   ├── ^build:types (all packages)
│   ├── ^build:package (all packages)
│   └── generate (all examples + thumbnails)
└── Phase 2: Concurrent processes
    ├── watch.js (file watcher + queue-based rebuilder)
    └── <product>-website:dev (Astro dev server)
```

**Variants:**

-   `dev:lite` — simple HTTPS file server instead of Astro. Much faster startup for core library work.
-   `dev:quick` — only depends on a single thumbnail generation. Fastest startup for gallery-focused work.

### Watch system design

The watch script is a queue-based system:

1. `nx watch --all` detects file changes and emits project names
2. 50ms quiet period batches rapid-fire changes
3. Dependency-aware fan-out — core change → rebuild community, enterprise, then core
4. `build:umd` listed before `build` so browser-reloadable target finishes first
5. Batch limit (50 projects per `nx run-many`) prevents command-line length issues
6. HMR bridge — touching a sentinel file signals Astro/Vite to send full-reload WebSocket message

**Key environment variables:**

-   `NX_FORCE_REUSE_CACHED_GRAPH=true` — skips re-computing the project graph on every watch-triggered build (~20-40ms savings per invocation)
-   `NX_DAEMON=true` — required for the watch process (even if daemon is disabled for one-shot commands)
-   `BUILD_FWS` — opt-in to rebuild framework wrappers during watch (excluded by default)

**Git-aware pausing**: Builds are blocked during `git rebase`, `git merge`, or any operation that creates `.git/index.lock`.

### What to audit

1. **Does `dev` depend on build but NOT lint/test?** Dev startup should be minimal.
2. **Is the watch config dependency-aware?** Naive watch that just rebuilds the changed project produces broken intermediate states.
3. **Is UMD prioritised for reload?** Browser loads UMD bundles — listing `build:umd` first means reload fires sooner.
4. **Is `NX_FORCE_REUSE_CACHED_GRAPH` set?** Avoids re-computing the project graph on every watch-triggered build.
5. **Is there a lightweight dev variant?** Not every developer needs the full website.
6. **Are framework wrappers excluded from watch?** Rebuilding them on every change is wasteful.

---

## Task graph optimisation

### Dependency precision patterns

```json
// build:umd only needs JS outputs, not types
"build:umd": {
  "dependsOn": ["build:package", "^build:package"],
  "inputs": ["jsOutputs"]
}

// build:test needs types (for compilation) but not packages (not bundling)
"build:test": {
  "dependsOn": ["^build:types", "build:types"]
}

// test needs build:test (compiled specs) + build:package (runtime)
"test": {
  "inputs": ["default", "buildOutputExcludes", "^production"]
}
```

### What to audit

-   **Are targets depending on more than they need?** Common mistake: `test` depending on `build` (which includes UMD).
-   **Are `^` (upstream) dependencies used correctly?** `^build:types` means "build types for all dependencies". Without `^`, it means "build types for this project only".

---

## Aggregator project (`all`)

AG product monorepos use an aggregator project with `nx:noop` targets and `dependsOn: ["^targetName"]` to fan out work. Running `nx run all:build` triggers every package's `build`.

Convenience targets: `blt` (build-lint-test), `blt:ci` (adds e2e and pack), `clean`, `nuke`.

### What to audit

-   Does the repo have an aggregator project? Without one, developers use `nx run-many` with hand-maintained project lists that drift.

---

## Dynamic project creation

AG product monorepos use custom Nx plugins that scan example directories (e.g., `packages/*/src/**/_examples/*/main.ts`) and create virtual projects at graph-computation time, each with `generate-example`, `generate-thumbnail`, and `typecheck` targets.

### What to audit

-   Is dynamic project creation used for examples/generated content, or are hundreds of targets hand-maintained in `project.json` files?

---

## Nx references

-   [Batch executors](https://nx.dev/docs/technologies/typescript/guides/enable-tsc-batch-mode)
-   [Project graph plugins](https://nx.dev/docs/extending-nx/project-graph-plugins) — `createNodes` API
-   [Workspace watching](https://nx.dev/docs/guides/tasks--caching/workspace-watching)
