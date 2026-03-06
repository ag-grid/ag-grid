---
targets: ['*']
name: validate-prompts
description: 'Validate prompt file references for consistency, canonical paths, and hygiene'
invocable: user-only
---

# Validate Prompts Skill

This skill scans `.rulesync/` source files for common path reference issues and reports them. It does **not** auto-fix anything — it reports only, so the user can review before making changes.

## When to Use This Skill

Activate this skill when the user requests:

-   "Run validate-prompts"
-   "Check prompt file references"
-   "Validate rulesync files"
-   "Are there any stale references in the prompts?"

## Workflow

### Step 1: Bare `skills/` or `rules/` references

Grep `.rulesync/` source files (skills, rules, commands) for unanchored `skills/` or `rules/` paths that are not:

-   Relative paths starting with `../` or `./`
-   Already prefixed with `.rulesync/`
-   Co-located file references (bare filename with no directory separator)

These should use `.rulesync/skills/` or `.rulesync/rules/` as the prefix.

```bash
grep -rn --include="*.md" -E "(^|[^./\w])(skills|rules)/" .rulesync/ | grep -v "\.rulesync/" | grep -v "\.\.\/" | grep -v "^\.\/"
```

### Step 2: `external/prompts/` or `external/ag-shared/prompts/` references

Any path using `external/` directly should use the `.rulesync/` equivalent instead. Three categories are **excluded** from this check (but still validated for existence in Step 6):

-   `.rulesync/README.md` — structural overview that describes the `external/prompts/` convention by design
-   `external/prompts/**/_*.md` — underscore-prefixed shared core partials with no `.rulesync/` equivalent
-   `external/prompts/technical-review*/**` — review exception/plan files that live in `external/prompts/` by design

```bash
grep -rn --include="*.md" -E "external/(prompts|ag-shared/prompts)/" .rulesync/
```

After running the grep, filter out hits matching these patterns:

-   The file producing the hit is `.rulesync/README.md`
-   The matched path matches `external/prompts/_*.md` (underscore-prefixed partial)
-   The matched path matches the prefix `external/prompts/technical-review*/`

The remaining hits are genuine issues. Note: excluded `external/` paths are still validated for file existence in Step 6.

### Step 3: `.claude/` references in source files

`.rulesync/` source files should not reference `.claude/` paths (which are generated output). Exclude `.gitignore` from this check.

```bash
grep -rn --include="*.md" "\.claude/" .rulesync/ | grep -v "\.gitignore" | grep -v "README\.md"
```

### Step 4: Stale symlinks in `.rulesync/`

Check for broken symlinks whose targets no longer exist.

```bash
find .rulesync/ -type l | while read link; do
  if [ ! -e "$link" ]; then
    echo "$link -> (broken: $(readlink "$link"))"
  fi
done
```

### Step 5: Orphaned generated files in `.claude/`

Run rulesync's check mode to see if generated files are out of date.

```bash
npx rulesync generate --check
```

Note: If `npx rulesync generate --check` is not supported, skip this step and note it in the report.

### Step 6: Cross-reference validation

For each file path referenced in backticks within `.rulesync/` files, verify the target exists. Skip:

-   `${VARIABLE}` placeholders
-   Relative co-located references (bare filenames like `jira-bug-template.md` noted as "in this skill directory")
-   Relative paths (`../../rules/jira.md`, `../jira-create/SKILL.md`)
-   Non-file references (URLs, command examples, code snippets)

Extract backtick references that look like file paths (contain `/` and don't start with `$`):

```bash
grep -rn --include="*.md" -oE '\`[^`]*\/[^`]*\`' .rulesync/ | grep -v '\${'
```

For each match, determine if it's a plausible file path (ends in `.md`, `.ts`, `.json`, etc. or contains a directory structure) and check if it exists from the repo root.

In addition, validate `external/` paths that were excluded from Step 2 (underscore-prefixed partials and technical-review files) — check these for existence unless they contain `${VARIABLE}` placeholders.

## Output Format

Produce a grouped report in this exact format:

```
## Prompt Validation Report

### Bare path references (need .rulesync/ prefix)
- .rulesync/skills/foo/SKILL.md:42: `rules/jira.md`

### external/ path references (use .rulesync/ instead)
- .rulesync/skills/bar/SKILL.md:31: `external/prompts/commands/baz.md`

### .claude/ references in source files (use .rulesync/ instead)
- .rulesync/skills/qux/SKILL.md:26: `.claude/rules/technology-stack.md`

### Stale symlinks
- .rulesync/commands/old-command.md -> (broken)

### Generated files out of date
- (output from rulesync generate --check, or "Check not supported / skipped")

### Broken cross-references
- .rulesync/skills/foo/SKILL.md:88 references `.rulesync/rules/nonexistent.md` (not found)

✅ No issues found
```

Or, if issues were found:

```
❌ Found N issue(s)
```

with a count of total issues across all sections.

## Anti-patterns / Rules

-   **Do NOT auto-fix** — report only, never modify any files
-   **Do NOT modify any files** during this skill
-   Co-located references (e.g. `jira-bug-template.md` with "(in this skill directory)") are OK — skip these
-   Relative paths (`../../rules/jira.md`, `../jira-create/SKILL.md`) are OK — skip these
-   `.gitignore` entries referencing `.claude/` are OK — skip these
-   `${VARIABLE}` placeholders are OK — skip these
-   Grep output in code examples (e.g. `grep -rn "skills/"`) are OK — only flag prose references
-   `.rulesync/README.md` is excluded from Steps 2 and 3 — it is a structural overview document that describes the `external/prompts/` and `.claude/` conventions by design
-   `external/prompts/**/_*.md` references (underscore-prefixed shared partials) are OK in Step 2 — validate existence in Step 6
-   `external/prompts/technical-review*/**` references are OK in Step 2 — validate existence in Step 6
