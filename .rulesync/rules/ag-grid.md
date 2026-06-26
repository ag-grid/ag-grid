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
- **Type-check:** `yarn nx build:types <package>` (run before commits)
- **Lint:** `yarn nx lint <package>` (run before commits)
- **Build:** `yarn nx build <package>`
- **Test:** `yarn nx test <package>`
- **E2E:** `yarn nx e2e ag-grid-docs`
- **Dev server:** `yarn nx dev` (launches on https://localhost:4610/, check if it is already running before trying to run it)
- **NX daemon:** Always use `NX_DAEMON=false` for nx commands to avoid pipe hangs (set automatically via SessionStart hook)

### Content Locations

- **Plugin marketplace:** Shared skills, subagents, commands, and guides are delivered via Claude Code plugins from [`ag-grid/ag-dev-prompts`](https://github.com/ag-grid/ag-dev-prompts) — `ag-core`, `ag-prodeng`, and `ag-grid` (enabled in `.claude/settings.json`). Invoke with the plugin prefix, e.g. `/ag-prodeng:pr-review`, `/ag-core:recall`.
- **Local overrides:** `.rulesync/` tracks repo-specific content that layers on top of the plugins. See the allowlist in `.rulesync/.gitignore` for what's tracked.
- **Generated tool configs:** `setup-prompts.sh` (run at `yarn` time) stages plugin content into `.rulesync/` and regenerates `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.github/`, `AGENTS.md`, and `CLAUDE.md`. Never hand-edit those — edit `.rulesync/` and re-run.

---

### Must-Know Checklist

- **Yarn and Nx based repo:** Use Yarn for package management and Nx for build and test orchestration.
- **Main constraint:** Community and enterprise runtime bundles stay dependency-free beyond AG Grid code.
- **Default branch:** Target `latest`; follow release/JIRA naming conventions below for topic branches.
- **Build monitoring:** Check `node_modules/.cache/ag-watch-status.json` to monitor watch state (`yarn nx dev`) and build health (see [Development Server Guide](.rulesync/rules/dev-server.md)).
- **Self-review before committing:** Re-read your changes as if reviewing someone else's PR and verify: each new function/class has a single clear responsibility; names are meaningful; no unnecessary complexity; no copy-pasted logic that should be extracted; new code follows the patterns of the surrounding codebase.
- **Formatting:** Run `yarn nx format --sort-root-tsconfig-paths=false` from the repo root before proposing commits.
- **Typechecking:** Run `yarn nx build:types <package>` from the repo root before proposing commits.
- **Linting:** Run `yarn nx lint <package>` from the repo root before proposing commits.
- **Baseline verification:** Expect to run `yarn nx test ag-grid-community`, `yarn nx test ag-grid-enterprise`, and `yarn nx e2e ag-grid-docs` after meaningful grid changes.
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
- `yarn nx build <package>` – compile a specific package after code edits.
- `yarn nx build:types <package>` – regenerate declaration files when touching exported APIs.
- `yarn nx build:package <package>` – create ESM/CJS bundles to validate publishable output.
- `yarn nx build:umd <package>` – produce UMD bundles for browser distribution smoke-tests.
- `yarn nx run-many -t build` – rebuild all packages when changes span the dependency graph.
- `./behave.sh` – run behavioural tests in `testing/behavioural/` (primary test suite, uses Vitest).
- `./behave.sh "<file-pattern>"` – run specific behavioural test file.
- `./behave.sh "<file-pattern>" -t "<test-name>"` – run specific behavioural test by name.
- `./behave.sh --watch` – run behavioural tests in watch mode.
- `./behave.sh --update-grid-rows` – update GridRows inline snapshots after diagram format changes.
- `./behave.sh --update-grid-rows "<pattern>"` – update snapshots in matching test files only.
- `./behave.sh --update-grid-rows=dry` – dry run, shows what would change without writing files.
- `./benches.sh` – run behavioural benchmarks (real headless Chromium by default; non-watch). Run `./benches.sh --help` for full usage.
- `./benches.sh "<file-pattern>"` – run benchmarks matching a file pattern.
- `./benches.sh "<file-pattern>" -t "<bench-name>"` – run a specific benchmark by name.
- `./benches.sh --profile "<file-pattern>"` – node run with a V8 CPU profile (`.cpuprofile`) for method-cost analysis.
- `./benches.sh --bench-compare <base|test|compare|all|backup> [...]` – baseline/compare benchmark runs (forwards to `bench-compare.mjs`).
- `./benches.sh --watch` – run benchmarks in watch mode.
- `yarn nx test <package>` – run the package's Vitest unit tests.
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

**Behavioural tests are the primary test suite.** When verifying grid changes, run behavioural tests first. Key testing tools:

- **Behavioural tests** (primary): `testing/behavioural/` for grid behaviour verification — use Vitest
- **Unit tests**: Vitest with jsdom environment for package-level tests (`testing/angular-tests` still uses Jest)
- **E2E tests**: Playwright for website interaction testing
- **Accessibility tests**: `testing/accessibility/` for a11y compliance
- **Performance tests**: `testing/performance/` for performance regression testing

#### Code Quality

For shared code quality guidelines, see [Code Quality Guide](.rulesync/rules/code-quality.md).

Essential practices:

- Run `yarn nx format --sort-root-tsconfig-paths=false` before committing
- Self-review your changes before proposing commits
- Ensure tests exercise real implementations, not test helpers

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
    3. Run `yarn nx test ag-grid-community`, `yarn nx test ag-grid-enterprise`.

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
