# Agentic Tooling Crib-Sheet

Quick-reference for all AI agent commands, skills, sub-agents, and rules available in this repo.

## How It Works

| Folder       | Purpose                                                                  | Loaded by              |
| ------------ | ------------------------------------------------------------------------ | ---------------------- |
| `.rulesync/` | Canonical shared source — works across tools (Cursor, Claude Code, etc.) | All supported AI tools |

**Loading behaviour:**

-   **Rules** load automatically based on file-pattern globs (e.g. editing a `.test.ts` file loads the `testing` rule). The root rule (`ag-grid`) loads for all files.
-   **Skills** load on-demand when invoked via `/skill-name`.
-   **Sub-agents** are spawned automatically by the AI when a task matches their speciality.
-   **Commands** are invoked explicitly via `/command-name`.

**Provenance key:**

-   🟢 **Local** — ag-grid specific (normal file in `.rulesync/`)
-   🔵 **Shared** — reusable across AG products (symlink to `external/ag-shared/`)

---

## Everyday Development

| Type    | Name                  | Invoke                  | What it does                                       |
| ------- | --------------------- | ----------------------- | -------------------------------------------------- |
| Command | 🔵 `/code-fixup`      | `/code-fixup <package>` | Fix build and lint errors across a package         |
| Command | 🔵 `/code-cleanup`    | `/code-cleanup`         | Remove bloat, duplication; improve clarity         |
| Command | 🔵 `/pr-create`       | `/pr-create`            | Commit, push, and open a PR                        |
| Command | 🔵 `/pr-review`       | `/pr-review <PR#>`      | Review a PR (Markdown output)                      |
| Command | 🔵 `/pr-review-json`  | `/pr-review-json <PR#>` | Review a PR (JSON for inline comments)             |
| Skill   | 🟢 `dev-server`       | `/dev-server`           | Start dev server, check build status               |
| Skill   | 🔵 `git-conventions`  | `/git-conventions`      | Branch, commit, and PR naming conventions          |
| Skill   | 🟢 `technology-stack` | `/technology-stack`     | Architecture constraints and zero-dependency rules |
| Agent   | 🔵 `code-reviewer`    | Auto (after edits)      | Quality, security, and maintainability review      |

## Testing and Quality

| Type    | Name                     | Invoke                | What it does                                   |
| ------- | ------------------------ | --------------------- | ---------------------------------------------- |
| Command | 🔵 `/git-bisect`         | `/git-bisect`         | Find the commit that introduced a regression   |
| Command | 🔵 `/batch-lint-cleanup` | `/batch-lint-cleanup` | Auto-fix ESLint violations by rule             |
| Command | 🟢 `/docs-e2e-tests`     | `/docs-e2e-tests`     | Write/update Playwright tests for doc examples |
| Agent   | 🔵 `playwright-expert`   | Auto                  | Playwright test architecture and debugging     |

## Planning and Analysis

| Type    | Name                             | Invoke                        | What it does                                     |
| ------- | -------------------------------- | ----------------------------- | ------------------------------------------------ |
| Command | 🔵 `/plan-review`                | `/plan-review`                | Review plans for completeness and correctness    |
| Command | 🔵 `/plan-implementation-review` | `/plan-implementation-review` | Review plan execution, identify delivery gaps    |
| Agent   | 🔵 `nx-expert`                   | Auto                          | Nx monorepo configuration and build optimisation |

## Context and Memory

| Type    | Name           | Invoke      | What it does                                       |
| ------- | -------------- | ----------- | -------------------------------------------------- |
| Command | 🔵 `/remember` | `/remember` | Save branch context or project learnings as memory |
| Command | 🔵 `/recall`   | `/recall`   | Load branch context and browse project memory      |

## Documentation Review

| Type    | Name                      | Invoke                 | What it does                                                     |
| ------- | ------------------------- | ---------------------- | ---------------------------------------------------------------- |
| Command | 🟢 `/docs-review`         | `/docs-review`         | Review docs pages for technical accuracy and example consistency |
| Command | 🟢 `/release-docs-review` | `/release-docs-review` | Review all documentation changes between releases                |

## Git and Branch Management

| Type    | Name                     | Invoke                | What it does                             |
| ------- | ------------------------ | --------------------- | ---------------------------------------- |
| Command | 🔵 `/git-worktree-clean` | `/git-worktree-clean` | Hard-reset worktree to `origin/latest`   |
| Command | 🔵 `/git-split`          | `/git-split`          | Split large files preserving git history |
| Command | 🔵 `/pr-split`           | `/pr-split`           | Split a branch into stacked PRs          |

---

## Rules Reference

Rules load automatically when you edit files matching their glob patterns.

### Root Rule (always loaded)

| Rule         | Description                                           |
| ------------ | ----------------------------------------------------- |
| 🟢 `ag-grid` | Project overview, build chain, development guidelines |

### Core Code

| Rule              | Activates on             | Description                            |
| ----------------- | ------------------------ | -------------------------------------- |
| 🔵 `code-quality` | `packages/*/src/**/*.ts` | Bloat avoidance and comment guidelines |

### Testing and Benchmarks

| Rule            | Activates on                                   | Description                                         |
| --------------- | ---------------------------------------------- | --------------------------------------------------- |
| 🟢 `testing`    | `**/*.test.ts`, `**/*.spec.ts`, `testing/**/*` | Testing strategies, Jest patterns, and verification |
| 🟢 `benchmarks` | `testing/performance/**/*`, `**/benchmark*`    | Running and creating performance benchmarks         |

### Documentation and Examples

| Rule            | Activates on                                        | Description                                  |
| --------------- | --------------------------------------------------- | -------------------------------------------- |
| 🟢 `docs-pages` | `documentation/**/*.mdoc`, `documentation/**/*.md`  | Creating and maintaining documentation pages |
| 🟢 `examples`   | `_examples/**/*`, `documentation/**/_examples/**/*` | Working with examples in AG Grid             |

---

## Skills Reference

Skills load on-demand when invoked. All skills are invoked via `/skill-name`. All skills are shared across AI tools via `.rulesync/skills/`.

| Skill                 | Description                                               |
| --------------------- | --------------------------------------------------------- |
| 🟢 `dev-server`       | Start dev server, check build status                      |
| 🔵 `git-conventions`  | Branch, commit, and PR naming conventions                 |
| 🟢 `technology-stack` | Architecture constraints and zero-dependency requirements |

---

## Sub-Agents Reference

Sub-agents are spawned automatically when the AI determines a task matches their speciality. They cannot be invoked directly.

| Agent                  | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| 🔵 `code-reviewer`     | Reviews code for quality, security, and maintainability |
| 🔵 `nx-expert`         | Nx monorepo configuration and build optimisation        |
| 🔵 `playwright-expert` | Playwright E2E test architecture and debugging          |
