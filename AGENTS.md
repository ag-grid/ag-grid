# Additional Conventions Beyond the Built-in Functions

As this project's AI coding tool, you must follow the additional conventions below, in addition to the built-in functions.

## AI Agent Instructions

This file provides guidance to AI Agents when working with code in this repository.

### Quick Reference

-   **Main branch:** `latest`
-   **Format:** `yarn nx format` (run before commits)
-   **Type-check:** `yarn nx build:types <package>` (run before commits)
-   **Lint:** `yarn nx lint <package>` (run before commits)
-   **Build:** `yarn nx build <package>`
-   **Test:** `yarn nx test <package>`
-   **E2E:** `yarn nx e2e ag-grid-docs`
-   **Dev server:** `yarn nx dev`

### Content Locations

-   **Rulesync source:** `.rulesync/` (rules, commands, subagents)
-   **Shared prompts:** `external/ag-shared/prompts/` (symlinked into .rulesync)

---

### Must-Know Checklist

-   **Yarn and Nx based repo:** Use Yarn for package management and Nx for build and test orchestration.
-   **Main constraint:** Community and enterprise runtime bundles stay dependency-free beyond AG Grid code.
-   **Default branch:** Target `latest`; follow release/JIRA naming conventions below for topic branches.
-   **Build monitoring:** Check `node_modules/.cache/ag-watch-status.json` to monitor watch state (`yarn nx dev`) and build health (see [Development Server Guide](.rulesync/rules/dev-server.md)).
-   **Formatting:** Run `yarn nx format` from the repo root before proposing commits.
-   **Typechecking:** Run `yarn nx build:types <package>` from the repo root before proposing commits.
-   **Linting:** Run `yarn nx lint <package>` from the repo root before proposing commits.
-   **Baseline verification:** Expect to run `yarn nx test ag-grid-community`, `yarn nx test ag-grid-enterprise`, and `yarn nx e2e ag-grid-docs` after meaningful grid changes.
-   **Test verification patterns:** When writing or modifying tests, review similar tests to ensure consistent verification patterns (see [Testing Guide](.rulesync/rules/testing.md)).
-   **Context docs:** Skim [technology-stack.md](.rulesync/rules/technology-stack.md) for stack or architectural decisions before introducing new patterns.

### Specialized Guides

For detailed information on specific topics, consult these guides:

-   **[Testing Guide](.rulesync/rules/testing.md)** - Testing strategies, best practices, and philosophy
-   **[Examples Guide](.rulesync/rules/examples.md)** - Working with examples, validation, and path mappings
-   **[Documentation Pages Guide](.rulesync/rules/docs-pages.md)** - Creating consistent, high-quality documentation pages
-   **[JIRA Guide](.rulesync/rules/jira.md)** - JIRA ticket search and creation guidelines
-   **[Code Quality Guide](.rulesync/rules/code-quality.md)** - Code bloat avoidance, comments, and review practices
-   **[Development Server Guide](.rulesync/rules/dev-server.md)** - Dev server setup and build watch monitoring
-   **[Benchmarks Guide](.rulesync/rules/benchmarks.md)** - Running and creating performance benchmarks

### Project Overview

AG Grid is a sophisticated TypeScript monorepo providing a high-performance data grid component with both community (MIT) and enterprise (commercial) versions. Built with Nx, it supports React, Angular, and Vue 3 frameworks.

### Technology Stack

For detailed information about preferred technologies and architectural constraints, see [Technology Stack](.rulesync/rules/technology-stack.md).

**Key Constraint:** The main AG Grid libraries must have ZERO third-party runtime dependencies.

### Repository Conventions

-   The main branch of this repo is `latest`
-   Release branch names are of the form `b33.0.0`
-   JIRA-related branch should be named of the form `ag-12345/${kebabCaseChangeSummary}`
-   **Language conventions:** UK/British English for documentation text, comments, and JSDocs; US English for API option names

### Essential Commands

-   `yarn install` – install dependencies after cloning or when the Yarn lockfile changes.
    -   `./external/ag-shared/scripts/install-for-cloud/install-for-cloud.sh` – install dependencies and tooling in a remote environment - use this in preference to `yarn install` to ensure all global tools are installed.
-   `yarn nx clean` – purge all dist folders when switching branches or before packaging releases.
-   `yarn nx format` – format repo files; run from the project root before committing.
-   `yarn nx build <package>` – compile a specific package after code edits.
-   `yarn nx build:types <package>` – regenerate declaration files when touching exported APIs.
-   `yarn nx build:package <package>` – create ESM/CJS bundles to validate publishable output.
-   `yarn nx build:umd <package>` – produce UMD bundles for browser distribution smoke-tests.
-   `yarn nx run-many -t build` – rebuild all packages when changes span the dependency graph.
-   `yarn nx test ag-behavioural-testing --run` – run behavioural tests in `testing/behavioural/` (primary test suite, uses Vitest).
-   `yarn nx test ag-behavioural-testing --run "<file-pattern>"` – run specific behavioural test file.
-   `yarn nx test ag-behavioural-testing --run "<file-pattern>" -t "<test-name>"` – run specific behavioural test by name.
-   `yarn nx test <package>` – execute Jest unit tests for the affected package.
-   `yarn nx test <package> --testPathPattern="<file-name>"` - test specific test file
-   `yarn nx test <package> --testPathPattern="<file-name>" --testNamePattern="<test-name>"` - test specific test name in a specific test file
-   `yarn nx e2e <package>` – run Playwright flows when altering website behaviour.
-   `yarn nx lint <package>` – apply ESLint and custom rules before final review.

### Slash Commands

Run rulesync commands via slash notation:

-   `/pr-review` - Review pull requests
-   `/code-cleanup` - Reduce code bloat and productionize
-   `/code-fixup` - Fix build and lint errors
-   `/batch-lint-cleanup` - ESLint auto-fix tool
-   `/git-split` - Split large files preserving git history
-   `/git-bisect` - Find commits that introduced issues

### Architecture

#### Monorepo Structure

-   **packages/ag-grid-community/**: MIT licensed version - core grid functionality
-   **packages/ag-grid-enterprise/**: Commercial version with advanced features
-   **packages/ag-grid-react/angular/vue3/**: Framework wrappers
-   **community-modules/locale/**: Internationalization support
-   **community-modules/styles/**: Grid styling and themes
-   **documentation/ag-grid-docs/**: Astro documentation site
-   **testing/**: E2E, behavioural, accessibility, and performance tests
-   **plugins/**: Nx plugins for code generation
-   **external/**: Shared AG ecosystem code (ag-shared)

#### Build Dependencies

Core dependency chain: `ag-grid-community` → `ag-grid-enterprise` → framework wrappers

#### Key Patterns

-   **Virtual DOM rendering**: High-performance custom rendering engine
-   **Modular feature architecture**: Extensible grid features through module registration
-   **Framework agnostic core**: Clean separation with framework-specific wrappers
-   **Enterprise/community split**: Feature flagging through separate packages

### Development Workflow

#### Testing

For comprehensive testing information, see [Testing Guide](.rulesync/rules/testing.md).

**Behavioural tests are the primary test suite.** When verifying grid changes, run behavioural tests first. Key testing tools:

-   **Behavioural tests** (primary): `testing/behavioural/` for grid behaviour verification — use Vitest
-   **Unit tests**: Jest with jsdom environment for package-level tests
-   **E2E tests**: Playwright for website interaction testing
-   **Accessibility tests**: `testing/accessibility/` for a11y compliance
-   **Performance tests**: `testing/performance/` for performance regression testing

#### Code Quality

For code quality guidelines, see [Code Quality Guide](.rulesync/rules/code-quality.md).

Essential practices:

-   Run `yarn nx format` before committing
-   Self-review your changes before proposing commits
-   Ensure tests exercise real implementations, not test helpers

#### Styling

The grid is in transition from Legacy Themes (.scss files written in Sass under `/community-modules/styles/`) to the Theming API (.css written in modern nested CSS under `/packages/`).

While this transition is in progress, changes made to Theming API should be applied to Legacy Themes. When reviewing a PR with changes to the Theming API CSS, if the same PR does not have corresponding changes to Legacy Themes, this should be flagged as a P1 level issue.

### Common Development Tasks

#### Quick Playbooks

-   **Bug fix or feature work (community/enterprise)**

    1. Update the affected implementation (typically under `packages/ag-grid-*/src/`).
    2. Sync any dependent docs/examples.
    3. Run `yarn nx test ag-grid-community`, `yarn nx test ag-grid-enterprise`.

-   **Documentation/content update**

    1. Consult the [Documentation Pages Guide](.rulesync/rules/docs-pages.md) for structure and patterns.
    2. Modify the relevant content under `documentation/ag-grid-docs/`.
    3. Create or update examples in `_examples/` folder following the [Examples Guide](.rulesync/rules/examples.md).
    4. Ensure all examples are framework-compatible.
    5. Test page in dev server with `yarn nx dev` across all frameworks.
    6. For significant doc changes, sanity-check with `yarn nx e2e ag-grid-docs`.

-   **Example-only change** (see [Examples Guide](.rulesync/rules/examples.md))
    1. Edit the example files.
    2. Mirror updates in the corresponding docs page.
    3. Run the relevant generation/typecheck commands.

### Technical Requirements

-   **Node.js**: Check `.nvmrc` for version
-   **Package Manager**: Yarn
-   **Build Target**: ES2020
-   **TypeScript**: Strict mode enabled across all packages

### JIRA Tickets

For JIRA ticket guidelines, see [JIRA Guide](.rulesync/rules/jira.md).

When creating tickets for this repo, use component `Grid` instead of `Charts`.

### Documentation Resources

-   AG Grid documentation: https://ag-grid.com/documentation/
