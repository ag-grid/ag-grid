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

## Shared Prompt Conventions

When using the inverted reference pattern (shared core + thin wrapper), follow these rules to avoid silent breakage.

### Section names are normative contracts

Heading names in the wrapper are referenced by exact name in the core. Adding suffixes like `(REQUIRED)` or other annotations to heading text in templates or guides will break the exact-name contract silently at runtime. Treat section headings as API identifiers — rename them only with the same care as renaming a function.

### Preserve executable content during genericisation

When migrating product-specific prompts to shared cores, bash scripts and procedural subsections are often generic despite appearing product-specific (they only contain path references that can be parameterised). Always diff the original vs genericised output section-by-section to catch accidentally dropped content.
