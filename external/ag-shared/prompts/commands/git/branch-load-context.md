---
targets: ['*']
description: 'Load branch-specific context from .context/ directory (branch memory)'
---

# Branch Load Context

Load saved context for the current branch to resume work with full awareness of intent, patterns, and known gaps.

## Usage

`/branch-load-context`

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
```

### STEP 2: Load Context

Check if the context file exists:

```bash
if [ -f "$CONTEXT_FILE" ]; then
    echo "Found context file: $CONTEXT_FILE"
else
    echo "No context file found for branch: $BRANCH"
fi
```

### STEP 3: Present Context

If the context file exists, read and present its contents to provide awareness of:

- **Intent**: What this branch is trying to accomplish
- **Key Patterns**: Code snippets and approaches used in this branch
- **Known Gaps**: Outstanding issues or areas needing attention
- **References**: Relevant commands, docs, tickets, or websites

If no context file exists, inform the user:

> No saved context found for branch `{branch}`.
>
> Run `/branch-save-context` to create context for this branch.

## Output Format

When context is found, present a summary:

```markdown
## Branch Context Loaded: {branch}

**Intent**: {summary of intent section}

**Key Patterns**: {count} patterns documented

**Known Gaps**: {count} gaps tracked

**References**: {count} references available

---

{Full context file contents}
```

## Notes

- Context files are stored in the main repo root, shared across all worktrees
- Context persists even when worktrees are deleted
- Files are gitignored - this is personal/local context, not shared
