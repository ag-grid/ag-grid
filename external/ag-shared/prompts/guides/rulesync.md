---
globs:
    [
        '.rulesync/**/*.md',
        'external/ag-shared/prompts/**/*.md',
        'external/prompts/**/*.md',
        '**/AGENTS.md',
        '**/.agent/**/*.md',
        '**/.agents/**/*.md',
        '**/.ai/**/*.md',
        '**/.augment/rules/**/*.md',
        '**/CLAUDE.md',
        '**/.claude/**/*.md',
        '**/.clinerules/**/*.md',
        '**/.codex/**/*.md',
        '**/.cursor/**/*.md',
        '**/GEMINI.md',
        '**/.gemini/**/*.md',
        '**/.github/copilot-instructions.md',
        '**/.github/instructions/**/*.md',
        '**/.github/prompts/**/*.md',
        '**/.github/agents/**/*.md',
        '**/.github/skills/**/*.md',
        '**/.junie/**/*.md',
        '**/.kilocode/**/*.md',
        '**/.kiro/steering/**/*.md',
        '**/.opencode/**/*.md',
        '**/QWEN.md',
        '**/.qwen/**/*.md',
        '**/.roo/**/*.md',
        '**/.warp/**/*.md',
        '**/WARP.md',
    ]
alwaysApply: false
---

# Rulesync Configuration Guide

This guide covers setting up and maintaining the `.rulesync/` directory structure for AI agentic tooling across AG Grid and AG Charts repositories.

## Overview

Rulesync generates tool-specific configuration files (e.g., `.claude/`, `.cursor/`) from a unified source in `.rulesync/`. This enables consistent AI agent behaviour across different tools while maintaining a single source of truth.

## Rulesync Configuration Reference

See [Rulesync Configuration](https://github.com/dyoshikawa/rulesync?tab=readme-ov-file#configuration) for relevant documentation.

## Directory Structure

```
.rulesync/
├── .aiignore              # Files to exclude from AI context
├── mcp.json               # MCP server configuration (symlink)
├── commands/              # Slash commands (symlinks)
├── rules/                 # Context rules and guides (symlinks + repo-specific)
├── subagents/             # Agent definitions (symlinks)
└── skills/                # Complex workflow skills (symlinks)
```

## Content Sources

Files in `.rulesync/` are either simple files, or symlinks to files in other locations:

| Source                        | Purpose                                                         | Examples                            |
| ----------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| `.rulesync/`                  | Repo-specific rules + symlink-based inclusion of shared content | `ag-charts.md`, `ag-grid.md`        |
| `external/ag-shared/prompts/` | Cross-repo shared content                                       | `code-reviewer.md`, `jira.md`       |
| `external/prompts/`           | Repo-private shared content                                     | `spruce-example.md`, `visual-qa.md` |

## Frontmatter Requirements

All rulesync-managed files require YAML frontmatter with `targets`:

### Commands

```yaml
---
targets: ['*']
description: 'Brief description of what this command does'
---
```

### Agents/Subagents

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

### Rules/Guides

```yaml
---
globs:
alwaysApply: true|false
---
```

### Skills

```yaml
---
targets: ['*']
name: skill-name
description: 'Brief description of the skill'
context: fork # Optional: fork context for complex workflows
---
```

## YAML Gotchas

**Quote descriptions containing colons:**

```yaml
# BAD - YAML sees "Context:" as a mapping key
description: Examples: <example>Context: The user...

# GOOD - Quoted string handles colons correctly
description: "Examples: <example>Context: The user..."
```

## Symlink Patterns

Create symlinks from `.rulesync/` to source files:

```bash
# From .rulesync/commands/
ln -s ../../external/ag-shared/prompts/commands/git/bisect.md git-bisect.md
ln -s ../../external/prompts/commands/spruce-example.md spruce-example.md

# From .rulesync/subagents/
ln -s ../../external/ag-shared/prompts/agents/code-reviewer.md code-reviewer.md
ln -s ../../external/prompts/agents/visual-qa.md visual-qa.md

# From .rulesync/rules/
ln -s ../../external/ag-shared/prompts/guides/code-quality.md code-quality.md

# From .rulesync/skills/ (NOTE: skills use directory symlinks, not file symlinks)
ln -s ../../external/ag-shared/prompts/skills/estimate-jira/ estimate-jira
ln -s ../../external/prompts/skills/spruce-example/ spruce-example
```

## Verification

Run the verification script after changes:

```bash
./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh
```

This checks:

-   All frontmatter is valid
-   All symlinks resolve correctly
-   Generated output matches expected inventory

## Adding New Content

-   For repo-specific content that can be public, add directly in `.rulesync/` in the appropriate sub-folder.
-   For repo-specific content that is private, add in `external/prompts/` in the appropriate sub-folder, and symlink to `.rulesync/` in the appropriate sub-folder.
-   For shared content, add in `external/ag-shared/prompts/` in the appropriate sub-folder, and symlink to `.rulesync/` in the appropriate sub-folder.

## Troubleshooting

### YAML Parse Errors

-   Check for unquoted colons in description fields
-   Ensure proper indentation (2 spaces)
-   Validate with `npx yaml-lint <file>`

### Missing Files in Output

-   Verify symlink targets exist
-   Check frontmatter has required `targets` field
-   Ensure file extension is `.md`

### Verification Failures

-   Run `rulesync generate -t claudecode` manually to see detailed errors
-   Check temp directory output for comparison
