---
targets: ['*']
name: code-cleanup
description: 'Review and productionize code by removing bloat, duplication, and improving clarity'
invocable: user-only
---

# Distil Code Quality - Reduce Bloat and Productionize

You are an expert software engineer and clean-code advocate with deep expertise in identifying and removing code bloat, redundant code, and unnecessary comments.

Your goal is to review changes on the current branch and productionize the code by removing bloat, duplication, and improving clarity.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. IMPORTANT TOOLING REQUIREMENTS - STOP IF THESE ARE NOT MET

-   Git CLI must be available to determine the current branch and base branch.
-   The working tree should be clean or have only the intended changes.

## 2. General Context

-   This project is an Nx monorepo with multiple packages.
-   Release branches are named `bX.Y.Z` and follow semantic versioning.
-   The main branch is `latest`.
-   Code quality standards are documented in `.rulesync/rules/code-quality.md`.

## 3. Workflow

### Phase 0: Determine Scope

1. **Identify current branch and base branch:**

    ```bash
    # Get current branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "Current branch: $current_branch"

    # Determine base branch (latest or most recent release branch)
    # First try to find the merge-base with latest
    if git merge-base --is-ancestor latest HEAD 2>/dev/null; then
        base_branch="latest"
    else
        # Check for release branches (bX.Y.Z pattern)
        release_branches=$(git branch -r | grep -E 'origin/b[0-9]+\\.[0-9]+\\.[0-9]+$' | sed 's/.*origin\\///' | sort -V | tail -1)
        if [ -n "$release_branches" ]; then
            base_branch="$release_branches"
        else
            base_branch="latest"
        fi
    fi

    echo "Base branch: $base_branch"
    ```

2. **Get the diff of changes:**

    ```bash
    # Get list of changed files
    git diff --name-only "$base_branch"...HEAD

    # Get full diff
    git diff "$base_branch"...HEAD
    ```

3. **Verify working tree status:**

    ```bash
    git status
    ```

    If there are uncommitted changes, ask the user if they want to:

    - Stash changes and distil committed changes only
    - Include uncommitted changes in the distillation
    - Stop and let them commit first

### Phase 1: Analysis

For each changed file in the diff, analyze for:

1. **Code Bloat:**

    - **Redundant computed values**: Are there stored values that should be computed via functions/getters?
    - **Dead code**: Unused methods, parameters, properties, imports?
    - **Oversized functions**: Functions that do too much and should be split?
    - **Unnecessary abstractions**: Over-engineering for simple cases?

2. **Duplication:**

    - **Repeated logic**: Same code pattern appearing multiple times?
    - **Similar conditionals**: Multiple if/else branches that could be consolidated?
    - **Copy-pasted code blocks**: Opportunities to extract to helper functions?

3. **Comments:**

    - **Redundant comments**: Comments that restate what the code clearly shows?
    - **WHAT vs WHY**: Comments explaining what the code does instead of why?
    - **Obvious JSDoc**: Simple getters/setters with unnecessary documentation?
    - **Outdated comments**: Comments that no longer match the code?
    - **KEEP optimization comments**: These explain performance trade-offs and are valuable

4. **Code Clarity:**
    - **Complex conditionals**: Can be simplified with early returns or helper methods?
    - **Poor naming**: Variables/methods that don't clearly convey intent?
    - **Magic numbers/strings**: Should be extracted to named constants?
    - **Deep nesting**: Can be flattened with early returns?

### Phase 2: Categorization

Group issues by:

-   **Critical**: Must fix before commit (dead code, obvious bugs)
-   **Important**: Should fix (duplication, poor naming)
-   **Minor**: Nice to have (comment cleanup, minor refactors)

### Phase 3: Planning

Create an execution plan:

1. **Quick wins first**: Obvious cleanup that's low risk
2. **Batched refactors**: Group related changes
3. **Verification points**: Points where we should run tests

### Phase 4: Application

For each planned change:

1. Make the change
2. Run `yarn nx format` to ensure consistent formatting
3. Verify no regressions (type-check, lint, tests if affected)

### Phase 5: Verification

1. **Type-check**: `yarn nx build:types <affected-packages>`
2. **Lint**: `yarn nx lint <affected-packages>`
3. **Tests**: `yarn nx test <affected-packages>` (if test files were changed or core logic modified)
4. **Format**: `yarn nx format` to ensure consistent formatting

### Phase 6: Commit

If changes were made:

1. Stage all changes
2. Create a commit with message: `chore: distil code quality improvements`
3. Include a list of key changes in the commit body

## 4. Key Principles

-   **Preserve functionality**: No behavior changes unless fixing bugs
-   **Small incremental changes**: Easier to review and verify
-   **Test coverage**: Don't remove code that's covered by tests without understanding why
-   **Performance comments**: Keep comments explaining performance trade-offs
-   **Self-documenting code**: Good naming reduces need for comments
