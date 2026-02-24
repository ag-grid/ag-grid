---
targets: ['*']
description: 'Save branch context or project learnings as agentic memory'
---

# Remember

## Usage — `/remember`

Save branch-scoped context (`.context/`) or project-scoped learnings (`.rulesync/`).

## STEP 1: Choose Memory Type

Ask the user:

**What would you like to remember?**

1. **Branch** — save context for this branch (intent, patterns, gaps)
2. **Project** — extract learnings from this conversation into rules/skills
3. **Both** — do branch first, then project

Use AskUserQuestion. Then follow the corresponding path(s) below.

---

## Branch Memory Path

Save or update context for the current branch. Keep it concise — only preserve information useful for future sessions.

### STEP B1: Determine Context File Path

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

# Ensure directory exists
mkdir -p "${MAIN_REPO}.context"
```

### STEP B2: Check for Existing Context

If the context file already exists, read its current contents. When updating, **prune resolved items and transient issues**.

### STEP B3: Gather Context Information

Ask the user what to save. Keep responses brief.

**For new context**: What's the branch intent? Any patterns worth remembering?

**For updates**: What changed? Any gaps resolved? New patterns discovered?

### STEP B4: Write Context File

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

{Only persistent gaps — architectural decisions, known limitations}

## References

{Links to ticket, relevant docs}
```

### STEP B5: Confirm Save

```
Saved: {context-file-path}
```

### What to Keep vs Prune

**KEEP** (future-relevant):

- High-level intent (stable goal of the branch)
- Reusable patterns (code you'll copy again)
- Persistent gaps (architectural decisions pending, known limitations)
- Reference links (ticket, design docs)

**PRUNE** (transient):

- Temporary test failures
- Build/environment issues
- Implementation gaps now resolved
- Debugging notes and scratch work
- Session-specific troubleshooting
- Resolved gaps (remove the checkbox, just delete)

### Principles

- **Brevity over completeness** — if in doubt, leave it out
- **Future self test** — will this help in a new session next week?
- **No resolved items** — once fixed, remove it entirely
- **Patterns must be reusable** — don't document one-off code

---

## Project Memory Path

Extract decisions, patterns, and learnings from the current conversation and persist them as agentic memory.

### When to Use

- After resolving a non-obvious issue with a specific approach
- When discovering a pattern that should be reused
- When user corrects agent behaviour or preferences
- After clarifying how existing rules should be interpreted

### STEP P1: Memory Extraction

Review the conversation to identify:

1. **Decisions** — Specific choices made (e.g., "use X approach instead of Y")
2. **Corrections** — Mistakes caught and how to avoid them
3. **Patterns** — Reusable approaches that worked well
4. **Preferences** — User/project preferences revealed
5. **Clarifications** — Ambiguous rules made concrete

For each candidate, extract:
- The core learning (1-2 sentences)
- Context where it applies
- Why it matters

### STEP P2: Classification

Determine the best location for each memory:

| Type | Location | When |
|------|----------|------|
| Domain rule | `.rulesync/rules/{domain}.md` | Topic-specific guidance |
| Command enhancement | `.rulesync/commands/{cmd}.md` | Workflow-specific |
| Skill update | `external/prompts/skills/{skill}/` | Skill-scoped learning |
| New rule file | `.rulesync/rules/{new}.md` | Distinct topic, 3+ guidelines |

**Constraints**:
- **Never update root files directly** — `CLAUDE.md`, `AGENTS.md`, and files with `root: true` frontmatter are managed separately. If a memory belongs there, recommend creating/updating a non-root rule that gets referenced instead.
- **Prefer existing files** — only create new files when the topic is clearly distinct and has sufficient content.

### STEP P3: Interactive Presentation

For each memory candidate, present to user:

#### Memory N of M

**Learning**: [The extracted insight]

**Recommended location**: `path/to/file.md` → Section Name

**Options**:
1. Add to recommended location
2. Add to different location (specify)
3. Rephrase the learning
4. Skip this memory

Use AskUserQuestion with these options. Wait for user response before proceeding.

### STEP P4: Execution

For approved memories:

1. **Read** the target file to understand current structure
2. **Locate** the appropriate section (or create if needed)
3. **Format** the memory to match file conventions:
   - Rules: Use `-` bullet points, match existing tone
   - Commands: Integrate into relevant phase/section
4. **Write** the update using Edit tool
5. **Confirm** the change to user

### STEP P5: Output

After processing all memories, summarise:

```
## Memory Update Summary

Added: N memories
Skipped: M memories
Files modified:
- path/to/file1.md (section updated)
- path/to/file2.md (new section added)
```

### Project Memory Constraints

- **Never update root files** — Do not modify `CLAUDE.md`, `AGENTS.md`, or any file with `root: true` in frontmatter. These are managed separately. Instead, create or update a non-root rule file that can be referenced.
- Keep memories atomic — one concept per update
- Match the writing style of the target file
- If unsure about location, ask user rather than guess
- Memories should be actionable, not just observations
