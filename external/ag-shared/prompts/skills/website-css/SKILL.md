---
targets: ['*']
name: website-css
description: 'CSS architecture, design system, design tokens, utility classes, and styling patterns for AG product websites'
---

# Website CSS & Styling

This skill provides the CSS architecture, design system, and styling patterns for AG product websites.

## Critical Rules

These rules apply to **every** SCSS/CSS file edit:

1. **Always import the design system:** `@use 'design-system' as *;` at the top of SCSS files
2. **Use semantic variables** (`--color-bg-primary`) — never raw colours (`--color-gray-50`) or hardcoded hex values
3. **Dark mode uses `data-dark-mode`:** Use `#{$selector-darkmode} &` in SCSS or `[data-dark-mode='true']` in CSS. Never use `prefers-color-scheme`
4. **Prefer standard utility classes** over custom styles (layout, typography, colour classes)
5. **SCSS modules for components:** Use `.module.scss` files with `@use 'design-system' as *`
6. **Test both light and dark modes** for any visual changes

## Sub-Documents

Load based on what you need:

| Document | Purpose | When to Load |
|----------|---------|-------------|
| `colour-palette.md` | Grey, brand, warning, and special colour variables | Choosing colours or checking values |
| `design-tokens.md` | Spacing, breakpoints, typography, layout, radius, shadows | Using spacing, responsive breakpoints, or typography tokens |
| `utility-classes.md` | Layout grid, typography, colour, and interaction utility classes | Using or choosing standard classes |
| `dark-mode.md` | Dark mode patterns, SCSS/CSS/JS approaches, theme-aware components | Implementing dark mode support |

## Design System Location

```
external/ag-website-shared/src/design-system/
```

| File | Purpose |
|------|---------|
| `_root.scss` | All CSS custom properties (colours, typography, layout, shadows) |
| `core/_variables.scss` | SCSS variables (spacing, selectors, transitions) |
| `core/_breakpoints.scss` | Responsive breakpoint values |
| `_layout.scss` | Layout utility classes |
| `_typography.scss` | Typography utility classes |
| `_color.scss` | Colour utility classes |
| `_interactions.scss` | Interactive state classes |
| `_base.scss` | Base element styles |

## Creating Custom Page Styles

Only create custom styles when standard classes don't meet your needs. Create SCSS modules in `packages/<website-package>/src/pages-styles/`:

```scss
// my-page.module.scss
@use 'design-system' as *;

.heroSection {
    padding-top: $spacing-size-16;
    background-color: var(--color-bg-site-header);

    // Dark mode support
    #{$selector-darkmode} & {
        background-color: var(--color-bg-secondary);
    }

    // Responsive
    @media screen and (min-width: $breakpoint-hero-large) {
        padding-top: $spacing-size-24;
    }
}
```

## Using Styles in Astro

```astro
---
import styles from '@pages-styles/my-page.module.scss';
import classnames from 'classnames';
---

<div class={styles.pageContainer}>
    <section class:list={[styles.heroSection, 'layout-max-width-small']}>
        <h1 class="text-2xl">Title</h1>
    </section>
</div>
```
