---
targets: ['*']
description: 'Nx project configuration conventions'
globs: ['**/project.json', 'nx.json']
---

# Nx Conventions

## Project Configuration

- In `project.json` files, use `{projectRoot}` to reference paths relative to the project root. Do **not** prefix with `./` — Nx interpolates `{projectRoot}` as a complete relative path from the workspace root (e.g. `tools/ssr-example`), so `{projectRoot}/script.sh` is correct while `./{projectRoot}/script.sh` is invalid.
- To prevent Nx from inferring targets from npm scripts in a `package.json`-only project, set `"nx": {"includedScripts": []}` in the package.json. An empty array suppresses all inferred script targets while keeping the project visible to Nx for dependency tracking.

## The Synthetic "all" Project

Each monorepo has a synthetic project named `all` (typically at `utilities/all/project.json`) that acts as an aggregate orchestrator for monorepo-wide operations.

**How it works:**

- Targets use the `nx:noop` executor with `dependsOn: ["^<target>"]` to cascade operations across all packages without doing any work itself.
- It lists every publishable package in its `implicitDependencies` array, so running a target on `all` triggers that target on every listed package.
- It is set as the `defaultProject` in `nx.json`, so bare commands like `nx run build` or `nx run test` run against `all` and therefore cascade to all packages.

**Key guidance:**

- Do **not** treat `all` as a real, buildable project — it has no meaningful source code.
- Do **not** add source files to it or attempt to import from it.
- Do **not** watch it for changes or add it to file-watcher configurations.
- When you need to run a target for a **specific** package, always specify the project explicitly (e.g. `nx run ag-studio:build`) rather than relying on the default project.
