---
targets: ['*']
name: pr-split
description: 'Split a branch into a logical sequence of stacked PRs for easier review'
invocable: user-only
---

# PR Split Instructions

## Intent

Transform a large branch into a sequence of small, high-quality PRs that:

- Each do ONE thing well
- Are easy to review (500-1000 lines ideal)
- Tell a coherent story in sequence
- Pass all quality checks
- Have clear, descriptive commit messages that explain WHY

The goal is **reviewer experience**, not mechanical splitting. Each PR should be something you'd be proud to send for review.

## Help

If the user provides a command option of `help`:

- Explain how to use this prompt.
- Explain if they are missing any prerequisites or tooling requirements.
- DO NOT proceed, exit the prompt immediately after these steps.

## Phase 0: Prerequisites

### Tooling Requirements

- Git CLI must be available
- GitHub CLI (`gh`) must be available and authenticated
- Working tree must be clean (no uncommitted changes)
- Must be on a feature branch, not the main branch

### Verification

Verify the working tree is clean, not on main branch, and gh CLI is authenticated before proceeding.

### Extract JIRA Ticket or Branch Prefix

Determine the commit message prefix from the branch name:

1. Detect the project from the repo name (enclosing directory):

   | Repo          | Branch Pattern            | JIRA Prefix |
   |---------------|---------------------------|-------------|
   | `ag-studio`   | `st-NNNNN/description`    | `ST-`       |
   | `ag-charts`   | `ag-NNNNN/description`    | `AG-`       |
   | `ag-grid`     | `ag-NNNNN/description`    | `AG-`       |
   | *(default)*   | `ag-NNNNN/description`    | `AG-`       |

2. If branch matches the project's pattern: extract JIRA ticket (e.g., `ST-12345`, `AG-12345`)
3. Otherwise: derive prefix from branch name (e.g., `feature/null-keys` becomes `null-keys`)

Store this prefix for use in commit messages and PR titles.

## Phase 1: Understand the Changes

Use a sub-agent (type: `Explore`) to deeply analyse the changes:

### 1.1 Gather Information

- Get the full diff against base branch (`latest`)
- Review all commit messages and their content
- Understand the scope: files changed, lines added/removed, packages touched

### 1.2 Analyse for Logical Units

Focus on **content and purpose**, not commit boundaries. Identify:

- **Distinct features or concerns**: What separate things does this branch accomplish?
- **Logical dependencies**: What must be merged first for later changes to make sense?
- **Natural boundaries**: Package boundaries, code vs tests vs docs, refactoring vs features
- **Reviewer cognitive load**: What groupings would be easiest to understand in isolation?

Key questions to answer:
- Could a reviewer understand each proposed PR without seeing the others?
- Does each PR have a single, clear purpose?
- Are dependencies between PRs clear and minimal?

## Phase 2: Design the Split

### 2.1 Present Split Options

After analysis, use `AskUserQuestion` to present 2-3 concrete split proposals based on content analysis:

**Option types to consider:**

1. **By logical unit** (recommended default) - Group changes by feature or concern
2. **By package/module** - Split across codebase boundaries (core, then community, then enterprise)
3. **Custom** - User specifies split points

**Guidelines:**

- Each option should include the number of PRs and what goes in each
- Options must be based on actual content analysis, not commit preservation
- Prioritize options that create coherent, reviewable units
- Target 500-1000 lines per PR for optimal reviewability

**Do NOT offer "By commit" splitting.** If commits are already well-structured, the user can trivially do this themselves. The value of this command is reorganising changes into logical, reviewable units.

### 2.2 Handle User Choice

**If user selects a pre-defined option:** Proceed with that strategy.

**If user selects "Custom":** Ask for details on how many PRs and what goes in each.

### 2.3 Confirm the Split Plan

Present the detailed plan for confirmation:

```markdown
## Proposed Split Plan

### PR 1: [Title]
- Purpose: [what this PR accomplishes]
- Files: [list or patterns]
- Lines: ~XXX

### PR 2: [Title]
- Purpose: [what this PR accomplishes]
- Files: [list or patterns]
- Lines: ~XXX
- Depends on: PR 1

[etc.]
```

Use `AskUserQuestion` to confirm before proceeding.

### 2.4 Validate the Plan

Run the `/plan-review` skill to check for completeness and correctness.

## Phase 3: Execute the Split

### 3.1 Prepare a Clean Starting Point

Create a temporary branch that holds all changes as staged files:

1. Record the current branch name
2. Create a temporary branch from the current HEAD
3. Soft reset to the merge base with `latest` (converts all commits to staged changes)

### 3.2 Create PR Branches

For each PR in the plan:

**First PR:**
- Branch from `latest`
- Bring in the relevant files from the temporary branch
- Use `git checkout <temp-branch> -- <files>` for clean file extraction
- Use `git add -p` for partial file staging when needed

**Subsequent PRs:**
- Branch from the previous PR's branch
- Bring in the next set of files
- Maintain the dependency chain

### 3.3 Commit Message Quality

Each commit message must:

- Start with the JIRA ticket or branch prefix
- Use imperative mood ("Add", "Fix", "Refactor")
- Explain WHAT changed and WHY (not just what files)
- Be concise but complete
- No LLM attribution or emoji

**Good example:**
```
AG-12345 Add null category handling for bar series

Previously, null categories caused bars to render at position 0.
Now they are filtered out during data processing, matching the
behaviour of line and area series.
```

**Bad example:**
```
AG-12345 Update files
```

### 3.4 Cleanup

After creating all PR branches:
- Delete the temporary branch
- Verify no uncommitted changes remain

## Phase 4: Quality Iteration (CRITICAL)

This phase is essential. Each PR must be polished until reviewer-ready, not just "builds".

### 4.1 For Each PR Branch (in order)

1. **Rebase onto base**
   - First PR: rebase onto `latest`
   - Subsequent PRs: rebase onto previous PR branch

2. **Run `/pr-review`** (via sub-agent)
   - Identify code quality issues
   - Check for logical coherence
   - Assess scope appropriateness

3. **Assess Logical Coherence**
   - Does this PR do ONE thing well?
   - Would a reviewer understand this in isolation?
   - Is the scope appropriate (500-1000 lines)?
   - Is anything missing that should be included?
   - Is anything included that belongs in a different PR?

4. **Assess Presentation Quality**
   - Is the commit message clear and descriptive?
   - Does it explain WHY, not just WHAT?
   - Would the PR title make sense in a changelog?

5. **Run Build Validation**
   - Run the project's pre-commit validation commands against each affected package
   - Ensure type checking, linting, and tests all pass before proceeding

6. **Fix Issues**
   - Code quality issues: fix and amend or add fixup commits
   - Commit message issues: `git commit --amend` to improve
   - Scope issues: consider re-splitting if the scope is wrong
   - Use code-fixup skill for complex fixes

7. **Iterate Until High Quality**
   - Repeat steps 2-6 until the PR is reviewer-ready
   - "Reviewer-ready" means: builds, tests pass, logical scope, clear purpose, good commit message
   - Ask yourself: "Would I be proud to send this for review?"

### 4.2 Quality Checklist

Before proceeding to create PRs, verify each branch meets these criteria:

- [ ] Single, clear purpose
- [ ] Appropriate scope (ideally 500-1000 lines)
- [ ] Commit message explains the change and its motivation
- [ ] All builds and tests pass
- [ ] A reviewer could understand this PR in isolation
- [ ] No obvious issues flagged by `/pr-review`

## Phase 5: Create PRs and Push

### 5.1 Push Branches

Push each branch with upstream tracking:
```bash
git push -u origin "${branch_name}"
```

### 5.2 Create Draft PRs

For each branch, create a draft PR using `gh pr create`:

- First PR targets `latest`
- Subsequent PRs target the previous PR's branch

**PR Description Template:**
```markdown
## Summary

[Brief description of what this PR accomplishes and why]

## Position in Stack

PR N of M in the series.

**Previous PR:** #<number> (if applicable)
**Next PR:** #<number> (if applicable)

## JIRA

Jira: [TICKET-12345](https://jira.example.com/browse/TICKET-12345)

## Test Plan

- [ ] Unit tests pass
- [ ] Build succeeds
- [ ] Lint passes
```

## Phase 6: Report Results

Output a summary of the created PRs:

```markdown
# PR Split Complete

## Summary

Split `{original_branch}` into {N} stacked PRs.

## PR Chain

| # | Branch | PR | Description | Base |
|---|--------|-----|-------------|------|
| 1 | {branch-part-1} | #{pr1} | {desc1} | latest |
| 2 | {branch-part-2} | #{pr2} | {desc2} | {branch-part-1} |
| ... | ... | ... | ... | ... |

## Dependency Diagram

```
latest
  └── {branch-part-1} (PR #{pr1})
        └── {branch-part-2} (PR #{pr2})
              └── {branch-part-3} (PR #{pr3})
```

## Reviewer Instructions

1. Review PRs in order (1, 2, 3, ...)
2. Each PR shows only its incremental changes
3. To see cumulative changes up to PR N, compare `{branch-part-N}` to `latest`
4. Approve and merge in order; later PRs will auto-update their base
```

## Error Handling

### Dirty Working Tree

- Inform the user they need to commit or stash changes
- Provide the command: `git stash` or `git commit -am "WIP"`
- Exit without making changes

### Merge Conflicts During Rebase

- Pause and show the conflicts to the user
- Ask if they want to resolve manually or abort
- Do not attempt automatic conflict resolution

### Build/Lint/Test Failures

- Attempt to fix using code-fixup skill
- If fixes fail after 2 attempts, ask the user for guidance
- Do not push branches with known failures

### GitHub CLI Failures

- Provide manual instructions for creating the PR via GitHub web UI
- Include the branch name, base branch, and suggested title/body

## Sub-Agent Usage Summary

| Phase | Sub-Agent Type | Purpose |
|-------|---------------|---------|
| 1 | Explore | Analyse code changes and identify logical groupings |
| 2 | plan-review (skill) | Validate the split plan |
| 4 | general-purpose | Run `/pr-review` for each branch |
| 4 | code-fixup (skill) | Fix build/lint/test issues |
