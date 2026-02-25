---
targets: ['*']
description: 'Load branch context and browse project memory for session resumption'
---

# Recall

## Usage — `/recall`

Load branch-scoped context from `.context/` and optionally browse project-scoped memory in `.rulesync/`.

## STEP 1: Load Branch Memory

### Determine Context File Path

```bash
# Get current branch name
BRANCH=$(git branch --show-current)

# Get main repo root (works from worktrees)
MAIN_REPO=$(git rev-parse --path-format=absolute --git-common-dir | sed 's/\.git$//')

# Derive slug with hash suffix to avoid collisions (e.g. feature/foo vs feature-foo)
SLUG_BASE=$(echo "$BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
HASH=$(echo -n "$BRANCH" | shasum | cut -c1-6)
SLUG="${SLUG_BASE}-${HASH}"

# Context file path
CONTEXT_FILE="${MAIN_REPO}.context/${SLUG}.md"
```

### Load and Present

Check if the context file exists:

```bash
if [ -f "$CONTEXT_FILE" ]; then
    echo "Found context file: $CONTEXT_FILE"
else
    echo "No context file found for branch: $BRANCH"
fi
```

**If found**, read and present its contents:

```markdown
## Branch Context Loaded: {branch}

**Intent**: {summary of intent section}

**Key Patterns**: {count} patterns documented

**Known Gaps**: {count} gaps tracked

**References**: {count} references available

---

{Full context file contents}
```

**If not found**, inform the user:

> No saved context found for branch `{branch}`.
>
> Run `/remember` and choose **Branch** to create context for this branch.

## STEP 2: Project Memory Summary (optional)

After presenting branch context, offer to show project memory:

> Project rules and learnings in `.rulesync/rules/` load automatically based on file-pattern globs.
> Want to browse the project memory files?

If the user says yes:

1. List `.rulesync/rules/` files with a one-line description of each
2. User can request to read specific memory files for details
3. This is informational — project rules auto-load during normal work via globs

## Notes

- Context files are stored in the main repo root, shared across all worktrees
- Context persists even when worktrees are deleted
- Branch context files are gitignored — this is personal/local context, not shared
- Project memory (`.rulesync/rules/`) is committed and shared with the team
