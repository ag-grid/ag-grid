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

## Validation

Test documentation changes:

```bash
# Start dev server
yarn nx dev

# Run E2E tests (chromium only, bypasses Nx)
./docs-e2e.sh feature-category
```
