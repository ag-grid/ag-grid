---
targets: ['*']
name: rulesync
description: 'Use this skill whenever creating, editing, registering, or troubleshooting skills, commands, rules, subagents, or any AI prompt file. Covers SKILL.md authoring, frontmatter syntax (targets, description, globs, alwaysApply), symlink setup between .rulesync/ and external/ tiers, and regeneration/verification via setup-prompts.sh and verify-rulesync.sh. Also use when referencing .rulesync/, .claude/, .cursor/, .copilot/, or any AI tooling config directory — .rulesync/ is the single source of truth and generated directories must never be edited directly. IMPORTANT: Always load this skill alongside the skill-creator plugin — when creating or improving any skill, this skill provides the correct file locations, registration steps, and content tier decisions that the skill-creator workflow depends on.'
---

# Rulesync Configuration Guide

`.rulesync/` is the **single source of truth** for all AI/agentic tooling configuration in this repository. Tool-specific directories like `.claude/`, `.cursor/`, `.copilot/`, etc. are **generated output** -- never edit them directly. All changes go through `.rulesync/` and are propagated by the rulesync generator.

This matters because we support multiple AI tools, and maintaining separate configs for each would lead to drift and inconsistency. Rulesync solves this by generating tool-specific formats from one canonical source.

See [Rulesync Configuration](https://github.com/dyoshikawa/rulesync?tab=readme-ov-file#configuration) for upstream documentation.

## Directory Structure

```
.rulesync/
├── .aiignore              # Files to exclude from AI context
├── mcp.json               # MCP server configuration
├── commands/              # Slash commands
├── rules/                 # Context rules and guides
├── subagents/             # Agent definitions
└── skills/                # Complex workflow skills
```

## Content Source Tiers

Files in `.rulesync/` are either local files or symlinks to one of three source tiers:

| Source | Purpose | When to Use |
|--------|---------|-------------|
| `.rulesync/` directly | Repo-specific content | Content unique to this repo that can be public |
| `external/prompts/` | Repo-private shared content | Product-specific content (e.g. AG Charts testing, JIRA templates) |
| `external/ag-shared/prompts/` | Cross-repo shared content | Content reusable across AG Charts and AG Grid (git conventions, code quality) |

**Decision guide:**
- Will AG Grid also need this? -> `external/ag-shared/prompts/`
- Is it product-specific but shared across worktrees? -> `external/prompts/`
- Is it unique to this repo checkout? -> `.rulesync/` directly

## Frontmatter Reference

All rulesync-managed files require YAML frontmatter. The required fields depend on the file type.

### Commands

```yaml
---
targets: ['*']
description: 'Brief description of what this command does'
---
```

Commands become slash commands (e.g. `/docs-review`). The `description` appears in the skill/command list.

### Rules/Guides

```yaml
---
globs: ['pattern1', 'pattern2']
alwaysApply: true|false
---
```

Rules are loaded automatically based on file context. Choose globs that match where the guidance applies:

| Rule Type | Glob Pattern Example | When Loaded |
|-----------|---------------------|-------------|
| Domain-specific | `['**/series/**/*.ts']` | Working with series code |
| Test guidance | `['**/*.test.ts', '**/*.spec.ts']` | Working with test files |
| Script/tool | `['**/setup-prompts/**/*']` | Working with setup scripts |
| Always needed | `alwaysApply: true` | Every conversation |

Use `alwaysApply: true` sparingly -- it adds to every conversation's context budget. Prefer specific globs.

### Skills

```yaml
---
targets: ['*']
name: skill-name
description: 'Brief description of the skill'
---
```

Optional fields:
- `context: fork` -- for skills that manage branch/worktree context
- `invocable: user-only` -- prevents the agent from auto-invoking (user must type `/skill-name`)

Skills become invocable via `/skill-name`. The `description` determines when the agent auto-invokes the skill, so make it thorough and include trigger phrases.

### Subagents

```yaml
---
targets: ['*']
name: agent-name
description: 'Brief description (quote if contains colons)'
claudecode:
    model: opus|sonnet
    tools:
        - Read
        - Grep
        - Bash
---
```

Subagents are specialised agents spawned via the Agent tool. The `model` and `tools` fields control their capabilities.

### YAML Gotchas

Quote descriptions containing colons -- YAML interprets bare colons as mapping keys:

```yaml
# BAD - YAML sees "Context:" as a mapping key
description: Examples: <example>Context: The user...

# GOOD - Quoted string handles colons correctly
description: "Examples: <example>Context: The user..."
```

## Symlink Patterns

Content from `external/` is included via symlinks. The key distinction:

- **Commands, rules, subagents**: Use **file** symlinks (`.md` file -> `.md` file)
- **Skills**: Use **directory** symlinks (directory -> directory)

This is because skills can contain multiple files (SKILL.md + helpers, templates, scripts).

```bash
# From .rulesync/commands/
ln -s ../../external/ag-shared/prompts/commands/git/bisect.md git-bisect.md
ln -s ../../external/prompts/commands/docs-create.md docs-create.md

# From .rulesync/rules/
ln -s ../../external/ag-shared/prompts/guides/code-quality.md code-quality.md

# From .rulesync/subagents/
ln -s ../../external/ag-shared/prompts/agents/code-reviewer.md code-reviewer.md
ln -s ../../external/prompts/subagents/visual-qa.md visual-qa.md

# From .rulesync/skills/ (DIRECTORY symlinks)
ln -s ../../external/ag-shared/prompts/skills/dev-server/ dev-server
ln -s ../../external/ag-shared/prompts/skills/jira jira
```

## Adding New Content

### Adding a Command

1. **Choose tier**: Local (`.rulesync/commands/`), private (`external/prompts/commands/`), or shared (`external/ag-shared/prompts/commands/`)
2. **Create the file** with command frontmatter:
   ```yaml
   ---
   targets: ['*']
   description: 'What this command does'
   ---

   # Command Name

   Instructions for the command...
   ```
3. **If not local**: Create a file symlink from `.rulesync/commands/`:
   ```bash
   cd .rulesync/commands
   ln -s ../../external/prompts/commands/my-command.md my-command.md
   ```
4. **Regenerate and verify** (see below)

### Adding a Rule/Guide

1. **Choose tier** and create the `.md` file with rule frontmatter
2. **Choose globs** carefully -- specific patterns keep context budgets lean
3. **If not local**: Create a file symlink from `.rulesync/rules/`:
   ```bash
   cd .rulesync/rules
   ln -s ../../external/ag-shared/prompts/guides/my-guide.md my-guide.md
   ```
4. **Regenerate and verify**

### Adding a Skill

1. **Choose tier** and create a **directory** with `SKILL.md` inside:
   ```
   external/prompts/skills/my-skill/
   ├── SKILL.md
   ├── template.md      # Optional helper files
   └── helper-script.sh # Optional scripts
   ```
2. **Write SKILL.md** with skill frontmatter. Make the `description` thorough -- it controls auto-triggering
3. **Create a directory symlink** from `.rulesync/skills/`:
   ```bash
   cd .rulesync/skills
   ln -s ../../external/prompts/skills/my-skill/ my-skill
   ```
4. **Regenerate and verify**

### Adding a Subagent

1. **Choose tier** and create the `.md` file with subagent frontmatter
2. **Pick model and tools** appropriate to the agent's purpose (use `sonnet` for fast tasks, `opus` for complex reasoning)
3. **If not local**: Create a file symlink from `.rulesync/subagents/`:
   ```bash
   cd .rulesync/subagents
   ln -s ../../external/prompts/subagents/my-agent.md my-agent.md
   ```
4. **Regenerate and verify**

## Generation and Verification

After any changes to `.rulesync/` or its source files:

```bash
# Regenerate tool-specific configs from .rulesync/
./external/ag-shared/scripts/setup-prompts/setup-prompts.sh

# Verify everything is consistent
./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh
```

The verification script checks:
- All frontmatter is valid YAML with required fields
- All symlinks resolve to existing files
- Generated output matches the expected file inventory
- Content integrity between source and generated output

To validate that file path references within prompt files are correct, use the `/validate-prompts` skill.

## Anti-patterns

**Never edit generated directories directly.** `.claude/`, `.cursor/`, `.copilot/`, and other tool-specific directories are generated output. Edits will be overwritten on the next `setup-prompts.sh` run. Always edit in `.rulesync/` or the source file it symlinks to.

**Never commit the TOON block in AGENTS.md.** Rulesync's `agentsmd` target prepends a TOON-format rules index to `AGENTS.md`. This block starts with `Please also reference the following rules as needed. The list below is provided in TOON format` and lists all rules with paths, descriptions, and `applyTo` globs. **Never keep or commit this block.** It is generated noise that bloats `AGENTS.md` with content already available. The `setup-prompts.sh --postinstall` flag handles this automatically (stash user edits, reset after rulesync, restore edits), but if you run rulesync manually and see this block appear in `AGENTS.md`, discard it with `git checkout -- AGENTS.md`.

**Never reference `external/` paths from prompt cross-references.** When one rule or skill references another (e.g. "see the testing guide"), use `.rulesync/` paths (e.g. `.rulesync/rules/testing.md`), not `external/` source paths. Symlink setup instructions and source-tier descriptions naturally use `external/` paths — that's fine. The `/validate-prompts` skill checks for incorrect cross-references.

**Never add `alwaysApply: true` without good reason.** Every always-applied rule consumes context budget in every conversation. Reserve this for core project rules that genuinely apply everywhere.

## Troubleshooting

### YAML Parse Errors
- Check for unquoted colons in description fields
- Ensure proper indentation (2 spaces)
- Validate with `npx yaml-lint <file>`

### Missing Files in Output
- Verify symlink targets exist: `ls -la .rulesync/skills/my-skill`
- Check frontmatter has required fields (`targets` for commands/skills/subagents, `globs` for rules)
- Ensure file extension is `.md`

### Skills Not Appearing
- Skills need **directory** symlinks, not file symlinks
- The skill directory must contain a `SKILL.md` file
- Check the `name` field matches the directory name

### Verification Failures
- Run `rulesync generate -t claudecode` manually for detailed error output
- Check the temp directory output for comparison with expected inventory
