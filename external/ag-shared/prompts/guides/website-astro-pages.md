---
targets: ['*']
description: 'Astro page conventions for AG product websites — loads /website-astro skill for details'
globs:
    [
        '**/src/pages/**/*.astro',
        '**/src/layouts/**/*.astro',
    ]
---

# Website Astro Page Conventions

When editing `.astro` files for AG product websites, follow these conventions:

1. **Import Layout** for standard pages: `import Layout from '@layouts/Layout.astro';`
2. **Page file path = URL**: `pages/pricing.astro` → `/pricing`
3. **Use content collections** for data: `import { getEntry } from 'astro:content';`
4. **Hydrate React components** with `client:load` (or `client:idle` / `client:visible`)
5. **Import order**: Astro → external → shared (`@ag-website-shared/*`) → local → styles
6. **Naming**: pages kebab-case, components PascalCase, styles `.module.scss`, CSS classes camelCase

For full reference (6 page patterns, component catalog, content collection recipes), load the `/website-astro` skill.
