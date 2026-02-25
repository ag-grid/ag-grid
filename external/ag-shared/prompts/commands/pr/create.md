---
targets: ['*']
description: 'Create a PR from current commits and/or local changes. Identifies base branch, creates topic branch if needed, commits changes, and opens a PR.'
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

### STEP 2: Identify Base Branch

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

### STEP 3: Ensure Topic Branch

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

### STEP 4: Commit Changes (If Any)

If there are uncommitted changes:

1.  Review the changes:
    ```bash
    git diff
    git diff --staged
    git status
    ```
2.  Stage relevant files (prefer specific files over `git add -A`).
3.  Write a commit message following git-conventions:
    -   JIRA-linked: `AG-XXXX <description>` (uppercase JIRA number)
    -   No JIRA: `<description>` (concise, imperative mood)
    -   Under 72 characters.
    -   Never attribute agentic tooling.
4.  Commit:
    ```bash
    git commit -m "$(cat <<'EOF'
    <commit message>
    EOF
    )"
    ```

If there are no uncommitted changes and no unpushed commits, inform the user there is nothing to submit and **STOP**.

### STEP 5: Push Branch

Push the branch to the remote, setting the upstream:

```bash
git push -u origin <branch-name>
```

### STEP 6: Create Pull Request

Create the PR using `gh`:

```bash
gh pr create --base <BASE_BRANCH> --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Follow git-conventions for the PR:

-   **Title:** Under 70 characters. JIRA-linked: `AG-XXXX <description>`. No JIRA: `<description>`.
-   **Body:** JIRA-linked: include link(s) to the JIRA ticket(s). No JIRA: concise description of the change.
-   Keep descriptions concise - this is a public repo.
-   Never attribute agentic tooling.
-   If JIRA-linked include "Fix #AG-XXXX"

### STEP 7: Report Result

Output the PR URL and a brief summary:

```
PR created: <URL>
  Base: <BASE_BRANCH> ← Head: <branch-name>
  Title: <title>
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
