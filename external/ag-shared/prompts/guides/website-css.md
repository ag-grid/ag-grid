---
targets: ['*']
description: 'CSS styling conventions for AG product websites — loads /website-css skill for details'
globs:
    [
        '**/src/pages-styles/**/*.scss',
        '**/src/pages-styles/**/*.css',
        '**/src/components/**/*.scss',
        'external/ag-website-shared/src/design-system/**/*.scss',
    ]
---

# Website CSS Conventions

When editing SCSS/CSS files for AG product websites, follow these rules:

1. **Always import the design system:** `@use 'design-system' as *;`
2. **Use semantic variables** (`--color-bg-primary`) — never raw palette variables or hex values
3. **Dark mode uses `data-dark-mode`:** `#{$selector-darkmode} &` in SCSS. Never `prefers-color-scheme`
4. **Prefer standard utility classes** (`.layout-grid`, `.text-xl`, `.text-secondary`) over custom styles
5. **SCSS modules for components:** `.module.scss` files
6. **Test both light and dark modes**

For full reference (colour palettes, design tokens, utility class catalog, dark mode patterns), load the `/website-css` skill.
