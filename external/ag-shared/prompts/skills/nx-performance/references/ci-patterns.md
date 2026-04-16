# CI Patterns Reference

## GHA cache strategy

AG product monorepos manage three layers of caching in CI via a `setup-nx` composite action:

### Layer 1: node_modules

```
Key: yarn.lock + patches/*.patch + all package.json files
Fallback: prefix restore (any matching yarn.lock)
Release branches: release-{branch}-{hash}
```

Using only `yarn.lock` misses changes to workspace `package.json` files (new scripts, resolutions). Include all `package.json` files in the key.

### Layer 2: Nx task cache

```
Key: yarn.lock + package.json hashes + github.sha
Prefix restore: partial cache hits from prior commits
Tidy step: prune stale entries before save
```

GHA caches have a 10 GB limit. Pruning stale Nx cache entries before saving prevents eviction of valuable entries.

### Layer 3: Build artifacts

```
init job: uploads dist/ + generated examples
e2e jobs: download artifacts — no rebuild needed
```

### Read-only vs read-write modes

-   The `init` job uses read-write — it populates the cache for all downstream jobs.
-   All other jobs (`lint`, `build`, `test`, `e2e`) use read-only — they restore but never write, preventing cache corruption from parallel writes.

### NX_PARALLEL auto-detection

The action sets `NX_PARALLEL` to the CPU count unless already set. CI jobs needing serial execution (e.g., tests with `NX_PARALLEL: 1`) override this explicitly.

### NX_BASE calculation (dynamic affected base)

| Branch type        | NX_BASE value                                 |
| ------------------ | --------------------------------------------- |
| `latest` / `next`  | `{branch}-success` tag                        |
| Release (`b*.*.*`) | `{branch}-success` if exists, else `{branch}` |
| PR                 | `origin/{base_branch}`                        |

The `report` job tags successful CI runs with `{branch}-success`. This means `nx affected` compares against the last _successful_ build, not just the previous commit — ensuring a failed CI run doesn't shift the baseline and mask regressions.

---

## Concurrency control and early exit

### Concurrency groups

```yaml
concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: ${{ github.ref != 'refs/heads/latest' && github.ref != 'refs/heads/next' }}
```

-   PR branches: new pushes cancel in-progress runs (avoids wasted compute).
-   `latest`/`next`: runs are never cancelled (success tag must be set reliably).

### Early exit for non-code PRs

A `detect-changes` job uses `dorny/paths-filter` to check if the PR only touches non-code files. If so, only `lint` runs — all other jobs are skipped.

Code paths: `packages/**`, `libraries/**`, `plugins/**`, `tests/**`, `tools/**`, `external/ag-shared/**`, `*.json`, `*.ts`, `*.js`, `yarn.lock`, `nx.json`.

---

## `affected` vs `run-many` toggle

The CI workflow supports switching between `nx affected` (default) and `nx run-many` (full workspace) via `workflow_dispatch` input. Useful for debugging where `affected` may compute the wrong diff, or for validating a full-workspace build before releases.

---

## Selective GHA caching

The task autogen plugin tags volatile examples with `skip-gha-cache`. CI uses a two-phase strategy:

1. Build all cacheable examples (exclude `tag:skip-gha-cache`)
2. Build volatile examples separately with `--excludeTaskDependencies --skip-nx-cache`

This ensures volatile examples are always rebuilt fresh while cacheable ones benefit from Nx caching.

---

## Test sharding strategy

The CI pipeline dynamically calculates test shard counts based on the number of affected projects.

### Unit test shards

-   **Shard 0** (always created): non-shardable work — tests tagged `no-sharding`, bundle size validation (`size-limit`), package sanity checks (`pack:verify`).
-   **Shards 1-6**: Nx distributes affected test projects using `--shard=N/total`.

### E2E shards

-   Fixed maximum of 16 shards.
-   Playwright distributes test files across shards.

### Framework package tests

Only run on `latest`/release branches or when test files are directly modified.

### Parallelism

`NX_PARALLEL: 1` for test jobs — tests run sequentially within each shard to avoid resource contention.

---

## Artifact-based build output sharing

The `init` job builds all packages and generates all examples, then uploads outputs as a GHA artifact. E2E test shards download this artifact instead of rebuilding.

```yaml
# init job: persist build outputs
- uses: actions/upload-artifact@v4
  with:
      name: e2e-init-outputs
      path: |
          dist/
          packages/*/dist/
          external/*/dist/
          packages/<product>-website/e2e/generated/

# e2e job: restore build outputs
- uses: actions/download-artifact@v4
  with:
      name: e2e-init-outputs
```

---

## Snapshot branch management

Visual regression tests generate image snapshots across sharded test runs. A custom snapshot workflow collects them:

1. `snapshot-prepare` — creates a temporary branch for snapshot updates
2. `snapshot-branch` — each shard commits its snapshot changes
3. `snapshot-notify` — report job checks for updates and notifies via Slack/PR comment

---

## Parallelism control

**Parallel OK:** `build:types`, `build:package`, `lint:eslint`, `generate-example`
**Serial (parallelism: false):** `benchmark` (GC-sensitive), `test:e2e` (Playwright), `test` (GC-exposed Jest)

---

## CI audit checklist

-   [ ] `NX_DAEMON=false` set for CI (avoids daemon startup overhead in ephemeral environments)
-   [ ] `parallelism: false` for CPU-intensive/flaky targets
-   [ ] GHA cache tags used to exclude volatile targets
-   [ ] node_modules cache keyed on `yarn.lock` + `patches/` + all `package.json` files
-   [ ] Nx task cache persisted across CI runs (keyed on `github.sha` with prefix restore)
-   [ ] Read-only/read-write cache split (only one job writes)
-   [ ] `NX_BASE` set to a success tag for `affected` accuracy
-   [ ] Success tagging on green builds
-   [ ] Concurrency control: `cancel-in-progress` for PR branches, never for main
-   [ ] Early exit for non-code PRs
-   [ ] Test sharding with dynamic matrix calculation
-   [ ] Shard 0 reserved for non-shardable work
-   [ ] Build artifacts shared via upload/download
-   [ ] `.nxignore` excludes generated files, patches, and vendored directories
-   [ ] `affected` vs `run-many` toggle available
-   [ ] Bundle size validation target
-   [ ] Pack pipeline includes extraction and verification steps

---

## Nx / GHA references

-   [`nx affected`](https://nx.dev/docs/features/ci-features/affected)
-   [GHA dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching)
-   [`actions/cache`](https://github.com/actions/cache)
-   [`EndBug/latest-tag`](https://github.com/EndBug/latest-tag) — success tagging action
-   [GHA composite actions](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action)
-   [GHA matrix strategy](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow)
-   [Playwright test sharding](https://playwright.dev/docs/test-sharding)
