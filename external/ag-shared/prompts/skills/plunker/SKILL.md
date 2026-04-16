---
targets: ['*']
name: plunker
description: 'Create and manage Plunker (plnkr.co) code examples for AG Charts and AG Grid. Use this skill whenever the user mentions plunker, plnkr, or plunk, wants to create a shareable code demo or bug reproduction, needs to fork or modify an existing plunk, or asks for a live code example they can share via URL. This includes creating repros for JIRA tickets, building demos for stakeholders, downloading plunks to inspect them, or making any interactive code example hosted on plnkr.co. Also trigger when users ask for "a shareable example", "a repro", "a demo I can send", or "a live example" — even without explicitly saying "plunker".'
context: fork
---

# Plunker Guide

This guide covers working with Plunker for creating and sharing code examples.

## Product Detection

Detect the product from the repository context:

- **AG Charts**: repos containing `ag-charts-community` — read `ag-charts-guide.md`
- **AG Grid**: repos containing `ag-grid-community` — read `ag-grid-guide.md`
- **AG Studio**: repos containing `ag-studio-core` — read `ag-studio-guide.md`

Read the appropriate product guide **before** creating or modifying any plunker files. The guide contains the correct CDN URLs, HTML structure, package names, and styling.

## Framework Preference

**Always create plunkers in vanilla JavaScript unless:**

-   The user explicitly requests a specific framework (Angular, React, Vue)
-   The bug/feature is framework-specific and cannot be reproduced in vanilla JS

**When given a framework example (e.g., Angular) for a bug:**

1. Convert it to vanilla JS before using or creating a repro
2. Only keep the framework version if the issue is framework-specific

Vanilla JS is preferred because it's simpler, loads faster, needs no build system, and most bugs reproduce without framework wrappers.

## Plan Mode

When creating a plan that involves building or modifying a plunker, the plan **must explicitly state** that the `/plunker` skill will be invoked before writing any files. Do not assume the skill will be used implicitly — name it directly, e.g.:

> "Invoke `/plunker` skill to load the product guide before writing any files."

This ensures the implementation step uses the correct CDN URLs, CSS, and API patterns from the skill guide rather than relying on training data.

## Workflows

### Create a New Plunker

1. Create a working directory: `PLNKR_DIR=$(mktemp -d /tmp/plnkr-new-XXXXXX)`
2. **Verify API options** — before writing any code, verify every API option against the product's public types package and find a working example that uses the same feature. Training data is unreliable for AG product APIs. Do not guess.
3. Copy the CSS asset: `cp "<skill-base-directory>/assets/ag-example-styles.css" "$PLNKR_DIR/ag-example-styles.css"`
4. Write remaining files per the product-specific guide (index.html, main.js, package.json, etc.)
5. Upload:
   ```bash
   bash "<skill-base-directory>/plnkr.sh" upload "$PLNKR_DIR" --title "Example Title"
   ```
6. Parse output for `URL=` — the shareable link.

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

## Plnkr URL Formats

Use these when sharing links or loading existing content:

| Purpose | URL Pattern |
|---------|-------------|
| Editor + preview | `https://plnkr.co/edit/<plunk-id>?preview` |
| Embed (iframe-friendly) | `https://embed.plnkr.co/<plunk-id>` |
| Load a GitHub Gist (editor) | `https://plnkr.co/edit/gist:<gist-id>?preview` |
| Load a GitHub Gist (embed) | `https://embed.plnkr.co/gist/<gist-id>` |

The gist must contain an `index.html` file. Plnkr reads the gist files directly — no upload needed.

## API Notes

-   No true fork endpoint — "fork" = download + modify + upload as new.
-   Access tokens are short-lived JWTs; the script manages them internally.
-   Only the plunk creator can update (using the private token from creation).

## Quick Checklist — Do NOT Rely on Training Data

These rules apply to all products. Training data will lead you astray.

1. **Verify every API option** — check the product's public types package to confirm option names, nesting, and value shapes BEFORE writing code. If unsure, find a working example in the product's docs examples directory. Do NOT guess option names from training data — they are frequently wrong.
2. **UMD bundle via `<script>`** — NOT ESM `import`. Use the CDN URLs from the product-specific guide.
3. **No description elements** — no `<h1>`, `<p>`, or explanatory text in the HTML body.
4. **Follow the product guide** — each guide contains the exact HTML structure, CDN URLs, UMD globals, package.json format, and product-specific patterns. Do not improvise.

## Product-Specific Guide

Use the **Product Detection** section above to identify which guide to read. Product guides contain critical details (UMD globals, module registration rules, inline handler patterns) that differ between products.
