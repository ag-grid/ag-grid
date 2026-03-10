---
targets: ['*']
name: plunker
description: 'Create and manage Plunker (plnkr.co) code examples. Use when working with plnkr.co URLs, creating shareable code demos, forking existing plunks, or troubleshooting Plunker structure issues.'
context: fork
---

# Plunker Guide

This guide covers working with Plunker for creating and sharing code examples.

## Framework Preference

**Always create plunkers in vanilla JavaScript unless:**

-   The user explicitly requests a specific framework (Angular, React, Vue)
-   The bug/feature is framework-specific and cannot be reproduced in vanilla JS

**When given a framework example (e.g., Angular) for a bug:**

1. Convert it to vanilla JS before using or creating a repro
2. Only keep the framework version if the issue is framework-specific

**Rationale:**

-   Vanilla JS examples are simpler and load faster
-   They work without framework dependencies or build systems
-   Easier to debug and share
-   Framework wrappers are thin - most bugs reproduce in vanilla JS

## Plan Mode

When creating a plan that involves building or modifying a plunker, the plan **must explicitly state** that the `/plunker` skill will be invoked before writing any files. Do not assume the skill will be used implicitly — name it directly, e.g.:

> "Invoke `/plunker` skill to load the AG Charts guide before writing any files."

This ensures the implementation step uses the correct axis format, CDN URLs, CSS, and API patterns from the skill guide rather than relying on training data.

## Workflows

### Create a New Plunker

1. Create a working directory: `PLNKR_DIR=$(mktemp -d /tmp/plnkr-new-XXXXXX)`
2. Write files per the product-specific guide (index.html, main.js, etc.)
3. Upload:
   ```bash
   bash "<skill-base-directory>/plnkr.sh" upload "$PLNKR_DIR" --title "Example Title"
   ```
4. Parse output for `URL=` — the shareable link.

### Fork/Modify an Existing Plunker

1. Download:
   ```bash
   bash "<skill-base-directory>/plnkr.sh" download <plunk-id-or-url>
   ```
2. Parse output for `DIR=` — the local directory.
3. Read and modify files using standard file tools.
4. Upload modified version:
   ```bash
   bash "<skill-base-directory>/plnkr.sh" upload "$DIR" --title "Modified: Original Title"
   ```

### Read-Only Inspection

1. Download: `bash "<skill-base-directory>/plnkr.sh" download <id-or-url> [dir]`
2. Read files from the output directory.

## Script Reference

| Command | Args | Output |
|---------|------|--------|
| `download` | `<id-or-url> [output-dir]` | `DIR=`, `ID=`, `DESCRIPTION=`, `FILES=` |
| `upload` | `<dir> [--title T] [--tags a,b]` | `ID=`, `URL=` |

Errors: `ERROR=<message>` on stderr, exit code 1.

`--title`/`--tags` default to values from `.plnkr-meta.json` (written by download).

## API Notes

-   No true fork endpoint — "fork" = download + modify + upload as new.
-   Access tokens are short-lived JWTs; the script manages them internally.
-   Only the plunk creator can update (using the private token from creation).

## Product-Specific Guide

Read all `*-guide.md` files in this skill directory for product-specific
example structure, required files, CDN URLs, and styling requirements.
