---
targets: ['*']
name: pr-create
description: 'Create a PR from current commits and/or local changes. Identifies base branch, creates topic branch if needed, commits changes, and opens a PR.'
invocable: user-only
---

# Create Pull Request

Commit current changes (if any), push the branch, and open a pull request.

**Read and follow all conventions in `.rulesync/skills/git-conventions/SKILL.md`.**

## Help

If the user provides a command option of `help`:

-   Explain how to use this command.
-   DO NOT proceed, exit the command immediately after these steps.

## Prerequisites

-   Git CLI and GitHub CLI (`gh`) must be available.
-   The user must be authenticated with `gh` (`gh auth status`).
-   The repository must have a remote named `origin`.

## Workflow

### STEP 1: Assess Current State

Gather all necessary context in parallel:

```bash
git status
git log --oneline -10
git branch --show-current
git remote -v
```

Determine:

-   **Current branch name** (`CURRENT_BRANCH`).
-   **Whether there are uncommitted changes** (staged, unstaged, or untracked).
-   **Whether there are unpushed commits** on this branch.

### STEP 2: Check Symlinked Repos

Scan the `external/` directory for symlinked directories that resolve to separate git repos with changes. These need their own branches and PRs before the outer repo's PR is created.

1.  Identify symlinked repo candidates:
    ```bash
    for dir in external/*/; do
      [ -L "${dir%/}" ] && [ -d "$(readlink -f "${dir%/}")/.git" ] && echo "${dir%/}"
    done
    ```
    Skip any directory that is NOT a symlink (e.g., `external/ag-shared` is a real directory tracked in the outer repo — ignore it).

2.  For each symlinked repo found, check for uncommitted or unpushed changes:
    ```bash
    RESOLVED_PATH="$(readlink -f "<symlink>")"
    git -C "$RESOLVED_PATH" status --porcelain
    git -C "$RESOLVED_PATH" log --oneline @{upstream}..HEAD 2>/dev/null
    ```
    If there are no uncommitted changes AND no unpushed commits, skip that repo silently.

3.  For each symlinked repo WITH changes, create a matching branch, commit, push, and open a PR:
    -   Use the same branch name as the outer repo (`CURRENT_BRANCH` or the topic branch name determined in STEP 4) for traceability.
    -   If the repo is not already on that branch, create and switch to it:
        ```bash
        git -C "$RESOLVED_PATH" checkout -b <branch-name> 2>/dev/null || git -C "$RESOLVED_PATH" checkout <branch-name>
        ```
    -   Stage and commit changes with a message referencing the outer repo's work:
        ```bash
        git -C "$RESOLVED_PATH" add -A
        git -C "$RESOLVED_PATH" commit -m "$(cat <<'EOF'
        Update for <outer-repo-name>: <brief description>
        EOF
        )"
        ```
    -   Push and create a PR:
        ```bash
        git -C "$RESOLVED_PATH" push -u origin <branch-name>
        cd "$RESOLVED_PATH" && gh pr create --title "<title>" --body "$(cat <<'EOF'
        Companion PR for changes in <outer-repo-name>.
        EOF
        )"
        ```
    -   Record each created PR URL in `SYMLINKED_REPO_PRS` for the final report.

4.  If no symlinked repos have changes, proceed to the next step without comment.

**Note:** This step may execute before the outer repo's topic branch is fully determined (STEP 4). If a topic branch has not yet been created, defer symlinked repo processing until after STEP 4 and execute it between STEP 4 and STEP 5. The key requirement is that symlinked repo PRs are created BEFORE the outer repo's PR (STEP 7).

### STEP 3: Identify Base Branch

Determine the correct base branch for the PR:

1.  Check if the current branch was created from a `bX.Y.Z` release branch:
    ```bash
    git log --oneline --decorate --all | head -30
    git merge-base --is-ancestor origin/latest HEAD && echo "descends from latest"
    ```
2.  **Default base:** `latest` (the main branch).
3.  **Release base:** If the branch clearly descends from a `bX.Y.Z` branch (and not `latest`), use that release branch as the base.
4.  If ambiguous, ask the user which base branch to target.

Store the result as `BASE_BRANCH`.

### STEP 4: Ensure Topic Branch

If currently on `latest` or a `bX.Y.Z` branch, a new topic branch is required:

1.  Determine the branch name following git-conventions:
    -   If `${ARGUMENTS}` contains a JIRA ticket (e.g., `AG-12345`): use `ag-12345/<descriptive-slug>`
    -   Otherwise: use `<initials>/<descriptive-slug>` (derive initials from `git config user.name`, or ask the user)
    -   Derive the slug from the change description or `${ARGUMENTS}`.
2.  Create and switch to the new branch:
    ```bash
    git checkout -b <branch-name>
    ```

If already on a topic branch (not `latest` or `bX.Y.Z`), continue on the current branch.

### STEP 5: Commit Changes (If Any)

If there are uncommitted changes:

1.  Review the changes:
    ```bash
    git diff
    git diff --staged
    git status
    ```
2.  Stage relevant files (prefer specific files over `git add -A`).
3.  Write a commit message following git-conventions (see Commits section).
4.  Commit:
    ```bash
    git commit -m "$(cat <<'EOF'
    <commit message>
    EOF
    )"
    ```

If there are no uncommitted changes and no unpushed commits, inform the user there is nothing to submit and **STOP**.

### STEP 6: Push Branch

Push the branch to the remote, setting the upstream:

```bash
git push -u origin <branch-name>
```

### STEP 7: Create Pull Request

Create the PR using `gh`:

```bash
gh pr create --base <BASE_BRANCH> --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Follow git-conventions (see Pull Requests section). If JIRA-linked, include "Fix #AG-XXXX" in the body.

### STEP 8: Report Result

Output the PR URL and a brief summary. If any symlinked repo PRs were created in STEP 2, include them as well:

```
PR created: <URL>
  Base: <BASE_BRANCH> ← Head: <branch-name>
  Title: <title>
```

If `SYMLINKED_REPO_PRS` is non-empty, also report:

```
Companion PRs (symlinked repos):
  <repo-name>: <URL>
  <repo-name>: <URL>
```

## Arguments

`${ARGUMENTS}` can optionally include:

-   A JIRA ticket number (e.g., `AG-12345`) - used for branch naming, commit prefix, and PR title.
-   A description of the change - used for branch slug, commit message, and PR title.
-   `--base <branch>` - override the base branch detection.

**Examples:**

-   `/pr-create` - infer everything from current state and changes.
-   `/pr-create AG-12345 Add tooltip delay support` - JIRA-linked PR.
-   `/pr-create Fix axis label overlap for long text` - no-JIRA PR.
-   `/pr-create --base b13.0.0` - target a specific release branch.
