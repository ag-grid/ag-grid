---
targets: ['*']
name: git-split
description: 'Split large files into smaller modules while preserving git history (blame, log)'
invocable: user-only
---

# Split Large Files with Git History Preservation

You are an expert in Git history management and code refactoring. Your goal is to split large files into smaller, focused modules while preserving the complete git history (blame, log) for the extracted code.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain if they are missing any prerequisites or tooling requirements.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. IMPORTANT TOOLING REQUIREMENTS - STOP IF THESE ARE NOT MET

-   Git CLI must be available
-   Working tree should be clean (no uncommitted changes)
-   You should be on a feature branch, not the main branch

## 2. Prerequisites Check

```bash
# Verify clean working tree
git status --porcelain

# Verify we're not on main branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "latest" ] || [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "ERROR: Cannot split on main branch. Create a feature branch first."
    exit 1
fi
```

## 3. The Branch-Merge Technique

This technique preserves git history by:

1. Creating a branch from the file's initial commit
2. Making the split changes on that branch
3. Merging back with special strategy to preserve history

### Step 1: Analyze the File

```bash
# Get file history
git log --oneline --follow -- "path/to/large-file.ts"

# Find first commit that introduced the file
git log --diff-filter=A --follow --format="%H" -- "path/to/large-file.ts" | tail -1

# Count lines and identify logical sections
wc -l "path/to/large-file.ts"
```

### Step 2: Plan the Split

Before splitting, identify:

-   **Logical groupings**: Functions/classes that belong together
-   **Dependencies**: What each group imports/exports
-   **Naming**: What to call the new files
-   **Barrel exports**: How to maintain backward compatibility

### Step 3: Create History Branch

```bash
# Find the commit that introduced the file
first_commit=$(git log --diff-filter=A --follow --format="%H" -- "path/to/large-file.ts" | tail -1)

# Create branch from parent of first commit
git checkout -b split-history "${first_commit}^"

# Copy the original file to new locations (as copies, not moves)
cp "path/to/large-file.ts" "path/to/new-file-1.ts"
cp "path/to/large-file.ts" "path/to/new-file-2.ts"

# Commit the copies
git add .
git commit -m "chore: prepare split of large-file.ts (history preservation)"
```

### Step 4: Return to Feature Branch and Merge

```bash
# Return to feature branch
git checkout -

# Merge the history branch with ours strategy
git merge split-history --no-commit -X ours

# Now make the actual content changes
# - Trim new-file-1.ts to only contain its portion
# - Trim new-file-2.ts to only contain its portion
# - Update large-file.ts to re-export from new files (or remove)
# - Update imports throughout codebase

# Stage and commit
git add -A
git commit -m "refactor: split large-file.ts into focused modules

- Extract [description] to new-file-1.ts
- Extract [description] to new-file-2.ts
- Update imports throughout codebase
- Preserve git history with branch-merge technique"
```

### Step 5: Clean Up

```bash
# Delete the history branch
git branch -d split-history

# Verify history is preserved
git log --follow -- "path/to/new-file-1.ts"
git blame "path/to/new-file-1.ts"
```

## 4. Alternative: Simple Move with Rename Detection

For simpler cases where exact history preservation isn't critical:

```bash
# Git will detect renames if files are similar enough
git mv "path/to/large-file.ts" "path/to/new-location.ts"

# Make content changes
# ... edit files ...

# Commit with -C to help rename detection
git commit -C HEAD --amend
```

## 5. Workflow Summary

1. **Analyze**: Understand the file structure and dependencies
2. **Plan**: Decide how to split and what to name new files
3. **Branch**: Create history preservation branch
4. **Copy**: Copy original file to new locations
5. **Merge**: Merge back to feature branch
6. **Edit**: Actually split the content
7. **Update**: Fix all imports/exports
8. **Verify**: Check history and run tests
9. **Clean**: Delete temporary branch

## 6. Best Practices

-   **Keep related code together**: Don't split arbitrarily by line count
-   **Maintain barrel exports**: Re-export from original location if it's a public API
-   **Update imports atomically**: All import changes in one commit
-   **Verify history**: Always check `git log --follow` and `git blame` after splitting
-   **Run tests**: Ensure nothing is broken after the split
-   **Document**: Add JSDoc or README explaining the new module structure

## 7. Common Pitfalls

-   **Don't force push** if others are working on the branch
-   **Don't split on main** - always use a feature branch
-   **Don't forget barrel exports** if the original file was part of public API
-   **Don't break circular dependencies** - plan the split to avoid them
