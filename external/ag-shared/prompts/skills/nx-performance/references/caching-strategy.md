# Caching Strategy Reference

## Named Inputs — the foundation of correct caching

AG product monorepos define reusable `namedInputs` in `nx.json` that every target references. This ensures Nx knows exactly what files affect each target, avoiding both over-invalidation (cache misses) and under-invalidation (stale results).

### Named input hierarchy

```
default                    = {projectRoot}/**/* + sharedGlobals
├── defaultExcludes        = !tests, !snapshots, !eslint, !jest configs
├── buildOutputExcludes    = !{projectRoot}/dist/**
└── production             = default + defaultExcludes + buildOutputExcludes

sharedGlobals              = esbuild.config*.cjs + tsconfig.*.json (root)

tsDefaults                 = src + tsconfigs + tsDeclarations + sharedGlobals + defaultExcludes
```

### Named input definitions

| Named Input            | Purpose                                    | Key detail                                                       |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `production`           | Source files minus tests/snapshots/configs | Built from `default` + `defaultExcludes` + `buildOutputExcludes` |
| `tsDeclarations`       | `.d.ts` from direct dependencies           | `transitive: false` — only direct deps                           |
| `jsOutputs`            | `.js` from direct dependencies             | Used by `build:umd` which bundles from `dist/`                   |
| `allTransitiveOutputs` | All outputs, transitively                  | Used by `pack` (needs the full dependency tree)                  |
| `tsDefaults`           | Standard TS compilation inputs             | Available for project-level overrides                            |
| `sharedGlobals`        | Root esbuild/tsconfig files                | Changes to these invalidate all builds                           |
| `buildOutputExcludes`  | Excludes `dist/` from project files        | Prevents output files from being counted as inputs               |

### Dependency output inputs (`dependentTasksOutputFiles`)

These control what output files from upstream packages are included in a target's cache key:

```json
"tsDeclarations": [
  { "dependentTasksOutputFiles": "**/*.d.ts", "transitive": false }
],
"jsOutputs": [
  { "dependentTasksOutputFiles": "**/*.js", "transitive": false }
],
"allTransitiveOutputs": [
  { "dependentTasksOutputFiles": "**/*.*", "transitive": true }
]
```

**`transitive: false`** is critical for most targets — it means only direct dependency outputs are hashed, not the entire transitive tree. Setting `transitive: true` when you only need direct deps causes massive over-invalidation. In practice, `transitive: true` is typically only needed for the `pack` target (which genuinely needs the full tree to detect changes in deep dependencies).

### What to audit

1. **Are `namedInputs` defined and used consistently?** The most common mistake is targets that use the default `{projectRoot}/**/*`, which includes test files, snapshots, and dist output.
2. **Does `production` exclude test files and build outputs?** Check for patterns like `!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)` and `!{projectRoot}/dist/**`.
3. **Are `externalDependencies` declared?** Pin `npm:typescript` and `npm:esbuild` as inputs to build targets.
4. **Is `transitive: false` used on `dependentTasksOutputFiles`?** Only use `transitive: true` for targets that genuinely need the full dependency tree (e.g., `pack`).

---

## Cache-enabled vs cache-disabled targets

### Recommended defaults

**Cached (`cache: true`):**

-   `build` / `build:types` / `build:package` / `build:umd` / `build:test`
-   `lint` / `lint:eslint` / `lint:depcruise` / `lint:circular`
-   `test` / `e2e` / `pack`
-   `generate-example` / `generate-thumbnail` / `typecheck`
-   `nx:noop` / `nx:run-commands` / `nx:run-script` (via targetDefaults)

**Uncached (`cache: false`):**

-   `benchmark` — fresh runs needed for accurate measurements
-   `website:build` — Astro has its own cache; double-caching wastes GBs
-   `all:generate` — noop orchestrator, no value in caching

### What to audit

1. **Is `cache: true` the default for `nx:run-commands`?** Without this, every shell command target is uncached by default.
2. **Are any build/lint/test targets accidentally uncached?** Search `project.json` files for `"cache": false` and verify each is intentional.
3. **Are noop aggregator targets cached?** `nx:noop` with `cache: true` and `inputs: [], outputs: []` is essentially free.
4. **Is the website/SSG build cache disabled?** Frameworks like Astro/Next.js have their own caching. Double-caching wastes disk and the Nx cache often can't correctly track SSG outputs.

---

## Output declarations

Every cached target must declare its `outputs` so Nx knows what to store and restore.

### Output declaration patterns

```json
"build:types":   { "outputs": ["{options.outputPath}"] }     // → dist/types
"build:package": { "outputs": ["{options.outputPath}"] }     // → dist/package
"build:umd":     { "outputs": ["{options.outputPath}"] }     // → dist/umd
"build:test":    { "outputs": ["{projectRoot}/dist/test"] }
"lint":          { "outputs": [] }                           // lint has no outputs
"test":          { "outputs": [] }                           // test has no outputs
```

### What to audit

-   **Are `outputs` declared for every cached target?** Missing outputs means Nx caches "nothing" — the target runs, produces files, but restoring from cache doesn't restore those files.
-   **Do outputs use `{options.outputPath}` or `{projectRoot}/dist/...`?** The former is more DRY when the executor already defines `outputPath`.

---

## Other cache settings

### `useLegacyCache: false`

Ensures the newer, more efficient cache format is used. Peer repos should verify this is set.

### `.nxignore`

Controls what Nx includes in its project graph and formatting scope. Without it, Nx may discover spurious projects in vendored directories, treat generated files as inputs, or attempt to format files without Prettier parsers.

Typical exclusions: diff output directories, generated benchmark files, patch infrastructure, external prompt directories, and shell/patch files.

---

## Nx references

-   [Nx input types reference](https://nx.dev/docs/reference/inputs) — named inputs, `dependentTasksOutputFiles`, external dependencies
-   [How caching works](https://nx.dev/docs/concepts/how-caching-works)
-   [Cache task results](https://nx.dev/docs/features/cache-task-results)
-   [Reduce repetitive configuration](https://nx.dev/docs/guides/tasks--caching/reduce-repetitive-configuration)
