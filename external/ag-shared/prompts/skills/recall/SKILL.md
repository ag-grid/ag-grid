---
targets: ['*']
name: recall
description: Load branch context and browse project memory for session resumption
invocable: user-only
context: fork
---

# Recall

## Usage — `/recall`

Load branch-scoped context from `.context/` and optionally browse project-scoped memory in `.rulesync/`.

## STEP 1: Load Branch Memory

### Determine Context File Path and Load Content

Run the co-located script to resolve paths and load any existing context. Use the skill base directory from the header above:

```bash
bash "<skill-base-directory>/context-path.sh" --list-rules
```

Parse the structured output:
- `BRANCH=` — current branch name
- `SLUG=` — filename slug
- `CONTEXT_FILE=` — full path to context file
- `STATUS=found|not_found` — whether context exists
- Content after `---CONTENT---` — existing context file contents (if found)
- Content after `---RULES---` — list of project rule files (if present)

### Present Branch Context

**If found**, present its contents:

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

1. Present the rules listing from the `---RULES---` section of the script output
2. User can request to read specific memory files for details
3. This is informational — project rules auto-load during normal work via globs

## Notes

- Context files are stored in the main repo root, shared across all worktrees
- Context persists even when worktrees are deleted
- Branch context files are gitignored — this is personal/local context, not shared
- Project memory (`.rulesync/rules/`) is committed and shared with the team
