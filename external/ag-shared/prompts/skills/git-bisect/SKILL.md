---
targets: ['*']
name: git-bisect
description: 'Find the commit that introduced test failures using git bisect'
invocable: user-only
---

# Git Bisect - Find the Commit That Introduced Test Failures

You are an expert software engineer helping to identify the commit that introduced test failures or flakiness using git bisect.

Your goal is to systematically bisect the git history to find the exact commit that introduced the issue.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. IMPORTANT TOOLING REQUIREMENTS - STOP IF THESE ARE NOT MET

-   Git CLI must be available.
-   The repository must be in a clean state or have only intended changes.
-   Test commands must be executable (e.g., `nx test`, `yarn test`).
-   Use `NX_DAEMON=false` to avoid async Nx daemon project graph re-calculation from affecting execution stability.
-   **Worktree support**: The script handles git worktrees automatically, but ensure node_modules are accessible (either in the worktree or the main repository).

## 2. Workflow

### Phase 0: Parse Arguments

The user provides `${ARGUMENTS}` which should contain:

-   **Bad commit/branch**: The commit or branch where the issue is present (default: `HEAD` or `latest`)
-   **Good commit/branch**: The commit or branch where the issue is NOT present (e.g., `origin/bX.Y.Z`)
-   **Test command**: The command to run to verify if the issue is present (default: `${ARGUMENTS}` if it looks like a test command)

Parse `${ARGUMENTS}` to extract:

-   `BAD_REF`: Commit/branch where tests fail
-   `GOOD_REF`: Commit/branch where tests pass
-   `TEST_COMMAND`: Command to execute for each bisect step

**Example argument formats:**

-   `bad=HEAD good=origin/b12.3.0 test="yarn nx test package-name --testPathPattern='test.test.ts'"`
-   `HEAD origin/b12.3.0 "yarn nx test package-name --testPathPattern='test.test.ts'"`
-   `"yarn nx test package-name --testPathPattern='test.test.ts'"` (uses HEAD as bad, prompts for good)

### Phase 1: Verify the Issue

1. **Check current state:**

    ```bash
    git status
    git log -1 --oneline
    REPO_ROOT=$(git rev-parse --show-toplevel)
    ```

2. **Validate test files exist (if test command references specific files):**

    ```bash
    # Extract test file patterns from TEST_COMMAND if possible
    # This helps catch issues early (e.g., testing wrong package)
    ```

3. **Verify the issue exists on the bad commit:**

    ```bash
    git checkout ${BAD_REF}
    export NX_DAEMON=false

    # Handle node_modules for worktrees
    REPO_ROOT=$(git rev-parse --show-toplevel)
    if [ ! -d "${REPO_ROOT}/node_modules/.bin" ]; then
        MAIN_WORKTREE=$(git rev-parse --git-dir | sed 's|/\\.git/worktrees/.*|/.git|' 2>/dev/null)
        if [ -n "$MAIN_WORKTREE" ] && [ -d "$MAIN_WORKTREE/../node_modules/.bin" ]; then
            export PATH="$(dirname "$MAIN_WORKTREE")/node_modules/.bin:$PATH"
        fi
    fi

    ${TEST_COMMAND}
    ```

    - If tests pass, inform the user that the issue is not present and ask for confirmation.
    - If tests fail, proceed to Phase 2.
    - If test files are not found, verify the package name and file path are correct.

### Phase 2: Start Git Bisect

1. **Initialize bisect:**

    ```bash
    git bisect start
    git bisect bad ${BAD_REF}
    git bisect good ${GOOD_REF}
    ```

2. **Verify bisect range:**

    ```bash
    git bisect visualize --oneline | head -20
    ```

    This shows the commits that will be tested.

### Phase 3: Automated Bisect (Recommended)

1. **Determine repository root (handles worktrees):**

    ```bash
    # Get the git root directory (works for both regular repos and worktrees)
    REPO_ROOT=$(git rev-parse --show-toplevel)
    echo "Repository root: $REPO_ROOT"

    # Check if we're in a worktree and find main worktree if needed
    GIT_DIR=$(git rev-parse --git-dir)
    MAIN_WORKTREE=""
    if echo "$GIT_DIR" | grep -q worktrees; then
        echo "Detected git worktree"
        # Extract main worktree path
        MAIN_GIT_DIR=$(echo "$GIT_DIR" | sed 's|/\\.git/worktrees/.*|/.git|')
        if [ -d "$MAIN_GIT_DIR" ]; then
            MAIN_WORKTREE=$(cd "$MAIN_GIT_DIR/.." && pwd)
        fi
    fi
    ```

2. **Create a test script:**

    ```bash
    # Use a workspace-relative temp directory
    BISECT_SCRIPT="${REPO_ROOT}/tmp/bisect_test.sh"
    mkdir -p "$(dirname "$BISECT_SCRIPT")"

    cat > "$BISECT_SCRIPT" << EOF
    #!/bin/bash
    set -e
    cd "${REPO_ROOT}"

    # Export NX_DAEMON=false to avoid async daemon issues
    export NX_DAEMON=false

    # Handle node_modules location (for worktrees that share node_modules)
    if [ ! -d "node_modules/.bin" ] && [ -n "${MAIN_WORKTREE}" ] && [ -d "${MAIN_WORKTREE}/node_modules/.bin" ]; then
        export PATH="${MAIN_WORKTREE}/node_modules/.bin:$PATH"
    fi

    # Run the test command
    ${TEST_COMMAND}
    EOF
    chmod +x "$BISECT_SCRIPT"
    ```

3. **Run automated bisect:**

    ```bash
    git bisect run "$BISECT_SCRIPT"
    ```

4. **Handle special cases:**
    - **Build errors (not test failures)**: If a commit has build errors that prevent tests from running, skip it:
        ```bash
        git bisect skip
        ```
    - **Test files don't exist**: If a test file doesn't exist in older commits, modify the test script to handle this gracefully
    - **Unexpected test failures**: If tests fail in an unexpected way, skip it:
        ```bash
        git bisect skip
        ```

### Phase 4: Manual Bisect (If Automated Fails)

If automated bisect encounters issues, proceed manually:

1. **Check current commit:**

    ```bash
    git log -1 --oneline
    ```

2. **Run tests:**

    ```bash
    export NX_DAEMON=false
    ${TEST_COMMAND}
    ```

3. **Mark result:**

    - If tests **pass** (issue not present):
        ```bash
        git bisect good
        ```
    - If tests **fail** (issue present):
        ```bash
        git bisect bad
        ```
    - If **build errors** or **unexpected failures**:
        ```bash
        git bisect skip
        ```

4. **Repeat** until git bisect identifies the culprit commit.

### Phase 5: Identify the Culprit

1. **Get the culprit commit:**

    ```bash
    git bisect log
    git log -1 --oneline
    ```

2. **Examine the commit:**

    ```bash
    git show --stat ${CULPRIT_COMMIT}
    git show ${CULPRIT_COMMIT}
    ```

3. **Reset bisect:**

    ```bash
    git bisect reset
    ```

### Phase 6: Report Results

Provide a summary:

```markdown
## Git Bisect Results

**Issue:** ${TEST_COMMAND} failures
**Bad commit:** ${BAD_REF} (${BAD_COMMIT_HASH})
**Good commit:** ${GOOD_REF} (${GOOD_COMMIT_HASH})
**Culprit commit:** ${CULPRIT_COMMIT_HASH}

**Culprit commit details:**

-   Author: ${AUTHOR}
-   Date: ${DATE}
-   Message: ${COMMIT_MESSAGE}
-   Files changed: ${FILES_CHANGED}

**Next steps:**

1. Review the changes in ${CULPRIT_COMMIT_HASH}
2. Identify the specific change that introduced the issue
3. Fix the issue or revert the problematic change
```

## 4. Important Guidelines

### Test Command Requirements

-   **Exit codes**: The test command must exit with code 0 on success and non-zero on failure.
-   **Timeout**: Long-running tests may need timeouts. Consider wrapping:
    ```bash
    timeout 60 ${TEST_COMMAND}
    ```
-   **Multiple tests**: If testing multiple test files, combine with `&&`:
    ```bash
    yarn nx test package1 --testPathPattern="test1.test.ts" && \
    yarn nx test package2 --testPathPattern="test2.test.ts"
    ```

### Handling Flaky Tests

-   If tests are flaky (sometimes pass, sometimes fail), consider:
    -   Running tests multiple times: `for i in {1..3}; do ${TEST_COMMAND} && break; done`
    -   Using a more lenient script that allows some failures
    -   Documenting the flakiness in the report

### Skipping Commits

Always skip commits that:

-   Have build/compilation errors preventing tests from running
-   Have merge conflicts
-   Fail tests in unexpected ways (different error than the target issue)
-   Are known to be broken for unrelated reasons

### Performance Considerations

-   Use `NX_DAEMON=false` to avoid async daemon issues
-   Consider using `--testPathPattern` to limit test scope
-   For very large bisect ranges, consider narrowing the range first
-   **Worktree performance**: If using a worktree, builds may be slower if node_modules are shared

## 5. Common Patterns

### Testing Multiple Test Files

```bash
# Test files in different packages
TEST_COMMAND="yarn nx test package1 --testPathPattern='test1.test.ts' && \
              yarn nx test package2 --testPathPattern='test2.test.ts'"
```

**Important:** When testing files in different packages, ensure:

-   Each package name matches the actual package structure
-   Test files exist in the specified packages
-   Use `--passWithNoTests` flag if a test file might not exist in older commits

### Testing with Specific Test Names

```bash
TEST_COMMAND="yarn nx test package-name --testPathPattern='test.test.ts' --testNamePattern='specific test name'"
```

## 6. Error Recovery

If bisect gets stuck or produces unexpected results:

1. **Check bisect state:**

    ```bash
    git bisect log
    git bisect visualize
    ```

2. **Reset and restart if needed:**

    ```bash
    git bisect reset
    # Start over from Phase 2
    ```

3. **Narrow the range manually:**

    ```bash
    # Test a commit in the middle manually
    git checkout ${MIDDLE_COMMIT}
    ${TEST_COMMAND}
    # Then restart bisect with narrower range
    ```

## 7. Command Arguments

**Format:** `${ARGUMENTS}` can be:

-   `bad=<ref> good=<ref> test="<command>"` - Full specification
-   `<bad-ref> <good-ref> "<test-command>"` - Positional arguments
-   `"<test-command>"` - Test command only (prompts for bad/good refs)

**Examples:**

-   `/git/bisect bad=HEAD good=origin/b12.3.0 test="yarn nx test package-name --testPathPattern='test.test.ts'"`
-   `/git/bisect HEAD origin/b12.3.0 "yarn nx test package-name --testPathPattern='test.test.ts'"`
-   `/git/bisect "yarn nx test package-name --testPathPattern='test.test.ts'"`
