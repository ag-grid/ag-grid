## Ambiguity and confidence

**NEVER guess:** This is the number one rule; if requirements, facts or details are ambiguous it is much better to admit this and ask for guidance (with context on why the ambiguity where possible) or do more research to ground things out, than to guess with a risk of being wrong.

## AI Agent Instructions

This file provides guidance to AI Agents when working with code in this repository.

### Quick Reference

- **Main branch:** `latest`
- **Format:** `yarn nx format --sort-root-tsconfig-paths=false` (run before commits)
- **Pre-commit checks:** `./checks.sh` — the preferred gate: type-check + lint + spec type-check across every project in one parallel, cache-aware Nx run. Much faster than chaining separate `yarn nx build:types` / `yarn nx lint` calls.
- **Type-check (single package):** `yarn nx build:types <package>`
- **Lint (single package):** `yarn nx lint <package>`
- **Build:** `yarn nx build <package>`
- **Test:** `./behave.sh` (whole unit suite — package + behavioural — via the Vitest workspace). Single project: `./behave.sh --project <name>` (e.g. `ag-grid-community`, `behavioural`).
- **E2E:** `yarn nx e2e ag-grid-docs`
- **Dev server:** `yarn nx dev` (launches on https://localhost:4610/, check if it is already running before trying to run it)
- **NX daemon:** Always use `NX_DAEMON=false` for nx commands to avoid pipe hangs (set automatically via SessionStart hook)

### Content Locations

- **Plugin marketplace:** Shared skills, subagents, commands, and guides are delivered via Claude Code plugins from [`ag-grid/ag-dev-prompts`](https://github.com/ag-grid/ag-dev-prompts) — `ag-core`, `ag-prodeng`, and `ag-grid` (enabled in `.claude/settings.json`). Invoke with the plugin prefix, e.g. `/ag-prodeng:pr-review`, `/ag-core:recall`.
- **Local overrides:** `.rulesync/` tracks repo-specific content that layers on top of the plugins. See the allowlist in `.rulesync/.gitignore` for what's tracked.
- **Generated tool configs:** `./external/ag-shared/scripts/setup-prompts/setup-prompts.sh` (run at `yarn` time, safe to re-run by hand, no network needed) stages plugin content into `.rulesync/` and regenerates `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.github/` and `AGENTS.md`. `CLAUDE.md` is a symlink to `AGENTS.md`, so it needs no separate edit. Never hand-edit any of those — change the matching `.rulesync/rules/*.md` and re-run that script.

---

### Must-Know Checklist

- **Yarn and Nx based repo:** Use Yarn for package management and Nx for build and test orchestration.
- **Main constraint:** Community and enterprise runtime bundles stay dependency-free beyond AG Grid code.
- **Default branch:** Target `latest`; follow release/JIRA naming conventions below for topic branches.
- **Build monitoring:** Check `node_modules/.cache/ag-watch-status.json` to monitor watch state (`yarn nx dev`) and build health (see [Development Server Guide](.rulesync/rules/dev-server.md)).
- **Self-review before committing:** Re-read your changes as if reviewing someone else's PR and verify: each new function/class has a single clear responsibility; names are meaningful; no unnecessary complexity; no copy-pasted logic that should be extracted; new code follows the patterns of the surrounding codebase.
- **Formatting:** Run `yarn nx format --sort-root-tsconfig-paths=false` from the repo root before proposing commits.
- **Typechecking and linting:** Run `./checks.sh` from the repo root before proposing commits — never chain separate `yarn nx build:types` / `yarn nx lint` invocations for the standard gate, as each one re-pays Nx startup and forces the tasks to run serially.
- **Batch Nx work into one invocation:** Whenever more than one target or project is needed, use a single `nx run-many -t <targets> -p <projects> --parallel=<n>` instead of issuing commands one at a time. Every extra `yarn nx …` re-pays Nx startup and project-graph computation, and serialises tasks that Nx would otherwise run concurrently — this applies to builds and any other target, not just the pre-commit gate.
- **Baseline verification:** Expect to run `./behave.sh` (the merged unit suite) and `yarn nx e2e ag-grid-docs` after meaningful grid changes.
- **Test verification patterns:** When writing or modifying tests, review similar tests to ensure consistent verification patterns (see [Testing Guide](.rulesync/rules/testing.md)).
- **Context docs:** Skim [technology-stack.md](.rulesync/rules/technology-stack.md) for stack or architectural decisions before introducing new patterns.

### Tooling Health Check

On the **first response** of a conversation, verify that project skills are available by checking the system-reminder skill list. If **any** of the canary skills are missing, display a one-time warning before doing anything else. Do not repeat the warning on subsequent responses.

**Canary skills:** `example`, `dev-server`, `debug-trace`, `git-conventions`, `jira`

**Warning to display (if any canary skill is missing):**

> **Agentic tooling is not initialised.** Expected skills (example, dev-server, debug-trace, git-conventions, jira) are missing or incomplete. Run `yarn` from the repository root to set up AI tooling configuration, then restart your session. If you are in a worktree, ensure you ran `yarn` in the worktree directory (not just the main checkout).

Continue assisting the user after displaying the warning.

### Specialized Guides

For detailed information on specific topics, consult these guides:

- **[Testing Guide](.rulesync/rules/testing.md)** - Testing strategies, best practices, and philosophy
- **[Examples Guide](.rulesync/rules/examples.md)** - Working with examples, validation, and path mappings
- **[Documentation Pages Guide](.rulesync/rules/docs-pages.md)** - Creating consistent, high-quality documentation pages
- **[JIRA Guide](.rulesync/rules/jira.md)** - JIRA ticket search and creation guidelines
- **[Code Quality Guide](.rulesync/rules/code-quality.md)** - Code bloat avoidance, comments, and review practices
- **[Development Server Guide](.rulesync/rules/dev-server.md)** - Dev server setup and build watch monitoring
- **[Benchmarks Guide](.rulesync/rules/benchmarks.md)** - Running and creating performance benchmarks

### Project Overview

AG Grid is a sophisticated TypeScript monorepo providing a high-performance data grid component with both community (MIT) and enterprise (commercial) versions. Built with Nx, it supports React, Angular, and Vue 3 frameworks.

### Technology Stack

For detailed information about preferred technologies and architectural constraints, see [Technology Stack](.rulesync/rules/technology-stack.md).

**Key Constraint:** The main AG Grid libraries must have ZERO third-party runtime dependencies.

### Repository Conventions

- The main branch of this repo is `latest`
- Release branch names are of the form `b33.0.0`
- JIRA-related branch should be named of the form `ag-12345/${kebabCaseChangeSummary}`
- **Language conventions:** UK/British English for documentation text, comments, and JSDocs; US English for API option names

### Essential Commands

- `yarn install` – install dependencies after cloning or when the Yarn lockfile changes.
    - `./external/ag-shared/scripts/install-for-cloud/install-for-cloud.sh` – install dependencies and tooling in a remote environment - use this in preference to `yarn install` to ensure all global tools are installed.
- `yarn nx clean` – purge all dist folders when switching branches or before packaging releases.
- `yarn nx format --sort-root-tsconfig-paths=false` – format repo files; run from the project root before committing.
- `./checks.sh` – the standard pre-commit gate: `build:types`, `lint` and `build:test` across every project that defines them, in one parallel Nx run. Matches CI's lint coverage. Silent on success, prints failing task output otherwise.
- `./checks.sh --projects <a,b>` / `--targets <x,y>` – narrow the gate to specific projects or targets.
- `./checks.sh --fresh` – bypass the Nx cache; `--verbose` – print task output even when passing.
- `yarn nx build <package>` – compile a specific package after code edits.
- `yarn nx build:types <package>` – regenerate declaration files when touching exported APIs.
- `yarn nx build:package <package>` – create ESM/CJS bundles to validate publishable output.
- `yarn nx build:umd <package>` – produce UMD bundles for browser distribution smoke-tests.
- `yarn nx run-many -t build` – rebuild all packages when changes span the dependency graph.
- `yarn nx run-many -t <targets> -p <projects> --parallel=<n>` – the preferred way to run any combination of targets/projects; always favour one batched call over several sequential `yarn nx` invocations.
- `./behave.sh` – run the merged unit suite (package unit tests + behavioural) via the Vitest workspace; the single primary test command.
- `./behave.sh "<file-pattern>"` – filter to matching test files across every project.
- `./behave.sh "<file-pattern>" -t "<test-name>"` – run a specific test by name.
- `./behave.sh --project <name>` – run only chosen project(s); `--project all` runs every workspace project (incl. docs, ag-website-shared).
- `./behave.sh --watch` – run in watch mode.
- `./behave.sh --update-grid-rows` – update GridRows inline snapshots after diagram format changes.
- `./behave.sh --update-grid-rows "<pattern>"` – update snapshots in matching test files only.
- `./behave.sh --update-grid-rows=dry` – dry run, shows what would change without writing files.
- `./benches.sh` – run behavioural benchmarks (real headless Chromium by default; non-watch). Run `./benches.sh --help` for full usage.
- `./benches.sh "<file-pattern>"` – run benchmarks matching a file pattern.
- `./benches.sh "<file-pattern>" -t "<bench-name>"` – run a specific benchmark by name.
- `./benches.sh --profile "<file-pattern>"` – node run with a V8 CPU profile (`.cpuprofile`) for method-cost analysis.
- `./benches.sh --bench-compare <base|test|compare|all|backup> [...]` – baseline/compare benchmark runs (forwards to `bench-compare.mjs`).
- `./benches.sh --watch` – run benchmarks in watch mode.
- `yarn nx test <package>` – run one package's Vitest unit tests on their own (retrocompat; `./behave.sh` already covers them).
- `yarn nx test <package> -- "<file-pattern>"` – run unit tests in files matching a pattern (forwarded to `vitest run`).
- `yarn nx test <package> -- "<file-pattern>" -t "<test-name>"` – run a specific test by name within matching files. Vitest uses positional patterns and `-t`, not jest's `--testPathPattern`/`--testNamePattern`.
- `./docs-e2e.sh` – run docs Playwright E2E tests directly, bypassing Nx (chromium by default).
- `./docs-e2e.sh "<file-pattern>"` – run E2E tests matching a file pattern.
- `./docs-e2e.sh "<file-pattern>" --grep "<test-name>"` – run a specific E2E test by name.
- `./docs-e2e.sh --all-browsers` – run E2E tests across chromium, firefox, and webkit.
- `./docs-e2e.sh --framework <name>` – run E2E tests with a specific framework (e.g. react, angular, vue).
- `./docs-e2e.sh --ui` – open Playwright UI mode.
- `yarn nx e2e <package>` – run Playwright flows via Nx when altering website behaviour.
- `yarn nx lint <package>` – apply ESLint and custom rules before final review.
- `yarn nx lint:jscpd all` – check duplicate code against `.jscpd-baseline.json`; part of `yarn nx lint` and `./checks.sh`.
- `yarn nx lint:jscpd:baseline all` – regenerate the duplicate-code baseline after a deliberate change.

### Slash Commands

Run rulesync commands via slash notation:

- `/ag-prodeng:pr-review` - Review pull requests
- `/ag-prodeng:code-fixup` - Fix build and lint errors
- `/ag-prodeng:batch-lint-cleanup` - ESLint auto-fix tool
- `/ag-prodeng:git-split` - Split large files preserving git history
- `/ag-prodeng:git-bisect` - Find commits that introduced issues
- `/ag-core:remember` - Save branch context or project learnings as memory
- `/ag-core:recall` - Load branch context and browse project memory
- `/ag-prodeng:docs-review` - Review documentation pages for technical accuracy (auto-detects ag-grid; product config at `plugins/ag-prodeng/skills/docs-review/ag-grid/config.md`)
- `/ag-prodeng:release-docs-review` - Review all documentation changes between releases

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

#### Testing

For comprehensive testing information, see [Testing Guide](.rulesync/rules/testing.md).

**Behavioural tests are the primary test suite.** When verifying grid changes, run `./behave.sh` — it runs the behavioural suite and the package unit tests together in one Vitest workspace. Key testing tools:

- **Behavioural tests** (primary): `testing/behavioural/` for grid behaviour verification — use Vitest
- **Package unit tests**: Vitest with jsdom environment, co-located in `packages/*/src` (`testing/angular-tests` still uses Jest)
- **Merged runner**: `./behave.sh` runs both of the above via the `vitest.workspace.ts` workspace
- **E2E tests**: Playwright for website interaction testing
- **Accessibility tests**: `testing/accessibility/` for a11y compliance
- **Performance tests**: `testing/performance/` for performance regression testing

#### Code Quality

For shared code quality guidelines, see [Code Quality Guide](.rulesync/rules/code-quality.md).

Essential practices:

- Run `yarn nx format --sort-root-tsconfig-paths=false` before committing
- Self-review your changes before proposing commits
- Ensure tests exercise real implementations, not test helpers

#### Duplicate and Unused Code Detection

Two static-analysis tools run inside `yarn nx lint`. They cover different problems:

- **knip** — unused files, exports and dependencies.
- **jscpd** — copy-pasted or structurally duplicated code blocks.

Run jscpd on its own with `yarn nx lint:jscpd all`. Regenerate the baseline with `yarn nx lint:jscpd:baseline all` and commit the result.

Both the scan and the gate are scoped to `packages/ag-grid-community/src/**`, `packages/ag-grid-enterprise/src/**` and `packages/ag-stack/src/**` — the grid cores and the shared code bundled into them, where duplication costs users bundle bytes. `ag-stack` is in scope so that a helper reinvented in a core that already exists there gets caught. The check fails only when duplication increases against `.jscpd-baseline.json`. Existing duplication does not block PRs.

It stops there on purpose. Duplication elsewhere either ships to nobody (docs, build scripts, test utilities, config) or is not something a developer can extract: the framework wrappers are largely generated property and import lists, and sibling locale files duplicate each other by nature (`pt-BR` ↔ `pt-PT`, `zh-HK` ↔ `zh-TW`), so a repo-wide scan would fail routine translation work. Everything outside the two cores is excluded by `ignore` globs in `.jscpd.json`, with `gate.scope` as the backstop. Widening coverage means changing both — the `ignore` globs and `gate.scope` in the baseline (and `SCAN_ROOT` in `scripts/ci/jscpd-baseline-check.mjs` to leave `packages`).

`**/_examples/**` is excluded from the scan entirely, because docs examples are per-framework variants of the same code.

**The fix for a jscpd failure is to extract the shared code, not to widen `ignore` in `.jscpd.json`.** Update the baseline only when the increase is deliberate.

Limitation: the baseline stores aggregate counts plus a fingerprint per gated clone, so a change that removes one clone and adds another of the same size passes.

#### AG Grid Coding Style

Layered on the shared code-quality guide; enforced by ESLint plus team preferences.

- Always use braces for `if/else/for/while/do`.
- Cache repeated field access in a local — performance requirement.
- Canonical array loop: `for (let i = 0, len = a.length; i < len; ++i)`. No `Array.forEach`. `Map.forEach` is fine.
- No lonely `if` — use guard returns, `if/else if`, or ternaries. Applies to loops too.
- No nested ternaries — extract to a named variable.
- No short-circuit side effects (`cond && fn()`). No assignments in expressions.
- No `for...in`. Use `Object.keys()` + index loops; prefer `Object.keys()` over `Object.entries()` when values aren't needed.
- No static class properties — use module-level constants.
- Explicit access modifiers on every class member; `readonly` when not reassigned.
- Destructure only for 2+ fields; single field uses dot access.
- `import type` for compile-time-only imports; separate `import type { Foo }` statements, no inline `{ type Foo, Bar }`.

#### Styling

The grid is in transition from Legacy Themes (.scss files written in Sass under `/community-modules/styles/`) to the Theming API (.css written in modern nested CSS under `/packages/`).

While this transition is in progress, changes made to Theming API should be applied to Legacy Themes. When reviewing a PR with changes to the Theming API CSS, if the same PR does not have corresponding changes to Legacy Themes, this should be flagged as a P1 level issue.

### Common Development Tasks

#### Quick Playbooks

- **Bug fix or feature work (community/enterprise)**
    1. Update the affected implementation (typically under `packages/ag-grid-*/src/`).
    2. Sync any dependent docs/examples.
    3. Run `./behave.sh` (the merged unit suite) and `./checks.sh` (types + lint).

- **Documentation/content update**
    1. Consult the [Documentation Pages Guide](.rulesync/rules/docs-pages.md) for structure and patterns.
    2. Modify the relevant content under `documentation/ag-grid-docs/`.
    3. Create or update examples in `_examples/` folder following the [Examples Guide](.rulesync/rules/examples.md).
    4. Ensure all examples are framework-compatible.
    5. Test page in dev server with `yarn nx dev` across all frameworks.
    6. For significant doc changes, sanity-check with `yarn nx e2e ag-grid-docs`.

- **Example-only change** (see [Examples Guide](.rulesync/rules/examples.md))
    1. Edit the example files.
    2. Mirror updates in the corresponding docs page.
    3. Run the relevant generation/typecheck commands.

### Technical Requirements

- **Node.js**: Check `.nvmrc` for version
- **Package Manager**: Yarn
- **Build Target**: ES2020
- **TypeScript**: Strict mode enabled across all packages

### JIRA Tickets

For JIRA ticket guidelines, see [JIRA Guide](.rulesync/rules/jira.md).

When creating tickets for this repo, use component `Grid` instead of `Charts`.

### Documentation Resources

- AG Grid documentation: https://ag-grid.com/documentation/
