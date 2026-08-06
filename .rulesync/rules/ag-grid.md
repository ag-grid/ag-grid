---
root: true
targets: ['*']
description: 'AG Grid project overview and development guidelines'
globs: ['**/*']
---

## Ambiguity and confidence

**NEVER guess:** This is the number one rule; if requirements, facts or details are ambiguous it is much better to admit this and ask for guidance (with context on why the ambiguity where possible) or do more research to ground things out, than to guess with a risk of being wrong.

## AI Agent Instructions

This file provides guidance to AI Agents when working with code in this repository.

### Quick Reference

- **Main branch:** `latest`
- **Format:** `yarn nx format --sort-root-tsconfig-paths=false` (run before commits)
- **Pre-commit checks:** `./checks.sh` — the preferred gate: type-check + lint + spec type-check across every project in one parallel, cache-aware Nx run. Much faster than chaining separate `yarn nx build:types` / `yarn nx lint` calls.
- **Test:** `./behave.sh` (whole unit suite — package + behavioural — via the Vitest workspace). Single project: `./behave.sh --project <name>` (e.g. `ag-grid-community`, `behavioural`).
- **Benchmarks:** `./benches.sh` (behavioural benchmarks in headless Chromium).
- **E2E:** `./docs-e2e.sh` (Playwright against the docs site; the Nx target is `test:e2e`, not `e2e`).
- **Build:** `yarn nx build <package>`; types only: `yarn nx build:types <package>`.
- **Dev server:** `yarn nx dev` (launches on https://localhost:4610/, check if it is already running before trying to run it)
- **NX daemon:** Always use `NX_DAEMON=false` for nx commands to avoid pipe hangs (set automatically via SessionStart hook)

Each script takes `--help`. Full flag reference lives in the guides below rather than here: test and E2E flags in the Testing Guide, benchmark and profiling flags in the Benchmarks Guide.

### Content Locations

- **Plugin marketplace:** Shared skills, subagents, commands, and guides are delivered via Claude Code plugins from [`ag-grid/ag-dev-prompts`](https://github.com/ag-grid/ag-dev-prompts) — `ag-core`, `ag-prodeng`, and `ag-grid` (enabled in `.claude/settings.json`). Invoke with the plugin prefix, e.g. `/ag-prodeng:pr-review`, `/ag-core:recall`.
- **Local overrides:** `.rulesync/` tracks repo-specific content that layers on top of the plugins. See the allowlist in `.rulesync/.gitignore` for what's tracked.
- **Generated tool configs:** `./external/ag-shared/scripts/setup-prompts/setup-prompts.sh` (run at `yarn` time, safe to re-run by hand, no network needed) stages plugin content into `.rulesync/` and regenerates `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.github/` and `AGENTS.md`. `CLAUDE.md` is a symlink to `AGENTS.md`, so it needs no separate edit. Never hand-edit any of those — change the matching `.rulesync/rules/*.md` and re-run that script.

---

### Must-Know Checklist

- **Yarn and Nx based repo:** Use Yarn for package management and Nx for build and test orchestration.
- **Main constraint:** Community and enterprise runtime bundles stay dependency-free beyond AG Grid code.
- **Default branch:** Target `latest`; follow release/JIRA naming conventions below for topic branches.
- **Build monitoring:** Check `node_modules/.cache/ag-watch-status.json` to monitor watch state (`yarn nx dev`) and build health — load the `/ag-eng:dev-server` skill for details.
- **Self-review before committing:** Re-read your changes as if reviewing someone else's PR and verify: each new function/class has a single clear responsibility; names are meaningful; no unnecessary complexity; no copy-pasted logic that should be extracted; new code follows the patterns of the surrounding codebase.
- **Formatting, typechecking and linting:** Run `yarn nx format --sort-root-tsconfig-paths=false` then `./checks.sh` from the repo root before proposing commits. Never chain separate `yarn nx build:types` / `yarn nx lint` invocations for the standard gate — each one re-pays Nx startup and forces the tasks to run serially.
- **Batch Nx work into one invocation:** Whenever more than one target or project is needed, use a single `nx run-many -t <targets> -p <projects> --parallel=<n>` instead of issuing commands one at a time. Every extra `yarn nx …` re-pays Nx startup and project-graph computation, and serialises tasks that Nx would otherwise run concurrently — this applies to builds and any other target, not just the pre-commit gate.
- **Baseline verification:** Expect to run `./behave.sh` (the merged unit suite) and `./docs-e2e.sh` after meaningful grid changes.
- **Test verification patterns:** When writing or modifying tests, review similar tests to ensure consistent verification patterns (see the Testing Guide).
- **Context docs:** Load the `/technology-stack` skill for stack or architectural decisions before introducing new patterns.

### Tooling Health Check

On the **first response** of a conversation, verify that project skills are available by checking the system-reminder skill list. If **any** of the canary skills are missing, display a one-time warning before doing anything else. Do not repeat the warning on subsequent responses.

**Canary skills:** `example`, `dev-server`, `debug-trace`, `git-conventions`, `jira`

**Warning to display (if any canary skill is missing):**

> **Agentic tooling is not initialised.** Expected skills (example, dev-server, debug-trace, git-conventions, jira) are missing or incomplete. Run `yarn` from the repository root to set up AI tooling configuration, then restart your session. If you are in a worktree, ensure you ran `yarn` in the worktree directory (not just the main checkout).

Continue assisting the user after displaying the warning.

### Specialized Guides

Glob-scoped rules load automatically when you touch matching files; the skills below are on-demand.

| Topic | Where |
| ----- | ----- |
| Testing strategies and Vitest patterns | `.rulesync/rules/testing.md` + `/testing` skill |
| Examples, validation, path mappings | `.rulesync/rules/examples.md` |
| Documentation pages | `.rulesync/rules/docs-pages.md` |
| Grid source conventions | `.rulesync/rules/grid-code-conventions.md` |
| Shared code quality practices | `.rulesync/rules/code-quality.md` |
| Benchmarks | `.rulesync/rules/benchmarks.md` |
| Technology stack and constraints | `/technology-stack` skill |
| Dev server and build watch | `/ag-eng:dev-server` skill |
| JIRA tickets | `/ag-product:jira` skill |
| Git branches, commits, PRs | `/ag-eng:git-conventions` skill |

### Project Overview

AG Grid is a sophisticated TypeScript monorepo providing a high-performance data grid component with both community (MIT) and enterprise (commercial) versions. Built with Nx, it supports React, Angular, and Vue 3 frameworks.

**Key Constraint:** The main AG Grid libraries must have ZERO third-party runtime dependencies. Load the `/technology-stack` skill for the full set of architectural constraints.

### Repository Conventions

- The main branch of this repo is `latest`
- Release branch names are of the form `b33.0.0`
- JIRA-related branch should be named of the form `ag-12345/${kebabCaseChangeSummary}`
- **Language conventions:** UK/British English for documentation text, comments, and JSDocs; US English for API option names

### Architecture

#### Monorepo Structure

- **packages/ag-grid-community/**: MIT licensed version - core grid functionality
- **packages/ag-grid-enterprise/**: Commercial version with advanced features
- **packages/ag-grid-react/angular/vue3/**: Framework wrappers
- **community-modules/locale/**: Internationalization support
- **community-modules/styles/**: Grid styling and themes
- **documentation/ag-grid-docs/**: Astro documentation site
- **testing/**: E2E, behavioural, accessibility, and performance tests
- **plugins/**: Nx plugins for code generation
- **external/**: Shared AG ecosystem code (ag-shared)

#### Build Dependencies

Core dependency chain: `ag-grid-community` → `ag-grid-enterprise` → framework wrappers

#### Key Patterns

- **Virtual DOM rendering**: High-performance custom rendering engine
- **Modular feature architecture**: Extensible grid features through module registration
- **Framework agnostic core**: Clean separation with framework-specific wrappers
- **Enterprise/community split**: Feature flagging through separate packages

### Development Workflow

**Behavioural tests are the primary test suite.** `testing/behavioural/` verifies grid behaviour as a black box; package unit tests are co-located in `packages/*/src`. `./behave.sh` runs both together through the Vitest workspace. The Testing Guide covers layer choice, async waiting patterns, and snapshots.

**Bug fix or feature work:** update the implementation (typically `packages/ag-grid-*/src/`), sync dependent docs and examples, then run `./behave.sh` and `./checks.sh`. Docs and example workflows are covered by the docs-pages and examples rules, which load when you touch those trees.

### Technical Requirements

- **Node.js**: Check `.nvmrc` for version
- **Package Manager**: Yarn
- **Build Target**: ES2020 (`tsconfig.base.json`); `lib` is ES2022. Runtime API availability follows the browser-support policy, not this target.
- **TypeScript**: Strict mode enabled across all packages

### JIRA Tickets

Load the `/ag-product:jira` skill for ticket guidelines. When creating tickets for this repo, use component `Grid` instead of `Charts`.

### Documentation Resources

- AG Grid documentation: https://ag-grid.com/documentation/
