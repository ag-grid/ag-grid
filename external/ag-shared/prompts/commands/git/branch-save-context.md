---
targets: ['*']
description: 'Save/update branch-specific context to .context/ directory (branch memory)'
---

# Branch Save Context

Save or update context for the current branch. Keep it concise - only preserve information useful for future sessions.

## Usage

`/branch-save-context`

No arguments required - automatically detects current branch.

## Workflow

### STEP 1: Determine Context File Path

```bash
# Get current branch name
BRANCH=$(git branch --show-current)

# Get main repo root (works from worktrees)
MAIN_REPO=$(git rev-parse --path-format=absolute --git-common-dir | sed 's/\\.git$//')

# Derive slug with hash suffix to avoid collisions (e.g. feature/foo vs feature-foo)
SLUG_BASE=$(echo "$BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
HASH=$(echo -n "$BRANCH" | shasum | cut -c1-6)
SLUG="${SLUG_BASE}-${HASH}"

# Context file path
CONTEXT_FILE="${MAIN_REPO}.context/${SLUG}.md"

# Ensure directory exists
mkdir -p "${MAIN_REPO}.context"
```

### STEP 2: Check for Existing Context

If the context file already exists, read its current contents. When updating, **prune resolved items and transient issues**.

### STEP 3: Gather Context Information

Ask the user what to save. Keep responses brief.

**For new context**: What's the branch intent? Any patterns worth remembering?

**For updates**: What changed? Any gaps resolved? New patterns discovered?

### STEP 4: Write Context File

Use this minimal template:

```markdown
---
branch: {branch-name}
updated: {ISO-date}
---

# {branch-name}

## Intent

{1-2 sentences: what this branch accomplishes}

## Patterns

{Only include if there are reusable code patterns}

## Gaps

{Only persistent gaps - architectural decisions, known limitations}

## References

{Links to ticket, relevant docs}
```

### STEP 5: Confirm Save

```
Saved: {context-file-path}
```

## What to Keep vs Prune

### KEEP (future-relevant)

- High-level intent (stable goal of the branch)
- Reusable patterns (code you'll copy again)
- Persistent gaps (architectural decisions pending, known limitations)
- Reference links (ticket, design docs)

### PRUNE (transient)

- Temporary test failures
- Build/environment issues
- Implementation gaps now resolved
- Debugging notes and scratch work
- Session-specific troubleshooting
- Resolved gaps (remove the checkbox, just delete)

## Principles

- **Brevity over completeness** - if in doubt, leave it out
- **Future self test** - will this help in a new session next week?
- **No resolved items** - once fixed, remove it entirely
- **Patterns must be reusable** - don't document one-off code
