---
targets: ['*']
name: ag-shared-sync-log
description: 'Generate migration log entries for ag-shared changes. Use when changes have been made to external/ag-shared/ and you need to document what changed and what companion actions consuming repos need to perform when syncing. Also use when preparing to sync ag-shared across repos, after completing work that touched ag-shared files, or when the user asks about migration steps for ag-shared changes.'
---

# ag-shared Sync Log Generator

Generate structured migration log entries for changes to `external/ag-shared/`. The log captures what changed and what companion actions consuming repos need to perform when they pull these changes, so sync operations have a ready-made checklist instead of re-deriving everything from scratch.

The log lives at `external/ag-shared/docs/SYNC-LOG.md` and travels with the subrepo.

## Help

If the user provides a command option of `help`:

-   Explain how to use this skill.
-   Show the entry template format.
-   DO NOT proceed, exit the skill immediately after these steps.

## STEP 1: Determine Git Range

Identify the commit range to analyse for ag-shared changes.

### Auto-detect (default)

When no explicit range is provided:

```bash
# Find the default branch
DEFAULT_BRANCH="latest"
git rev-parse --verify "origin/$DEFAULT_BRANCH" >/dev/null 2>&1 || DEFAULT_BRANCH="main"

# Find the merge base
BASE=$(git merge-base HEAD "origin/$DEFAULT_BRANCH")
TARGET="HEAD"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Verify there are ag-shared changes
CHANGES=$(git diff "$BASE"..."$TARGET" --name-only -- external/ag-shared/)
```

### Explicit range

When `${ARGUMENTS}` contains `--range <from>..<to>`:

```bash
BASE="<from>"
TARGET="<to>"
# Use the provided range
CHANGES=$(git diff "$BASE"..."$TARGET" --name-only -- external/ag-shared/)
```

If no changes are found in `external/ag-shared/`, report "No ag-shared changes found in the specified range" and **STOP**.

## STEP 2: Analyse Changes

Run these commands to understand what changed:

```bash
# File-level summary
git diff "$BASE"..."$TARGET" --stat -- external/ag-shared/

# Detailed diff
git diff "$BASE"..."$TARGET" -- external/ag-shared/

# Commit log scoped to ag-shared
git log --oneline "$BASE"..."$TARGET" -- external/ag-shared/

# Detect added/removed files
git diff "$BASE"..."$TARGET" --diff-filter=A --name-only -- external/ag-shared/
git diff "$BASE"..."$TARGET" --diff-filter=D --name-only -- external/ag-shared/
git diff "$BASE"..."$TARGET" --diff-filter=R --name-only -- external/ag-shared/
```

### Categorise Each Changed File

Sort every changed file into one of these categories based on its path within `external/ag-shared/`:

| Path Pattern | Category | Tag |
|---|---|---|
| `prompts/skills/<name>/` | Skill | `[prompts/skills]` |
| `prompts/guides/<name>.md` | Guide/Rule | `[prompts/guides]` |
| `prompts/commands/<name>.md` | Command | `[prompts/commands]` |
| `prompts/agents/<name>.md` | Agent/Subagent | `[prompts/agents]` |
| `prompts/patches/` | Patch | `[prompts/patches]` |
| `prompts/.claude-settings.json` | Config | `[prompts/config]` |
| `prompts/.mcp.json` | MCP Config | `[prompts/config]` |
| `scripts/setup-prompts/` | Setup Scripts | `[scripts/setup-prompts]` |
| `scripts/sync-rulesync/` | Sync Scripts | `[scripts/sync-rulesync]` |
| `scripts/git-hooks/` | Git Hooks | `[scripts/git-hooks]` |
| `scripts/ci/` | CI Scripts | `[scripts/ci]` |
| `scripts/subrepo/` | Subrepo Wrapper | `[scripts/subrepo]` |
| `scripts/*` (other) | General Scripts | `[scripts]` |
| `github/` | GitHub Workflows | `[github]` |
| `src/` | Runtime Code | `[src]` |
| `docs/` | Documentation | `[docs]` |
| Other | Miscellaneous | `[other]` |

## STEP 3: Determine Companion Actions

Map each category of change to the companion actions consuming repos need to perform. Use this decision tree:

### Symlink changes (add/remove/rename)

For **added** items:
- New skill directory → Add directory symlink: `.rulesync/skills/<name>` -> `../../external/ag-shared/prompts/skills/<name>/`
- New guide/rule file → Add file symlink: `.rulesync/rules/<name>.md` -> `../../external/ag-shared/prompts/guides/<name>.md`
- New command file → Add file symlink: `.rulesync/commands/<name>.md` -> `../../external/ag-shared/prompts/commands/<name>.md`
- New agent file → Add file symlink: `.rulesync/subagents/<name>.md` -> `../../external/ag-shared/prompts/agents/<name>.md`

For **removed** items:
- Removed skill → Remove directory symlink from `.rulesync/skills/`
- Removed guide → Remove file symlink from `.rulesync/rules/`
- Removed command → Remove file symlink from `.rulesync/commands/`
- Removed agent → Remove file symlink from `.rulesync/subagents/`

For **renamed** items: combine a remove + add.

### Script and config changes

- `scripts/setup-prompts/` changed → Run `./external/ag-shared/scripts/setup-prompts/setup-prompts.sh`
- `scripts/sync-rulesync/` changed → Run `./external/ag-shared/scripts/sync-rulesync/sync-rulesync.sh --apply`
- `prompts/patches/` changed → Run `./external/ag-shared/scripts/sync-rulesync/sync-rulesync.sh --apply`
- `scripts/git-hooks/` changed → Hooks auto-install; verify with `ls -la .git/hooks/`
- `github/` changed → Review `.github/workflows/` in consuming repos for alignment
- `scripts/ci/` changed → Review CI configuration in consuming repos
- `package.json` changed → Check consuming repos' dependency declarations

### Baseline actions (always include)

Every sync should end with:
- Run `./external/ag-shared/scripts/setup-prompts/setup-prompts.sh`
- Run `./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh`

## STEP 4: Generate Log Entry

Format the entry using this template:

```markdown
## YYYY-MM-DD -- <short-description>

**Branch:** `<branch-name>`
**Commits:** `<base-sha>..<head-sha>` (<N> commits)

### Changes

- **[category]** <description of change>
- **[category]** <description of change>

### Migration Actions

- [ ] <action 1>
- [ ] <action 2>
- [ ] Run `./external/ag-shared/scripts/setup-prompts/setup-prompts.sh`
- [ ] Run `./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh`

### Notes

<optional context, gotchas, or special instructions — omit section if nothing to note>
```

Guidelines for the entry:
- **Short description**: Derive from commit messages — summarise the theme of changes in a few words.
- **Changes**: One bullet per logical change, grouped by category tag. Summarise bulk changes rather than listing every file (e.g. "Updated 12 skill files to add frontmatter" not 12 separate bullets).
- **Migration Actions**: Concrete, actionable checklist items. Use exact commands and paths. Place symlink changes before script-run actions.
- **Notes**: Include only if there are gotchas, breaking changes, or special instructions. Omit the section entirely if empty.

Present the draft entry to the user for review. If `${ARGUMENTS}` contains `--dry-run`, show the entry and **STOP** without writing.

## STEP 5: Write to Log

1. Read `external/ag-shared/docs/SYNC-LOG.md`. If the file does not exist, create it with this header:

```markdown
# ag-shared Sync Log

Migration log for `external/ag-shared/` changes. Each entry documents what changed and what companion actions consuming repos need to perform when syncing.

Newest entries first. Generated by `/ag-shared-sync-log`.

---
```

2. Insert the new entry immediately after the `---` separator line following the header (i.e. prepend to the entry list so newest is first).

3. Write the updated file.

4. Report the entry was added and show the final result.

## Arguments

`${ARGUMENTS}` can optionally include:

-   `--range <from>..<to>` — analyse a specific commit range instead of auto-detecting.
-   `--dry-run` — generate and display the entry without writing to the log file.
-   `help` — show usage information.
