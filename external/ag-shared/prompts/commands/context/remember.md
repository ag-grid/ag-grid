---
targets: ['*']
description: 'Extract and persist learnings from conversations as agentic memory'
fork: true
---

# Remember

Extract decisions, patterns, and learnings from the current conversation and persist them as agentic memory.

## When to Use

- After resolving a non-obvious issue with a specific approach
- When discovering a pattern that should be reused
- When user corrects agent behaviour or preferences
- After clarifying how existing rules should be interpreted

## Memory Extraction

Review the conversation to identify:

1. **Decisions** - Specific choices made (e.g., "use X approach instead of Y")
2. **Corrections** - Mistakes caught and how to avoid them
3. **Patterns** - Reusable approaches that worked well
4. **Preferences** - User/project preferences revealed
5. **Clarifications** - Ambiguous rules made concrete

For each candidate, extract:
- The core learning (1-2 sentences)
- Context where it applies
- Why it matters

## Classification

Determine the best location for each memory:

| Type | Location | When |
|------|----------|------|
| Domain rule | `.rulesync/rules/{domain}.md` | Topic-specific guidance |
| Command enhancement | `.rulesync/commands/{cmd}.md` | Workflow-specific |
| Skill update | `external/prompts/skills/{skill}/` | Skill-scoped learning |
| New rule file | `.rulesync/rules/{new}.md` | Distinct topic, 3+ guidelines |

**Constraints**:
- **Never update root files directly** - `CLAUDE.md`, `AGENTS.md`, and files with `root: true` frontmatter are managed separately. If a memory belongs there, recommend creating/updating a non-root rule that gets referenced instead.
- **Prefer existing files** - only create new files when the topic is clearly distinct and has sufficient content.

## Interactive Presentation

For each memory candidate, present to user:

### Memory N of M

**Learning**: [The extracted insight]

**Recommended location**: `path/to/file.md` → Section Name

**Options**:
1. ✅ Add to recommended location
2. 📁 Add to different location (specify)
3. ✏️ Rephrase the learning
4. ⏭️ Skip this memory

Use AskUserQuestion with these options. Wait for user response before proceeding.

## Execution

For approved memories:

1. **Read** the target file to understand current structure
2. **Locate** the appropriate section (or create if needed)
3. **Format** the memory to match file conventions:
   - Rules: Use `-` bullet points, match existing tone
   - Commands: Integrate into relevant phase/section
4. **Write** the update using Edit tool
5. **Confirm** the change to user

## Output

After processing all memories, summarise:

```
## Memory Update Summary

Added: N memories
Skipped: M memories
Files modified:
- path/to/file1.md (section updated)
- path/to/file2.md (new section added)
```

## Constraints

- **Never update root files** - Do not modify `CLAUDE.md`, `AGENTS.md`, or any file with `root: true` in frontmatter. These are managed separately. Instead, create or update a non-root rule file that can be referenced.
- Keep memories atomic - one concept per update
- Match the writing style of the target file
- If unsure about location, ask user rather than guess
- Memories should be actionable, not just observations
