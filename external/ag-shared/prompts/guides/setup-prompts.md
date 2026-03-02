---
globs: ['**/setup-prompts/**/*', '**/patches/rulesync*']
alwaysApply: false
---

# Setup Prompts Script Guide

This guide covers the `setup-prompts.sh` script and rulesync patching.

## Overview

The `setup-prompts.sh` script (`external/ag-shared/scripts/setup-prompts/setup-prompts.sh`) detects installed AI coding tools and generates configuration using rulesync.

## Rulesync Patches

Patches are stored in `external/ag-shared/prompts/patches/` and symlinked from `patches/` for `patch-package` to apply them.

### Symlink Handling Fix

Rulesync's `findFilesByGlobs()` function uses `item.isDirectory()` and `item.isFile()` to filter results, but these return `false` for symlinks - even when the symlink target is a directory/file.

**Symptom**: Skills, commands, or subagents that are symlinks in `.rulesync/` don't appear in the generated output (e.g., `.claude/skills/`).

**Diagnosis**:

```bash
# Check if symlinks are being detected as directories
node -e "
const { globSync } = require('glob');
const items = globSync('.rulesync/skills/*', { withFileTypes: true });
items.forEach(item => {
  console.log(item.name, 'isDir:', item.isDirectory(), 'isSymlink:', item.isSymbolicLink());
});
"
```

**Fix**: The rulesync patch must check `item.isSymbolicLink()` and use `statSync()` to determine the target type:

```javascript
case "dir":
  return validItems.filter((item) => {
    if (item.isDirectory()) return true;
    if (item.isSymbolicLink()) {
      try {
        return statSync(join(item.parentPath, item.name)).isDirectory();
      } catch {
        return false;
      }
    }
    return false;
  }).map((item) => join(item.parentPath, item.name));
```

## Patching `fromRulesyncSkill()` for New Frontmatter Fields

Rulesync's `fromRulesyncSkill()` methods explicitly construct new frontmatter objects, picking only known fields (`name`, `description`, tool-specific extras). The `looseObject` schema preserves unknown fields through _parsing_, but the conversion code discards them. To propagate a rulesync-level field to tool-specific output, you must patch each tool's `fromRulesyncSkill()` — there is no passthrough.

Tool-specific skill classes with `fromRulesyncSkill()`:

- **ClaudecodeSkill** — extracts `name`, `description`, `allowed-tools`
- **CursorSkill** — extracts `name`, `description`
- **CopilotSkill** — extracts `name`, `description`, `license`
- **SimulatedSkill** (AgentsmdSkill, FactorydroidSkill) — extracts `name`, `description` via `fromRulesyncSkillDefault()`

## Skill Invocability (`disable-model-invocation`)

`disable-model-invocation: true` is a de facto standard shared by Claude Code, Cursor, and GitHub Copilot (VS Code agent). It is NOT part of the Agent Skills open standard (agentskills.io).

| Tool | Supports per-skill invocation control? | Mechanism |
|------|----------------------------------------|-----------|
| Claude Code | Yes | `disable-model-invocation: true` in SKILL.md |
| Cursor | Yes | `disable-model-invocation: true` in SKILL.md |
| GitHub Copilot | Yes (VS Code agent) | `disable-model-invocation: true` in SKILL.md |
| Codex CLI | Yes (different) | `allow_implicit_invocation: false` in agents yaml |
| Gemini CLI / Cline / OpenCode | No | No per-skill control |

In rulesync source files, use `invocable: user-only` — the patched `fromRulesyncSkill()` methods translate this to `disable-model-invocation: true` for Claude Code, Cursor, and Copilot.

## AGENTS.md Handling

The `--postinstall` flag triggers `stash_agents_md()` and `restore_agents_md()` functions which:

1. Stash any local AGENTS.md changes before rulesync runs
2. Reset AGENTS.md to HEAD after rulesync completes
3. Re-apply the stashed changes

This prevents rulesync from creating noise in AGENTS.md while preserving intentional user edits.

## Regenerating Patches

After modifying `node_modules/rulesync/dist/index.js`:

```bash
npx patch-package rulesync
```

This updates `patches/rulesync+*.patch` (which symlinks to `external/ag-shared/prompts/patches/`).

## Verify-rulesync Skill File Patterns

`verify-rulesync.sh` builds an expected file inventory and content-verifies each file. Skill directories can contain arbitrary `.md` resource files (templates, page guides) beyond `SKILL.md`, `_*.md` helpers, and `*.sh` scripts. Both `build_expected_inventory()` and `verify_content()` must glob `*.md` (excluding `SKILL.md`) rather than `_*.md` to capture all of them.

## Shared Prompt Conventions

When using the inverted reference pattern (shared core + thin wrapper), follow these rules to avoid silent breakage.

### Section names are normative contracts

Heading names in the wrapper are referenced by exact name in the core. Adding suffixes like `(REQUIRED)` or other annotations to heading text in templates or guides will break the exact-name contract silently at runtime. Treat section headings as API identifiers — rename them only with the same care as renaming a function.

### Preserve executable content during genericisation

When migrating product-specific prompts to shared cores, bash scripts and procedural subsections are often generic despite appearing product-specific (they only contain path references that can be parameterised). Always diff the original vs genericised output section-by-section to catch accidentally dropped content.
