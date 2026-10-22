---
targets: ['*']
description: 'Creating and maintaining documentation pages for AG Grid'
globs: ['documentation/**/*.mdoc', 'documentation/**/*.md']
---

# Documentation Pages Guide

This guide covers creating and maintaining documentation pages for AG Grid.

## Overview

Documentation is located in `documentation/ag-grid-docs/` and uses Astro with Markdoc for content.

## Page Structure

```
documentation/ag-grid-docs/src/content/docs/
├── feature-category/
│   ├── index.mdoc           # Category overview
│   ├── specific-feature/
│   │   ├── index.mdoc       # Feature documentation
│   │   └── _examples/       # Feature examples
```

## Language Conventions

- **Documentation text**: UK/British English (e.g., "colour", "behaviour")
- **API option names**: US English (e.g., "color", "behavior")
- **Comments and JSDocs**: UK/British English

## Creating New Pages

1. Create the `.mdoc` file in the appropriate directory
2. Add frontmatter with title and description
3. Write content following existing patterns
4. Add examples in `_examples/` if needed
5. Update navigation in `nav.json` if required

## Frontmatter

```yaml
---
title: Feature Name
description: Brief description of the feature
---
```

## Content Guidelines

1. Start with a brief introduction
2. Use progressive disclosure - simple concepts first
3. Include code examples for all features
4. Link to related documentation
5. Keep paragraphs concise

## Keep Claims and Links True to the Change

Automated review keeps flagging docs that drift from the code change they ship with. Before review:

- Grep the docs and the option's JSDoc for the feature, and update every passage that describes the old behaviour.
- Check each absolute claim ("every", "never", "always", "prevents") against the code, and name the exceptions the change keeps or adds.
- When you rename or remove a heading, or renumber sections, grep the whole repo for links to the old anchor (`#old-anchor`), including JSDoc links in `packages/*/src`, and grep `documentation/` for cross-references to the old numbers. Update every match.

## Reference Component Descriptions

The `interfaceDocumentation` and `apiDocumentation` components generate a default intro line from the interface name (e.g. *"Properties available on the `X` interface."*). This is a text string rendered above the interface table, **not** a heading — it does not create a section title or a navigable entry in the page's table of contents.

- Omit `config` to accept the generated default intro line.
- Write a `description` **only** when it adds real context beyond the interface name.
- Add an explicit `###` subheading with the interface name above each component when an API Reference section documents more than one interface.

## Image Conventions

The `imageCaption` and `image` markdoc components automatically pick up a `*-dark.{ext}` sibling next to the referenced image. For an `imageCaption imagePath="resources/foo.png"`, if `resources/foo-dark.png` exists it is loaded automatically when the docs site is in dark mode — no separate `mdoc` reference is needed.

Do not flag a `*-dark.{ext}` file as "unused" if its light-mode sibling is referenced — it is wired by naming convention.

Do not flag the _absence_ of a dark mode image as an error, not all images require dark mode versions.

## Validation

Test documentation changes:

```bash
# Start dev server
yarn nx dev

# Run E2E tests (chromium only, bypasses Nx)
./docs-e2e.sh feature-category
```
