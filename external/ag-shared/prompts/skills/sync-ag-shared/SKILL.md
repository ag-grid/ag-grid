---
targets: ['*']
name: sync-ag-shared
description: 'Sync ag-shared subrepo changes across ag-charts, ag-grid, and ag-studio repos'
invocable: user-only
---

# Sync ag-shared Subrepo Across AG Repos

Orchestrate syncing `external/ag-shared/` changes from the current repo to all other AG repos that consume the subrepo. This handles the full `git subrepo push` / `pull` cycle, companion changes, and cross-linked PRs.

## Help

If the user provides a command option of `help`:

-   Explain how to use this skill.
-   Explain the prerequisites and what will happen.
-   DO NOT proceed, exit the skill immediately after these steps.

## Prerequisites

-   Git CLI, GitHub CLI (`gh`), and `yarn` must be available.
-   `git subrepo` must be installed (`git subrepo --version`).
-   Must be on a **feature branch** (not `latest`, `main`, or `master`).
-   Working tree must be **clean** (`git status --porcelain` is empty).
-   The current repo must have `external/ag-shared/.gitrepo`.

## STEP 1: Gather State

Collect all context needed to plan the sync.

### 1a. Identify Source Repo

```bash
# The working directory where the skill was invoked — use this for ALL
# git/subrepo commands in the source repo (critical for worktrees).
SOURCE_WD=$(pwd)

# Resolve the real repo root (worktrees resolve to actual repo location).
# Only used for discovering sibling destination repos, NOT for running commands.
REPO_GIT_DIR=$(git rev-parse --git-common-dir)
SOURCE_ROOT=$(cd "$(dirname "$REPO_GIT_DIR")" && pwd)

# Current branch
SOURCE_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Repo name (for display)
SOURCE_REPO=$(basename "$SOURCE_ROOT")
```

**Important — worktree awareness:** When invoked from a git worktree, the feature branch is checked out in the worktree, and the main repo checkout is typically on `latest` (or another branch). You **cannot** `git checkout` the feature branch in the main repo because git prevents a branch from being checked out in two places simultaneously. Always run subrepo and git commands from `SOURCE_WD` (the worktree), never from `SOURCE_ROOT`.

Validate:

-   `SOURCE_BRANCH` is not `latest`, `main`, or `master`.
-   `git status --porcelain` is empty.
-   `external/ag-shared/.gitrepo` exists.

If any validation fails, report the issue and **STOP**.

### 1b. Discover Destination Repos

Destination repos are **siblings** of the source repo root. Look for directories at the same level that contain `external/ag-shared/.gitrepo`.

```bash
PARENT_DIR=$(dirname "$SOURCE_ROOT")
for dir in "$PARENT_DIR"/*/; do
    if [ "$dir" != "$SOURCE_ROOT/" ] && [ -f "${dir}external/ag-shared/.gitrepo" ]; then
        echo "Found destination: $dir"
    fi
done
```

Collect the list of destination repos. Typical destinations are two of `ag-charts`, `ag-grid` and `ag-studio`, but discover dynamically.

### 1c. Validate Destinations

For each destination repo:

-   Check it has a clean working tree.
-   Check it is on `latest` or a feature branch.
-   Run `git fetch origin` to ensure it is up to date.

If any destination has uncommitted changes, default to stashing all changes and continuing - but ask the user to confirm.

## STEP 2: Analyse Source Changes

Use a sub-agent (Task tool, `subagent_type: Explore`) to analyse changes on the source branch:

```bash
# Changes inside ag-shared
git diff latest...HEAD -- external/ag-shared/

# Changes outside ag-shared
git diff latest...HEAD -- ':!external/ag-shared/'

# Commit log
git log --oneline latest...HEAD
```

The sub-agent should produce:

1.  **Change summary** — what files changed in `external/ag-shared/` and why.
2.  **Companion change predictions** — based on the ag-shared changes, what companion changes are likely needed in each destination repo. For example:
    -   New/renamed skills may need symlink updates in `.rulesync/`.
    -   Changed rule globs may need `.claude/settings.json` updates.
    -   Script changes may need `package.json` or CI updates.
    -   Setup-prompts changes need `setup-prompts.sh` re-run in each repo.

## STEP 3: Present Plan and Confirm

Display to the user:

```
## ag-shared Sync Plan

**Source:** <SOURCE_REPO> @ <SOURCE_BRANCH>
**Destinations:** <list of destination repos>

### Changes in ag-shared
<summary from step 2>

### Changes outside ag-shared
<summary from step 2>

### Predicted Companion Changes
<per-destination predictions from step 2>

### Steps
1. Push ag-shared from <SOURCE_REPO>
2. Create sync/<SOURCE_BRANCH> branches in each destination
3. Pull ag-shared in each destination
4. Apply companion changes in each destination
5. Verify all repos
6. Push branches and create cross-linked PRs (reuse existing source PR if one exists)
```

Use `AskUserQuestion` to confirm before proceeding. The user may want to adjust the plan or skip certain destinations.

## STEP 4: Push Source ag-shared

From the source working directory (the worktree or repo where the skill was invoked):

```bash
cd "$SOURCE_WD"
yarn subrepo push ag-shared
```

### Handling "need to pull first"

If the push fails with _"There are new changes upstream, you need to pull first"_, this means the ag-shared remote has commits not yet in this branch. Handle it:

```bash
cd "$SOURCE_WD"
yarn subrepo pull ag-shared   # Integrates upstream changes
git diff HEAD~1 --stat        # Show what the pull changed — verify before continuing
yarn subrepo push ag-shared   # Retry the push
```

### Stale lock files

If a subrepo command fails mid-operation, it may leave a stale git lock file. Check for and remove it before retrying:

```bash
# For worktrees:
LOCK_FILE=$(git rev-parse --git-dir)/index.lock
[ -f "$LOCK_FILE" ] && rm "$LOCK_FILE"

# Also restore any partially-modified .gitrepo:
git checkout -- external/ag-shared/.gitrepo
```

If the push still fails after pulling, report the error and **STOP**.

## STEP 5: Create Sync Branches and Pull

For each destination repo:

```bash
cd "<DEST_ROOT>"

# Fetch latest
git fetch origin

# Create sync branch from origin/latest
git checkout -b "sync/${SOURCE_BRANCH}" origin/latest

# Pull ag-shared updates
yarn subrepo pull ag-shared

# Show what the pull changed — verify files match expected changes from Step 2
git diff HEAD~1 --stat

# Verify the pull succeeded
git subrepo status ag-shared
```

If `subrepo pull` fails in any repo, report the error and **STOP** — ask the user how to proceed.

## STEP 6: Apply Companion Changes

For each destination repo, launch a **sub-agent** (Task tool, `subagent_type: general-purpose`) to apply predicted companion changes. Provide the sub-agent with:

-   The destination repo path.
-   The change summary from Step 2.
-   The predicted companion changes for this specific repo.
-   Instructions to replicate patterns from the source repo.

Common companion tasks:

-   Run `./external/ag-shared/scripts/setup-prompts/setup-prompts.sh` to regenerate `.claude/` from `.rulesync/`.
-   Update `.rulesync/` symlinks if skills/rules were added, renamed, or removed.
-   Update product-specific configurations if ag-shared scripts changed.
-   Run verification: `./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh`.
-   **Run `npx nx format` (or equivalent formatter) before committing** to avoid CI formatting check failures.

### Iterative Push/Pull (if needed)

If companion changes modify files inside `external/ag-shared/` (rare but possible):

1.  Commit the changes in the destination repo.
2.  `yarn subrepo push ag-shared` from the destination.
3.  Go back to the source repo and other destinations: `yarn subrepo pull ag-shared`.
4.  Re-verify.

**Cap iterations at 3.** If changes still bounce after 3 rounds, stop and ask the user.

## STEP 7: Verify

For each repo (source + all destinations):

```bash
# Check subrepo status
git subrepo status ag-shared

# Verify clean working tree
git status --porcelain

# Run rulesync verification if available
if [ -f "./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh" ]; then
    ./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh
fi
```

Report any issues. All repos must have clean working trees and passing verification.

## STEP 8: Commit, Push, and Create PRs

### 8a. Push All Branches

For the source repo (if not already pushed):

```bash
cd "$SOURCE_WD"
git push -u origin "$SOURCE_BRANCH"
```

For each destination repo:

```bash
cd "<DEST_ROOT>"
git push -u origin "sync/${SOURCE_BRANCH}"
```

### 8b. Audit PR Diffs for Unrelated Changes

Before creating PRs, check each destination branch for unrelated changes that may have crept in (e.g. files modified on `origin/latest` after the branch point):

```bash
cd "<DEST_ROOT>"
git diff origin/latest...HEAD --stat
```

Review the diff stat. If any files outside `external/ag-shared/` and `.rulesync/` appear that are not companion changes, revert them:

```bash
git checkout origin/latest -- <unrelated-file>
git commit -m "Revert unrelated changes to <file>"
```

### 8c. Create Cross-Linked PRs

Create a PR in each repo. All PRs should reference each other.

**Check for existing PRs first.** The source branch may already have an open PR. Always check before creating:

```bash
cd "$SOURCE_WD"
SOURCE_PR_URL=$(gh pr view "$SOURCE_BRANCH" --json url -q '.url' 2>/dev/null)
```

If an existing PR is found, **reuse it** — update its description to add cross-repo links rather than creating a new PR. Only create a new PR if none exists:

```bash
if [ -z "$SOURCE_PR_URL" ]; then
    SOURCE_PR_URL=$(gh pr create --base latest --title "<title>" --body "...")
fi
```

For destination repos, create new PRs (these are always new sync branches):

```bash
cd "<DEST_ROOT>"
DEST_PR_URL=$(gh pr create --base latest --title "Sync ag-shared from <SOURCE_BRANCH>" --body "$(cat <<'EOF'
## Summary
Sync ag-shared subrepo from <SOURCE_REPO>@<SOURCE_BRANCH>.

<companion change summary if any>

## Cross-repo PRs
- Source: <SOURCE_PR_URL>

## Test plan
- [ ] Verify ag-shared content matches source
- [ ] Run setup-prompts verification
EOF
)")
```

Then update all PR descriptions (source and destinations) to cross-link with each other. For existing source PRs, **append** the cross-repo links section rather than replacing the entire body.

### 8d. Report Results

Output a summary:

```
## Sync Complete

| Repo | Branch | PR |
| ---- | ------ | -- |
| <source> | <branch> | <url> |
| <dest1> | sync/<branch> | <url> |
| <dest2> | sync/<branch> | <url> |

All repos verified. Working trees clean.
```

## Error Handling

-   **Merge conflicts during subrepo pull:** Stop and ask the user to resolve manually. Provide the conflicting files and repo path.
-   **Auth failures:** Check `gh auth status` and `git remote -v`. Ask the user to authenticate.
-   **Dirty working tree:** Always stop and report. Never force-clean a destination repo.
-   **Subrepo push/pull failures:** Report the full error output. Common causes: diverged history (pull first, then push), missing remote access.
-   **Stale git lock files:** A failed subrepo operation may leave `index.lock` in the git dir. Remove it and restore `.gitrepo` before retrying (see Step 4).
-   **Worktree branch conflicts:** Never try to `git checkout` the source branch in the main repo — it's already checked out in the worktree. Always `cd` to the worktree working directory for source repo commands.

## Arguments

`${ARGUMENTS}` can optionally include:

-   `--skip <repo>` — skip a specific destination repo.
-   `--dry-run` — analyse and present plan only, do not execute.
-   `--no-pr` — sync branches but do not create PRs.
