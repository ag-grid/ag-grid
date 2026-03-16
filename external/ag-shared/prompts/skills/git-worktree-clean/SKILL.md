---
targets: ['*']
name: git-worktree-clean
description: 'Clean worktree by fetching and hard-resetting to origin/latest (or specified branch)'
invocable: user-only
---

# Worktree Clean

Clean up a worktree branch by fetching fresh state from origin and hard-resetting to a target branch.

## Usage

`/git-worktree-clean [branch]`

**Arguments:**

-   `branch` (optional): Target branch to reset to. Default: `origin/latest`

## Help

If the user provides `help` as an argument:

-   Explain how to use this command
-   Explain prerequisites
-   DO NOT proceed, exit immediately

## Prerequisites

1. **Git CLI** must be available
2. **Working directory** should be a git worktree (not the main repository)
3. **No critical uncommitted changes** - warn user if dirty

## Workflow

### STEP 1: Verify Environment

```bash
# Check if we're in a git worktree
git rev-parse --is-inside-work-tree || exit 1

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "WARNING: Uncommitted changes detected"
    git status --short
fi
```

If uncommitted changes exist, **STOP** and ask user for confirmation before proceeding.

### STEP 2: Fetch Fresh State

```bash
# Fetch latest from origin
git fetch origin
```

### STEP 3: Hard Reset to Target

```bash
# Default to origin/latest if no argument provided
TARGET_BRANCH="${ARGUMENTS:-origin/latest}"

# Hard reset to target
git reset --hard "$TARGET_BRANCH"
```

### STEP 4: Verify Clean State

```bash
# Show current state
git log --oneline -1
git status
```

## Definition of Done

-   [ ] Working tree is clean
-   [ ] HEAD matches target branch
-   [ ] User informed of reset result
