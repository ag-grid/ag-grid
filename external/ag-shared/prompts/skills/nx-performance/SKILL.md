---
name: nx-performance
description: >-
    Nx monorepo performance, caching, and build pipeline best practices. Use this
    skill whenever planning or making changes to nx.json, project.json, targetDefaults,
    namedInputs, or any Nx configuration. Also use when auditing a repo for Nx
    optimisations, diagnosing cache misses, investigating slow builds, reviewing CI
    pipeline efficiency, or when anyone mentions Nx caching, build performance,
    task graph, or build decomposition. If the user is touching Nx config files or
    asking "why is my build slow?", this skill applies.
---

# Nx Performance & Caching Guide

This skill encodes battle-tested patterns from AG product Nx monorepos — large-scale Nx 20 workspaces with 100-220+ projects, decomposed build targets, batch executors, and sophisticated CI pipelines. Use it both for making changes and for auditing.

## When to consult reference files

| Topic                                                     | Reference file                   | Read when...                                                                                          |
| --------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Named inputs, cache config, output declarations           | `references/caching-strategy.md` | Modifying `namedInputs`, `targetDefaults`, `cache`, or `outputs` in nx.json or project.json           |
| Build decomposition, esbuild, dev server, batch executors | `references/build-and-dev.md`    | Changing build targets, adding new targets, modifying the dev server, or working with batch executors |
| CI caching, sharding, artifacts, concurrency              | `references/ci-patterns.md`      | Modifying GitHub Actions workflows, CI caching strategy, test sharding, or artifact sharing           |
| Known bugs and fixes from AG monorepos                    | `references/gotchas.md`          | Debugging unexpected cache behaviour, or auditing a repo that may have inherited older patterns       |

---

## The Five Laws of Cacheable Targets

Every Nx target that has `cache: true` must satisfy all five. Violating any one silently degrades cache hit rates — often to zero.

### 1. Inputs and outputs must not overlap

A target's inputs (files Nx hashes for the cache key) and outputs (files the target produces) must be disjoint. When they overlap, the target invalidates its own cache every time it runs.

**Common violations:**

-   Code generation that writes back to `src/`
-   In-place transpilation (`.js` alongside `.ts` in `src/`)
-   Auto-formatting (`--fix`) during build, mutating source files

**Fix:** Write generated/transformed files to `dist/` or `.generated/`, and exclude that directory from inputs:

```json
"buildOutputExcludes": ["!{projectRoot}/dist/**"]
```

### 2. Targets must be idempotent

Running a target twice with the same inputs must produce byte-identical outputs. Non-idempotent targets create cache entries that never validate on restore.

**Common breakers:** timestamps in output, non-deterministic ordering (`Object.keys()`, `fs.readdir()`), random values, absolute paths in source maps.

**How to test:**

```bash
nx run my-package:build
cp -r packages/my-package/dist /tmp/first-run
nx run my-package:build --skip-nx-cache
diff -r /tmp/first-run packages/my-package/dist
# Any diff = non-idempotent target
```

### 3. Upstream outputs must not pollute downstream inputs

When target A produces output that target B reads, A's outputs must not land in B's input set unintentionally. This is a cross-package variant of Law 1.

**Fix:** Use `dependentTasksOutputFiles` to read only specific output files (e.g., `*.d.ts`) from dependencies — not their entire `src/`. Exclude all `dist/` from the default input set.

### 4. Pin your tools — both npm packages and local scripts

The cache key must invalidate when any tool that transforms the output changes. This means two things:

**npm tool versions** — declare `externalDependencies` so upgrading TypeScript or esbuild invalidates the cache:

```json
{ "externalDependencies": ["npm:typescript", "npm:esbuild"] }
```

**Local build scripts** — if the target runs a custom script (e.g., `node tools/compile-sass.js`), that script file must be in the target's `inputs`. Otherwise, changes to the script produce stale cached results:

```json
"inputs": [
  "{projectRoot}/src/**/*.scss",
  "{workspaceRoot}/tools/compile-sass.js",
  "buildOutputExcludes",
  { "externalDependencies": ["npm:sass"] }
]
```

A common mistake is to include only source files in inputs while forgetting the scripts and config files that process them.

### 5. Declare outputs for every cached target

Missing `outputs` means Nx caches "nothing" — the target runs, produces files, but restoring from cache doesn't restore those files.

```json
"build:types":   { "outputs": ["{options.outputPath}"] }
"lint":          { "outputs": [] }
"test":          { "outputs": [] }
```

Even targets that produce no files (lint, test) should declare `"outputs": []` explicitly.

---

## Key Patterns

### Named inputs hierarchy

Define reusable `namedInputs` in `nx.json` so every target references a well-scoped input set. This is the single most impactful optimisation — it prevents over-invalidation (cache misses from irrelevant file changes) and under-invalidation (stale results).

Essential named inputs:

-   **`production`** — source files minus tests, snapshots, lint configs, and build outputs
-   **`buildOutputExcludes`** — `!{projectRoot}/dist/**` (prevents self-invalidation)
-   **`sharedGlobals`** — root config files that affect all builds (tsconfig, esbuild config)

See `references/caching-strategy.md` for the full hierarchy and dependency output inputs (`tsDeclarations`, `jsOutputs`, `allTransitiveOutputs`).

### Build decomposition

Split monolithic `build` into sub-targets that maximise parallelism and minimise cache invalidation:

| Target          | Executor      | Produces                            | Key benefit                              |
| --------------- | ------------- | ----------------------------------- | ---------------------------------------- |
| `build`         | `nx:noop`     | Nothing (aggregator)                | Fan-out point, `inputs: [], outputs: []` |
| `build:types`   | `@nx/js:tsc`  | `dist/types/*.d.ts`                 | Parallel with `build:package`            |
| `build:package` | `@nx/esbuild` | `dist/package/*.cjs.js + *.esm.mjs` | Only rebuilds on source changes          |
| `build:umd`     | `@nx/esbuild` | `dist/umd/*.js`                     | Consumes JS output, not source           |
| `build:test`    | `tsc`         | `dist/test/**`                      | Depends on types only, not packages      |

See `references/build-and-dev.md` for the full pipeline including dev server and batch executors.

### Dependency precision

Be precise about `dependsOn` — targets should depend on exactly what they need:

```json
// build:umd only needs JS outputs from dependencies, not types
"build:umd": { "dependsOn": ["build:package", "^build:package"] }

// build:test needs types for compilation, not packages
"build:test": { "dependsOn": ["^build:types", "build:types"] }

// test needs compiled specs + runtime, but NOT UMD bundles
"test": { "dependsOn": ["build:test"] }
```

Over-broad dependencies (everything depending on `build`) serialise the task graph unnecessarily.

### Noop aggregator targets

Use `nx:noop` for fan-out targets (like `build` that just triggers sub-targets):

```json
"build": {
  "executor": "nx:noop",
  "dependsOn": ["build:types", "build:package", "build:umd"],
  "inputs": [],
  "outputs": [],
  "cache": true
}
```

`inputs: []` and `outputs: []` are critical. Without them, cache restoration can delete real build artifacts produced by sub-targets.

### Cache defaults for `nx:run-commands`

Set `cache: true` as the default for `nx:run-commands` in `targetDefaults`:

```json
"targetDefaults": {
  "nx:run-commands": { "cache": true }
}
```

Without this, every shell command target is uncached by default.

---

## Audit Workflow

When auditing a repo for Nx optimisations, work through these checks in order. The checklist is prioritised by typical impact.

### Phase 1: Fundamentals (highest impact)

1. **Check for input/output overlap** — Do any targets write to `src/` or directories included in their inputs?
2. **Check `dist/` exclusion** — Is `dist/` excluded from input globs? Look for `buildOutputExcludes` or `!{projectRoot}/dist/**` in `namedInputs`.
3. **Check `namedInputs` exist** — Are they defined in `nx.json` and referenced by targets? The biggest miss is targets using the default `{projectRoot}/**/*`, which includes test files, snapshots, and dist output.
4. **Check `production` input** — Does it exclude test files (`!**/*.spec.*`), snapshots (`!**/__image_snapshots__/**`), and build outputs?
5. **Check `outputs` declarations** — Every cached target should declare its outputs. Missing outputs means cache restores are empty.
6. **Test idempotency** — Run a build target twice and diff the outputs.

### Phase 2: Build pipeline

7. **Check build decomposition** — Is `build` a monolithic target, or decomposed into types/package/umd?
8. **Check bundler** — Is esbuild used for JS bundling? tsc is 10-100x slower.
9. **Check dependency precision** — Do targets depend on more than they need? (e.g., `test` depending on full `build` including UMD)
10. **Check `externalDependencies`** — Are compiler tools (typescript, esbuild) declared on build targets?
11. **Check `transitive: false`** — Are dependency output inputs using `transitive: false` where only direct deps are needed?

### Phase 3: Cache configuration

12. **Check `cache: true` default** — Is `nx:run-commands` cached by default in `targetDefaults`?
13. **Check `useLegacyCache: false`** — Is the newer, more efficient cache format enabled?
14. **Check for accidental `cache: false`** — Search for `"cache": false` in project.json files and verify each is intentional.
15. **Check noop targets** — Do aggregator (noop) targets use `inputs: [], outputs: []`?

### Phase 4: CI (if applicable)

16. See `references/ci-patterns.md` for the full CI audit checklist covering GHA caching, sharding, artifacts, and concurrency control.

### Phase 5: Known gotchas

17. See `references/gotchas.md` for 13 specific bugs discovered and fixed in AG product monorepos. The most common issues (check these first):
    -   **Noop aggregator targets with inherited outputs** — can destroy real build artifacts on cache restore. Fix: `inputs: [], outputs: []`.
    -   **`nx:run-commands` with `parallel: true`** — race conditions when commands must run sequentially. Fix: `parallel: false`.
    -   **Lint inputs missing config files** — `.dependency-cruiser.js`, `eslint.*` not in lint inputs means stale lint results after config changes.
    -   **Dev setup/generation cached across branches** — Nx cache is branch-unaware. Fix: `cache: false` on orchestrator targets, or broaden inputs so branch switches invalidate the cache. Workaround: `nx reset` or `--skip-nx-cache`.
    -   **External (unbundled) packages missing `implicitDependencies`** — Nx can't trace through `external` imports for build ordering.

---

## Verification Commands

```bash
# Check named inputs are defined
cat nx.json | jq '.namedInputs | keys'

# Check target defaults
cat nx.json | jq '.targetDefaults | keys'

# Check which targets have cache: true/false
grep -r '"cache"' packages/*/project.json nx.json

# Check for targets that write to src/
grep -r '"command"' packages/*/project.json | grep 'src/'

# Test idempotency
nx run <package>:build && cp -r packages/<package>/dist /tmp/first-run
nx run <package>:build --skip-nx-cache
diff -r /tmp/first-run packages/<package>/dist

# List all projects (including auto-generated)
nx show projects | wc -l

# Check cache size
du -sh .nx/cache/

# Check build decomposition for a package
cat packages/<package>/project.json | jq '.targets | keys'

# Check .nxignore exists
cat .nxignore
```

---

## Making Configuration Changes

When modifying Nx configuration, follow these principles:

1. **Centralise in `nx.json` `targetDefaults`** — Project-level `project.json` should only contain overrides. Define default inputs, outputs, dependsOn, and cache settings in `targetDefaults` keyed by executor name.

2. **Use tokens, not hardcoded paths** — Always use `{projectRoot}` and `{workspaceRoot}` instead of `packages/my-package/...`. Hardcoded paths break when packages are reorganised.

3. **Scope inputs as tightly as possible, but don't forget build tools** — Every file included in inputs that doesn't affect the target's output is a potential false cache invalidation. Use specific globs (`{projectRoot}/src/**`) rather than broad ones (`{projectRoot}/**/*`). But be careful not to go too narrow: include every file that affects the output — source files, local build/transform scripts (e.g., `{workspaceRoot}/tools/compile-sass.js`), relevant config files, and tool versions via `externalDependencies`.

4. **Use `dependentTasksOutputFiles` for cross-package dependencies** — Instead of including all upstream source in inputs, reference specific output file patterns:

    ```json
    "tsDeclarations": [{ "dependentTasksOutputFiles": "**/*.d.ts", "transitive": false }]
    ```

    Use `transitive: false` unless you genuinely need the full dependency tree (e.g., `pack`).

5. **Test cache behaviour after changes** — Run the target, then run it again. The second run should be a cache hit. If not, investigate what changed between runs using `NX_VERBOSE_LOGGING=true`.

6. **Consider the `.nxignore` file** — Exclude generated files, vendored directories, patch infrastructure, and anything that shouldn't be in the project graph or trigger formatting.
