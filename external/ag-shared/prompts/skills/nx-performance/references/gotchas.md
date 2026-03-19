# Gotchas: Lessons Learned the Hard Way

These are bugs and misconfigurations discovered in AG product monorepos and fixed. Repos sharing these Nx patterns may have inherited the same issues. Each entry includes the symptom, root cause, and fix.

---

## 1. Noop targets with caching can destroy real outputs

**Symptom**: After a cache hit on a `build` noop target, downstream consumers find empty `dist/` directories.

**Root cause**: When `nx:noop` with `cache: true` restores from cache, Nx clears the declared outputs before restoring. If outputs were declared (or inherited from defaults), this deleted the real build artifacts produced by sub-targets.

**Fix**: Set `inputs: [], outputs: []` on noop aggregator targets. With no outputs declared, cache restoration has nothing to clear.

```json
"build": {
  "executor": "nx:noop",
  "dependsOn": ["build:types", "build:package", "build:umd"],
  "inputs": [],
  "outputs": [],
  "cache": true
}
```

---

## 2. Test targets forcing full upstream production builds

**Symptom**: Running tests on a single package triggers `build` on every upstream package, taking minutes.

**Root cause**: `test` had `dependsOn: ["^build"]`, meaning "build everything upstream". Tests only need compiled types and packages, not UMD bundles.

**Fix**: Changed to `dependsOn: ["build:test"]` (local test compilation only), with test inputs including `^production` for cache invalidation on upstream changes.

---

## 3. Tests using stale cache when upstream code changes

**Symptom**: Tests pass locally but fail in CI, or vice versa. Tests use outdated upstream implementations.

**Root cause**: Test inputs only included local files, missing `^production` (upstream source files). Changes to upstream packages didn't invalidate the test cache.

**Fix**: Added `^production` to test inputs:

```json
"test": { "inputs": ["default", "buildOutputExcludes", "^production", ...] }
```

---

## 4. `dist/` inside project root pollutes input hashes

**Symptom**: Build targets never get cache hits even when source files haven't changed. Cache keys change after every build.

**Root cause**: Nx's default `{projectRoot}/**/*` input glob includes `dist/` (which lives inside the project root). Every build modifies `dist/`, changing the input hash, invalidating its own cache.

**Fix**: Introduced `buildOutputExcludes`:

```json
"buildOutputExcludes": ["!{projectRoot}/dist/**"]
```

Included in `production` and `default` named inputs.

---

## 5. Image snapshots pollute build cache keys

**Symptom**: Updating visual regression snapshots causes all build targets to rebuild.

**Root cause**: `__image_snapshots__/` directories were included in the default input glob. These binary files are large and change frequently.

**Fix**: Added exclusion to `defaultExcludes`:

```json
"!{projectRoot}/**/__image_snapshots__/**"
```

---

## 6. Pack target misses transitive dependency changes

**Symptom**: `yarn pack` produces a tarball with stale transitive dependencies. Publishing includes old versions of deep dependencies.

**Root cause**: `pack` inputs only referenced direct build outputs, not transitive ones. A change in a deep transitive dependency (e.g., a types package two levels up from an enterprise package) wouldn't trigger a re-pack.

**Fix**: Changed pack inputs to `allTransitiveOutputs`:

```json
"pack": { "inputs": ["allTransitiveOutputs", "{projectRoot}/.npmignore"] }
```

---

## 7. Lint config changes not invalidating lint cache

**Symptom**: Changing `.dependency-cruiser.js` or ESLint config doesn't cause lint to re-run. Stale lint results served from cache.

**Root cause**: Lint target inputs didn't include the lint tool's configuration files.

**Fix**: Added config files to lint inputs:

```json
"lint:depcruise": { "inputs": ["{projectRoot}/src/**", "{projectRoot}/.dependency-cruiser.js"] }
"lint:eslint": { "inputs": [..., "{workspaceRoot}/eslint.*", "{projectRoot}/eslint.*"] }
```

---

## 8. Noop targets invalidated by unrelated NPM changes

**Symptom**: Installing any NPM package causes all noop aggregator targets to re-run, triggering cascading rebuilds.

**Root cause**: Without explicit `externalDependencies`, Nx includes all of `node_modules` in the input hash. Noop targets don't use any NPM packages but still got invalidated.

**Fix**: Set `inputs: []` on noop targets (which also clears external dependencies).

---

## 9. `nx:run-commands` race conditions with `parallel: true`

**Symptom**: `pack` target intermittently fails because `yarn pack` runs before `mkdir` creates the output directory.

**Root cause**: `nx:run-commands` runs commands in parallel by default. When the target has sequential commands (create directory, then pack into it), parallel execution causes race conditions.

**Fix**: Added `parallel: false` to targets with ordering-dependent commands.

---

## 10. Hardcoded paths break portability

**Symptom**: Copying a `project.json` to a new package requires manual path updates. Targets break if packages are reorganised.

**Root cause**: Using hardcoded paths like `packages/<package-name>/...` instead of `{projectRoot}/...`.

**Fix**: Replaced all hardcoded paths with `{projectRoot}` and `{workspaceRoot}` tokens.

---

## 11. External (unbundled) packages need explicit `implicitDependencies`

**Symptom**: After unbundling a package (marking it as `external` in esbuild), Nx no longer builds it before downstream consumers. Broken builds.

**Root cause**: When a package is bundled, Nx detects the dependency through import analysis. When marked as `external`, the import still exists but Nx doesn't trace through it for build ordering.

**Fix**: Added explicit `implicitDependencies`:

```json
"implicitDependencies": ["<product>-types", "<product>-core"]
```

---

## 12. Watch process dies silently when Nx daemon self-disables

**Symptom**: Dev server stops rebuilding on file changes. No error messages. Requires manual restart.

**Root cause**: When Nx's parallel `run-commands` executor ran the watch process and Astro server, the Nx daemon could self-disable mid-session (writing to `.nx/workspace-data/d/disabled`), causing `nx watch` to exit silently.

**Fix**: Replaced Nx's parallel execution with `yarn concurrently --kill-others`:

```json
"commands": [
  "NX_DAEMON=true yarn concurrently -n \"watch,astro\" --kill-others \"node watch.js charts\" \"nx run website:dev\""
]
```

---

## 13. Dev setup cached across branch switches

**Symptom**: After switching branches, the dev server serves examples from the previous branch.

**Root cause**: The `dev:setup` target (which generates examples) was cached. Switching branches didn't change the cache key because the inputs were too narrow. Nx's cache is branch-unaware — it uses content hashes, not branch names — so if the input files happen to match (or the inputs are too narrow to capture the change), the old branch's output is served.

Additionally, orphaned files in `dist/` from targets that only existed on the previous branch persist on disk because no target is responsible for cleaning them up.

**Fix — two strategies:**

1. **Set `cache: false` on orchestrator targets**: This forces the orchestrator to always re-evaluate its dependents, even when hashes match. Individual child targets can remain cached for performance. This is the recommended approach:

    ```json
    "generate": { "cache": false }
    ```

2. **Broaden the target's inputs** so that branch switching is more likely to invalidate the cache. For example, include a broader set of source files or add `{workspaceRoot}/package.json` to the inputs so that version bumps or script changes between branches trigger re-generation. This preserves caching benefits at the cost of occasional false invalidations.

**Immediate workaround**: Run `nx reset` (or `yarn nx clean` if the repo has a clean target) to clear the Nx cache, then restart the dev server. Alternatively, use `--skip-nx-cache` for the specific generation target.

---

## How to use this list

When auditing a peer repo:

1. Check the repo's history against when these fixes were applied
2. For each gotcha listed above, check whether the repo's Nx config has the same vulnerability
3. The fixes are listed — apply them as appropriate

Most common gotchas in peer repos (in order of frequency):

1. **#4** — `dist/` polluting input hashes (almost universal in repos without `buildOutputExcludes`)
2. **#1** — noop targets with inherited outputs destroying build artifacts
3. **#2** — test targets forcing full upstream builds
4. **#7** — lint config changes not invalidating lint cache
5. **#8** — noop targets invalidated by any NPM change
